/**
 * Cabeceras de seguridad aplicadas a todas las respuestas desde el middleware.
 *
 * Se definen aquí, y no en `vercel.json`, por dos motivos: cubren también las
 * rutas de API (que en Vercel se sirven como funciones) y se pueden probar en
 * local con `astro dev` exactamente igual que en producción.
 */

const isProduction = () => import.meta.env.PROD === true;

/**
 * Content-Security-Policy.
 *
 * `script-src 'self'` exige que en el HTML no quede JavaScript en línea. Para
 * eso hicieron falta tres cosas, y las tres deben mantenerse:
 *
 *   1. Ningún atributo `onclick=` en las plantillas (se usa delegación de
 *      eventos en su lugar).
 *   2. Ningún `<script define:vars>`, que Astro obliga a dejar en línea; los
 *      datos se pasan por atributos `data-`.
 *   3. `assetsInlineLimit: 0` en `astro.config.mjs`. Sin eso Astro incrusta en
 *      el HTML los scripts empaquetados pequeños, el navegador los bloquea y
 *      formularios como el de login dejan de funcionar en producción.
 *
 * `style-src` sí necesita `'unsafe-inline'`: aunque las hojas ya no se
 * incrustan, varios componentes usan atributos `style=` para las imágenes de
 * producto, y la CSP los cubre con esa misma directiva.
 */
function contentSecurityPolicy(): string {
  const directives: Record<string, string[]> = {
    "default-src": ["'self'"],
    "script-src": ["'self'"],
    "style-src": ["'self'", "'unsafe-inline'"],
    "img-src": ["'self'", "https:", "data:", "blob:"],
    "font-src": ["'self'", "data:"],
    "connect-src": ["'self'"],
    // El pago se hace redirigiendo a Checkout de Stripe, no en un iframe.
    "frame-src": ["'none'"],
    "object-src": ["'none'"],
    // Impide que otra web incruste la tienda para hacer clickjacking.
    "frame-ancestors": ["'none'"],
    // Los formularios solo pueden enviarse a nuestro propio dominio.
    "form-action": ["'self'"],
    "base-uri": ["'self'"],
    "manifest-src": ["'self'"],
    "worker-src": ["'self'", "blob:"],
  };

  if (isProduction()) {
    directives["upgrade-insecure-requests"] = [];
  } else {
    // El servidor de desarrollo de Astro necesita scripts en línea, `eval` y
    // un WebSocket para el recargado en caliente y la barra de herramientas.
    directives["script-src"].push("'unsafe-inline'", "'unsafe-eval'");
    directives["connect-src"].push("ws:", "wss:");
    directives["frame-src"] = ["'self'"];
  }

  return Object.entries(directives)
    .map(([directive, values]) => (values.length ? `${directive} ${values.join(" ")}` : directive))
    .join("; ");
}

export function applySecurityHeaders(response: Response, pathname: string): Response {
  const headers = response.headers;

  headers.set("Content-Security-Policy", contentSecurityPolicy());

  // Evita que el navegador adivine el tipo de contenido: un fichero subido que
  // el servidor declare como texto no puede acabar ejecutándose como script.
  headers.set("X-Content-Type-Options", "nosniff");

  // Respaldo para navegadores antiguos que no entienden `frame-ancestors`.
  headers.set("X-Frame-Options", "DENY");

  // No filtramos la URL completa (que puede llevar identificadores de pedido)
  // a sitios externos como Instagram o WhatsApp.
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  // Ninguna página necesita cámara, micrófono, ubicación ni pagos del navegador.
  headers.set(
    "Permissions-Policy",
    [
      "accelerometer=()",
      "autoplay=()",
      "camera=()",
      "display-capture=()",
      "encrypted-media=()",
      "fullscreen=(self)",
      "geolocation=()",
      "gyroscope=()",
      "magnetometer=()",
      "microphone=()",
      "midi=()",
      "payment=()",
      "usb=()",
      "interest-cohort=()",
    ].join(", "),
  );

  // Aísla la ventana de otras pestañas que pudieran abrirla.
  headers.set("Cross-Origin-Opener-Policy", "same-origin");
  headers.set("Cross-Origin-Resource-Policy", "same-origin");

  headers.set("X-Permitted-Cross-Domain-Policies", "none");
  headers.set("Origin-Agent-Cluster", "?1");

  if (isProduction()) {
    // Un año de HSTS con subdominios. Súbelo a `preload` solo cuando estés
    // segura de que ningún subdominio necesitará servirse por HTTP.
    headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  }

  // Nada que dependa de la sesión debe quedar en la caché del CDN o del navegador.
  const isSensitive =
    pathname.startsWith("/api") ||
    pathname.startsWith("/perfil") ||
    pathname.startsWith("/pedido") ||
    pathname.startsWith("/pedidos") ||
    pathname.startsWith("/success");

  if (isSensitive && !headers.has("Cache-Control")) {
    headers.set("Cache-Control", "no-store, max-age=0");
  }

  return response;
}
