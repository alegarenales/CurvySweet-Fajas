import type { APIRoute } from "astro";
import { getUserSession } from "../../lib/userSession";
import { ProductRepository } from "../../repositories/ProductRepository";
import { ReviewRepository } from "../../repositories/ReviewRepository";
import { json, readJsonBody } from "../../lib/security/http";
import { RATE_LIMITS, checkRateLimit } from "../../lib/security/rateLimit";
import { cleanText, isValidIdentifier } from "../../lib/security/validation";

const COMMENT_MIN_LENGTH = 8;
const COMMENT_MAX_LENGTH = 600;

function normalizeRating(value: unknown) {
  const rating = Number(value);
  return Number.isInteger(rating) && rating >= 1 && rating <= 5 ? rating : null;
}

export const GET: APIRoute = async ({ url, cookies }) => {
  const productId = url.searchParams.get("productId")?.trim() ?? "";

  if (!isValidIdentifier(productId)) {
    return json({ ok: false, message: "Producto no válido." }, 400);
  }

  const product = await ProductRepository.getProductById(productId);

  if (!product) {
    return json({ ok: false, message: "Producto no encontrado." }, 404);
  }

  const session = getUserSession(cookies);
  const [reviews, summary, hasPurchased, hasReviewed] = await Promise.all([
    ReviewRepository.getReviews(productId),
    ReviewRepository.getAverageRating(productId),
    session ? ReviewRepository.hasPurchased(session.id, productId, product.stripePriceId) : false,
    session ? ReviewRepository.hasReviewed(session.id, productId) : false,
  ]);

  return json({
    ok: true,
    reviews,
    average: summary.Media ?? 0,
    total: summary.Total ?? 0,
    hasSession: Boolean(session),
    hasPurchased,
    hasReviewed,
    canReview: Boolean(session && hasPurchased),
  });
};

export const POST: APIRoute = async ({ request, cookies }) => {
  const session = getUserSession(cookies);

  if (!session) {
    return json({ ok: false, message: "Debes iniciar sesión para comentar." }, 401);
  }

  // Evita que una cuenta sola inunde de reseñas la tienda.
  const limit = checkRateLimit(session.id, RATE_LIMITS.review);

  if (!limit.allowed) {
    return json({ ok: false, message: "Demasiados comentarios seguidos. Espera un momento." }, 429, {
      "Retry-After": String(limit.retryAfterSeconds),
    });
  }

  const body = await readJsonBody<{ productId?: unknown; rating?: unknown; comment?: unknown }>(
    request,
  );

  if (!body) {
    return json({ ok: false, message: "Petición inválida." }, 400);
  }

  const productId = String(body.productId ?? "").trim();
  const rating = normalizeRating(body.rating);
  const comment = cleanText(body.comment, COMMENT_MAX_LENGTH);

  if (!isValidIdentifier(productId) || rating === null || !comment) {
    return json({ ok: false, message: "Datos incompletos." }, 400);
  }

  if (comment.length < COMMENT_MIN_LENGTH || comment.length > COMMENT_MAX_LENGTH) {
    return json(
      {
        ok: false,
        message: `El comentario debe tener entre ${COMMENT_MIN_LENGTH} y ${COMMENT_MAX_LENGTH} caracteres.`,
      },
      400,
    );
  }

  const product = await ProductRepository.getProductById(productId);

  if (!product) {
    return json({ ok: false, message: "Producto no encontrado." }, 404);
  }

  const hasPurchased = await ReviewRepository.hasPurchased(
    session.id,
    productId,
    product.stripePriceId,
  );

  if (!hasPurchased) {
    return json(
      {
        ok: false,
        message: "Solo puedes comentar productos que hayas comprado.",
      },
      403
    );
  }

  if (await ReviewRepository.hasReviewed(session.id, productId)) {
    await ReviewRepository.updateReview(session.id, productId, rating, comment);
  } else {
    await ReviewRepository.addReview(session.id, productId, rating, comment);
  }

  const [reviews, summary] = await Promise.all([
    ReviewRepository.getReviews(productId),
    ReviewRepository.getAverageRating(productId),
  ]);

  return json({
    ok: true,
    reviews,
    average: summary.Media ?? 0,
    total: summary.Total ?? 0,
    hasSession: true,
    hasPurchased: true,
    hasReviewed: true,
    canReview: true,
  });
};
