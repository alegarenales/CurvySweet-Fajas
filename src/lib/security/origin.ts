import { serverEnv } from "./secrets";

/**
 * Comprobación de origen para las peticiones que cambian estado (CSRF).
 *
 * La primera versión comparaba el `Origin` contra el host de `request.url`. En
 * Vercel eso no funciona: la petición llega a la función a través del proxy y
 * el host que ve el servidor no es el del navegador, de modo que se rechazaban
 * todos los envíos legítimos, incluido el del formulario de login.
 *
 * Ahora la lista de orígenes válidos se construye a partir de la configuración
 * del despliegue, no de lo que diga la petición. Además de arreglar el fallo,
 * es más seguro: `Host` y `X-Forwarded-Host` son cabeceras que en algunos
 * montajes puede manipular quien llama, así que validar contra ellas es
 * validar contra el propio atacante.
 */

/** Fuentes de configuración. Vercel define las tres variables `VERCEL_*`. */
const HOST_ENV_VARS = [
  "PUBLIC_SITE_URL",
  "SITE",
  "VERCEL_PROJECT_PRODUCTION_URL",
  "VERCEL_BRANCH_URL",
  "VERCEL_URL",
  // Escotilla de escape: dominios extra separados por comas, por si en el
  // futuro se sirve la tienda desde otro sitio.
  "ALLOWED_ORIGINS",
] as const;

function toHost(value: string): string | null {
  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  try {
    // Las variables de Vercel llegan sin protocolo (`mi-app.vercel.app`).
    const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    return new URL(withProtocol).host.toLowerCase();
  } catch {
    return null;
  }
}

let cachedHosts: Set<string> | null = null;

function getAllowedHosts(): Set<string> {
  if (cachedHosts) {
    return cachedHosts;
  }

  const hosts = new Set<string>();

  for (const name of HOST_ENV_VARS) {
    const raw = serverEnv(name) ?? (name === "SITE" ? import.meta.env.SITE : undefined);

    if (typeof raw !== "string") {
      continue;
    }

    for (const part of raw.split(",")) {
      const host = toHost(part);

      if (host) {
        hosts.add(host);
      }
    }
  }

  if (!import.meta.env.PROD) {
    hosts.add("localhost");
  }

  cachedHosts = hosts;

  return hosts;
}

function isAllowedHost(host: string): boolean {
  const normalized = host.toLowerCase();
  const allowed = getAllowedHosts();

  if (allowed.has(normalized)) {
    return true;
  }

  // En desarrollo el puerto cambia según cómo se arranque el servidor.
  if (!import.meta.env.PROD && /^(localhost|127\.0\.0\.1|\[::1\]):\d+$/.test(normalized)) {
    return true;
  }

  // Despliegues de vista previa del mismo proyecto en Vercel: comparten el
  // sufijo del dominio de producción configurado.
  for (const candidate of allowed) {
    if (candidate.endsWith(".vercel.app") && normalized.endsWith(".vercel.app")) {
      const project = candidate.split(".")[0];

      if (project && normalized.startsWith(`${project}-`)) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Devuelve `true` si la petición puede cambiar estado.
 *
 * Sin `Origin` ni `Referer` se deja pasar: hay clientes legítimos que no envían
 * ninguna de las dos, y en ese caso siguen actuando las demás defensas
 * (cookies `SameSite=Lax` y sesión firmada).
 */
export function hasValidOrigin(request: Request): boolean {
  const source = request.headers.get("origin") ?? request.headers.get("referer");

  if (!source) {
    return true;
  }

  let host: string;

  try {
    host = new URL(source).host;
  } catch {
    return false;
  }

  if (isAllowedHost(host)) {
    return true;
  }

  // Se registra para que, si alguna vez vuelve a rechazarse algo legítimo, en
  // los registros de Vercel se vea el origen recibido y la lista aceptada.
  console.warn("Petición rechazada por origen no permitido.", {
    origenRecibido: host,
    origenesPermitidos: [...getAllowedHosts()],
  });

  return false;
}
