import { defineMiddleware } from "astro:middleware";
import { getAdminSession } from "./lib/admin";
import { readAdminState } from "./lib/admin-state";
import { applySecurityHeaders } from "./lib/security/headers";
import { getClientIp } from "./lib/security/http";
import { hasValidOrigin } from "./lib/security/origin";
import { RATE_LIMITS, checkRateLimit } from "./lib/security/rateLimit";

const bypassPrefixes = ["/api", "/_astro", "/favicon", "/curvysweet.ico"];

/** Métodos que la aplicación usa. Cualquier otro se rechaza de entrada. */
const allowedMethods = new Set(["GET", "HEAD", "POST", "PATCH", "DELETE", "OPTIONS"]);

/** Métodos que cambian estado y por tanto necesitan comprobación de origen. */
const stateChangingMethods = new Set(["POST", "PATCH", "PUT", "DELETE"]);

/**
 * Rutas que reciben peticiones legítimas desde fuera del navegador y que por
 * tanto no llevan cabecera `Origin`. El webhook de Stripe se autentica con su
 * propia firma (`stripe-signature`), que se verifica en el endpoint.
 */
const externalCallerPrefixes = ["/api/webhooks/"];

function maintenanceResponse() {
  return new Response(
    `<!doctype html>
    <html lang="es">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" type="image/x-icon" href="/curvysweet.ico" />
        <title>CurvySweet en mantenimiento</title>
        <style>
          body {
            min-height: 100vh;
            margin: 0;
            display: grid;
            place-items: center;
            background: #0b0b0b;
            color: #fff;
            font-family: Arial, sans-serif;
          }
          main {
            width: min(92vw, 560px);
            border: 1px solid rgba(255,255,255,.16);
            border-radius: 12px;
            padding: 32px;
            background: #171717;
          }
          p { color: #c7c7c7; line-height: 1.7; }
        </style>
      </head>
      <body>
        <main>
          <h1>CurvySweet está en mantenimiento</h1>
          <p>Estamos ajustando la tienda. Vuelve en unos minutos.</p>
        </main>
      </body>
    </html>`,
    {
      status: 503,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    },
  );
}

export const onRequest = defineMiddleware(async (context, next) => {
  const url = new URL(context.request.url);
  const pathname = url.pathname;
  const method = context.request.method.toUpperCase();

  if (!allowedMethods.has(method)) {
    return applySecurityHeaders(
      new Response("Método no permitido.", { status: 405, headers: { Allow: "GET, POST" } }),
      pathname,
    );
  }

  if (
    stateChangingMethods.has(method) &&
    !externalCallerPrefixes.some((prefix) => pathname.startsWith(prefix)) &&
    !hasValidOrigin(context.request)
  ) {
    return applySecurityHeaders(
      new Response(JSON.stringify({ ok: false, message: "Origen no permitido." }), {
        status: 403,
        headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
      }),
      pathname,
    );
  }

  // Cortafuegos general de la API: protege contra el abuso automatizado antes
  // de tocar la base de datos. Cada endpoint sensible aplica además su propio
  // límite, mucho más estricto.
  if (pathname.startsWith("/api/")) {
    const globalLimit = checkRateLimit(getClientIp(context.request), RATE_LIMITS.api);

    if (!globalLimit.allowed) {
      return applySecurityHeaders(
        new Response(JSON.stringify({ ok: false, message: "Demasiadas peticiones." }), {
          status: 429,
          headers: {
            "Content-Type": "application/json; charset=utf-8",
            "Retry-After": String(globalLimit.retryAfterSeconds),
            "Cache-Control": "no-store",
          },
        }),
        pathname,
      );
    }
  }

  const inMaintenance =
    readAdminState().maintenance &&
    !getAdminSession(context.cookies) &&
    !bypassPrefixes.some((prefix) => pathname.startsWith(prefix));

  const response = inMaintenance ? maintenanceResponse() : await next();

  return applySecurityHeaders(response, pathname);
});
