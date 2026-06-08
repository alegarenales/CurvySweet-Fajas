import type { APIRoute } from "astro";
import { getAdminSession } from "../../../lib/admin";
import { readCatalogDrafts, writeCatalogDrafts, type CatalogDrafts } from "../../../lib/catalog";

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function cleanCatalogDrafts(rawDrafts: unknown): CatalogDrafts {
  if (!rawDrafts || typeof rawDrafts !== "object") {
    return {};
  }

  return Object.fromEntries(
    Object.entries(rawDrafts as CatalogDrafts).map(([productId, draft]) => [
      productId,
      {
        name: String(draft?.name ?? "").trim(),
        price: String(draft?.price ?? "").trim(),
        image: String(draft?.image ?? "").trim(),
        stock: String(draft?.stock ?? "").trim() === "out" ? "out" : "in",
      },
    ]),
  );
}

export const GET: APIRoute = async ({ cookies }) => {
  if (!getAdminSession(cookies)) {
    return json({ ok: false, message: "No autorizado." }, 401);
  }

  return json({ ok: true, catalog: readCatalogDrafts() });
};

export const POST: APIRoute = async ({ request, cookies }) => {
  if (!getAdminSession(cookies)) {
    return json({ ok: false, message: "No autorizado." }, 401);
  }

  const body = await request.json().catch(() => ({}));
  const catalog = writeCatalogDrafts(cleanCatalogDrafts(body.catalog));

  return json({ ok: true, catalog, message: "Catalogo publicado." });
};
