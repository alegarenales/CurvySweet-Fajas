import type { APIRoute } from "astro";
import { getUserSession } from "../../lib/userSession";
import { ProductRepository } from "../../repositories/ProductRepository";
import { ReviewRepository } from "../../repositories/ReviewRepository";

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function normalizeRating(value: unknown) {
  const rating = Number(value);
  return Number.isInteger(rating) && rating >= 1 && rating <= 5 ? rating : null;
}

export const GET: APIRoute = async ({ url, cookies }) => {
  const productId = url.searchParams.get("productId")?.trim() ?? "";

  if (!productId) {
    return json({ ok: false, message: "Producto no válido." }, 400);
  }

  const product = await ProductRepository.getProductById(productId);

  if (!product) {
    return json({ ok: false, message: "Producto no encontrado." }, 404);
  }

  const session = await getUserSession(cookies);
  const [reviews, summary, hasPurchased, hasReviewed] = await Promise.all([
    ReviewRepository.getReviews(productId),
    ReviewRepository.getAverageRating(productId),
    session ? ReviewRepository.hasPurchased(session.id, productId) : false,
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
  const session = await getUserSession(cookies);

  if (!session) {
    return json({ ok: false, message: "Debes iniciar sesión para comentar." }, 401);
  }

  const body = await request.json().catch(() => ({}));
  const productId = String(body.productId ?? "").trim();
  const rating = normalizeRating(body.rating);
  const comment = String(body.comment ?? "").trim();

  if (!productId || rating === null || !comment) {
    return json({ ok: false, message: "Datos incompletos." }, 400);
  }

  if (comment.length < 8 || comment.length > 600) {
    return json({ ok: false, message: "El comentario debe tener entre 8 y 600 caracteres." }, 400);
  }

  const product = await ProductRepository.getProductById(productId);

  if (!product) {
    return json({ ok: false, message: "Producto no encontrado." }, 404);
  }

  const hasPurchased = await ReviewRepository.hasPurchased(session.id, productId);

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
