import type { APIRoute } from "astro";
import { FavoriteRepository } from "../../lib/server/FavoriteRepository";
import { getUserSession } from "../../lib/userSession";
import { json, readJsonBody } from "../../lib/security/http";
import { RATE_LIMITS, checkRateLimit } from "../../lib/security/rateLimit";
import { isValidIdentifier } from "../../lib/security/validation";

export const GET: APIRoute = async ({ cookies }) => {
  const session = getUserSession(cookies);

  if (!session) {
    return json([]);
  }

  const favorites = await FavoriteRepository.getFavorites(session.id);

  return json(favorites);
};

/**
 * Alta y baja comparten comprobaciones: sesión válida, límite de peticiones e
 * identificador de producto con la forma esperada.
 */
async function handleFavoriteChange(
  request: Request,
  cookies: Parameters<typeof getUserSession>[0],
  action: "add" | "remove",
) {
  const session = getUserSession(cookies);

  if (!session) {
    return json({ ok: false, message: "No autorizado" }, 401);
  }

  const limit = checkRateLimit(session.id, RATE_LIMITS.favorites);

  if (!limit.allowed) {
    return json({ ok: false, message: "Demasiadas peticiones." }, 429, {
      "Retry-After": String(limit.retryAfterSeconds),
    });
  }

  const body = await readJsonBody<{ productId?: unknown }>(request);

  if (!body || !isValidIdentifier(body.productId)) {
    return json({ ok: false, message: "Producto no válido." }, 400);
  }

  if (action === "add") {
    await FavoriteRepository.addFavorite(session.id, body.productId);
  } else {
    await FavoriteRepository.removeFavorite(session.id, body.productId);
  }

  return json({ ok: true });
}

export const POST: APIRoute = async ({ request, cookies }) =>
  handleFavoriteChange(request, cookies, "add");

export const DELETE: APIRoute = async ({ request, cookies }) =>
  handleFavoriteChange(request, cookies, "remove");
