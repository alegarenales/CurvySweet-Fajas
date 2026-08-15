/**
 * Utilidades compartidas por los endpoints de la API.
 */

export function json(body: unknown, status = 200, headers: HeadersInit = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      // Ninguna respuesta de la API debe quedar cacheada por proxies o por el CDN.
      "Cache-Control": "no-store",
      ...headers,
    },
  });
}

/**
 * IP del cliente. En Vercel llega en `x-forwarded-for`; nos quedamos con el
 * primer valor, que es el que inserta el edge y no el cliente.
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");

  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }

  return (
    request.headers.get("x-real-ip")?.trim() ||
    request.headers.get("cf-connecting-ip")?.trim() ||
    "desconocida"
  );
}

/**
 * Lee el cuerpo JSON con un límite de tamaño, para que nadie pueda agotar la
 * memoria de la función enviando un cuerpo enorme.
 */
export async function readJsonBody<T = Record<string, unknown>>(
  request: Request,
  maxBytes = 64 * 1024,
): Promise<T | null> {
  const declaredLength = Number(request.headers.get("content-length") ?? 0);

  if (declaredLength > maxBytes) {
    return null;
  }

  const text = await request.text().catch(() => "");

  if (!text || text.length > maxBytes) {
    return null;
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

/**
 * Igual que `readJsonBody` pero para formularios.
 */
export async function readFormBody(
  request: Request,
  maxBytes = 64 * 1024,
): Promise<FormData | null> {
  const declaredLength = Number(request.headers.get("content-length") ?? 0);

  if (declaredLength > maxBytes) {
    return null;
  }

  try {
    return await request.formData();
  } catch {
    return null;
  }
}
