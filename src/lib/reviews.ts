import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { products } from "./catalog";

export type ProductReviewEntry = {
  id: string;
  productId: string;
  name: string;
  rating: number;
  comment: string;
  createdAt: string;
};

export type ProductReviews = Record<string, ProductReviewEntry[]>;

const reviewsPath = join(process.cwd(), ".curvysweet", "product-reviews.json");
const productIds = new Set(products.map((product) => product.id));

function cleanText(value: unknown, maxLength: number) {
  return String(value ?? "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

export function isValidProductId(productId: string) {
  return productIds.has(productId);
}

export function readProductReviews(): ProductReviews {
  if (!existsSync(reviewsPath)) {
    return {};
  }

  try {
    const parsed = JSON.parse(readFileSync(reviewsPath, "utf-8"));

    if (!parsed || typeof parsed !== "object") {
      return {};
    }

    return Object.fromEntries(
      Object.entries(parsed as ProductReviews)
        .filter(([productId]) => isValidProductId(productId))
        .map(([productId, reviews]) => [
          productId,
          Array.isArray(reviews)
            ? reviews
                .filter((review) => review && typeof review === "object")
                .map((review) => ({
                  id: cleanText(review.id, 80),
                  productId,
                  name: cleanText(review.name, 60) || "Cliente",
                  rating: Math.min(5, Math.max(1, Number(review.rating) || 1)),
                  comment: cleanText(review.comment, 600),
                  createdAt: cleanText(review.createdAt, 40),
                }))
                .filter((review) => review.id && review.comment && review.createdAt)
            : [],
        ]),
    );
  } catch {
    return {};
  }
}

export function getReviewsForProduct(productId: string) {
  return readProductReviews()[productId] ?? [];
}

export function addProductReview(rawReview: {
  productId: unknown;
  name: unknown;
  rating: unknown;
  comment: unknown;
}) {
  const productId = cleanText(rawReview.productId, 80);
  const name = cleanText(rawReview.name, 60) || "Cliente";
  const rating = Math.min(5, Math.max(1, Number(rawReview.rating) || 0));
  const comment = cleanText(rawReview.comment, 600);

  if (!isValidProductId(productId)) {
    throw new Error("Producto no valido.");
  }

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw new Error("Elige una puntuacion del 1 al 5.");
  }

  if (comment.length < 8) {
    throw new Error("Escribe un comentario un poco mas completo.");
  }

  const reviews = readProductReviews();
  const entry: ProductReviewEntry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    productId,
    name,
    rating,
    comment,
    createdAt: new Date().toISOString(),
  };

  reviews[productId] = [entry, ...(reviews[productId] ?? [])].slice(0, 100);
  mkdirSync(dirname(reviewsPath), { recursive: true });
  writeFileSync(reviewsPath, JSON.stringify(reviews, null, 2));

  return entry;
}
