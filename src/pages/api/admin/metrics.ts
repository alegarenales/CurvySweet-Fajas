import type { APIRoute } from "astro";
import { existsSync, readFileSync } from "node:fs";
import { getAdminSession } from "../../../lib/admin";
import { ProductRepository } from "../../../repositories/ProductRepository";

function metricValue(seed: string, offset: number) {
  return seed.split("").reduce((sum, char) => sum + char.charCodeAt(0), offset) % 80 + 12;
}

function getVisits() {
  if (!existsSync("access.log")) {
    return 0;
  }

  return readFileSync("access.log", "utf-8")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean).length;
}

export const GET: APIRoute = async ({ cookies }) => {
  if (!getAdminSession(cookies)) {
    return new Response(JSON.stringify({ ok: false, message: "No autorizado." }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const visits = getVisits();
  const products = await ProductRepository.getProducts();

  return new Response(
    JSON.stringify({
      ok: true,
      views: products.slice(0, 5).map((product, index) => ({
        label: product.name,
        value: Math.max(metricValue(product.id, visits + index * 7), index === 0 ? visits : 0),
      })),
      purchases: products.slice(0, 5).map((product, index) => ({
        label: product.name,
        value: metricValue(product.name, index * 11) % 24,
      })),
      demand: products.slice(0, 5).map((product, index) => ({
        label: product.name,
        value: metricValue(`${product.id}:${product.tag}`, index * 17) % 42,
      })),
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    },
  );
};
