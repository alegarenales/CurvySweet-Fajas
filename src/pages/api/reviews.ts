import type { APIRoute } from "astro";
import { getUserSession } from "../../lib/userSession";
import { ReviewRepository } from "../../repositories/ReviewRepository";

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export const GET: APIRoute = async ({ url }) => {
  const productId = url.searchParams.get("productId")?.trim() ?? "";

  if (!productId) {
    return json({ ok: false, message: "Producto no válido." }, 400);
  }

  const reviews = await ReviewRepository.getReviews(productId);
  const summary = await ReviewRepository.getAverageRating(productId);

  return json({
    ok: true,
    reviews,
    average: summary.Media ?? 0,
    total: summary.Total ?? 0,
  });
};

export const POST: APIRoute = async ({ request, cookies }) => {
  const session = await getUserSession(cookies);

  if (!session) {
    return json({ ok: false, message: "Debes iniciar sesión." }, 401);
  }

  const body = await request.json().catch(() => ({}));

  const { productId, rating, comment } = body;

  if (!productId || !rating || !comment) {
    return json({ ok: false, message: "Datos incompletos." }, 400);
  }

  const purchased = await ReviewRepository.hasPurchased(
    session.id,
    productId
  );

  if (!purchased) {
    return json(
      {
        ok: false,
        message: "Solo puedes valorar productos que hayas comprado.",
      },
      403
    );
  }

  if (await ReviewRepository.hasReviewed(session.id, productId)) {
    await ReviewRepository.updateReview(
      session.id,
      productId,
      Number(rating),
      comment
    );
  } else {
    await ReviewRepository.addReview(
      session.id,
      productId,
      Number(rating),
      comment
    );
  }

  const reviews = await ReviewRepository.getReviews(productId);
  const summary = await ReviewRepository.getAverageRating(productId);

  return json({
    ok: true,
    reviews,
    average: summary.Media ?? 0,
    total: summary.Total ?? 0,
  });
};