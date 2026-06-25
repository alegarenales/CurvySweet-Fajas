import type { APIRoute } from "astro";
import { addProductReview, getReviewsForProduct, isValidProductId } from "../../lib/reviews";

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export const GET: APIRoute = async ({ url }) => {
  const productId = url.searchParams.get("productId")?.trim() ?? "";

  if (!isValidProductId(productId)) {
    return json({ ok: false, message: "Producto no valido." }, 400);
  }

  return json({ ok: true, reviews: getReviewsForProduct(productId) });
};

export const POST: APIRoute = async ({ request }) => {
  const body = await request.json().catch(() => ({}));

  try {
    const review = addProductReview({
      productId: body.productId,
      name: body.name,
      rating: body.rating,
      comment: body.comment,
    });

    return json({ ok: true, review, reviews: getReviewsForProduct(review.productId) }, 201);
  } catch (error) {
    return json(
      { ok: false, message: error instanceof Error ? error.message : "No se pudo guardar la resena." },
      400,
    );
  }
};
