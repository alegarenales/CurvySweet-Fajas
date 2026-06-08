import { g as getAdminSession } from '../../../chunks/admin_CkpypabV.mjs';
import { r as readCatalogDrafts, w as writeCatalogDrafts } from '../../../chunks/catalog_Cg0LSCvE.mjs';
export { renderers } from '../../../renderers.mjs';

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}
function cleanCatalogDrafts(rawDrafts) {
  if (!rawDrafts || typeof rawDrafts !== "object") {
    return {};
  }
  return Object.fromEntries(
    Object.entries(rawDrafts).map(([productId, draft]) => [
      productId,
      {
        name: String(draft?.name ?? "").trim(),
        price: String(draft?.price ?? "").trim(),
        image: String(draft?.image ?? "").trim(),
        stock: String(draft?.stock ?? "").trim() === "out" ? "out" : "in"
      }
    ])
  );
}
const GET = async ({ cookies }) => {
  if (!getAdminSession(cookies)) {
    return json({ ok: false, message: "No autorizado." }, 401);
  }
  return json({ ok: true, catalog: readCatalogDrafts() });
};
const POST = async ({ request, cookies }) => {
  if (!getAdminSession(cookies)) {
    return json({ ok: false, message: "No autorizado." }, 401);
  }
  const body = await request.json().catch(() => ({}));
  const catalog = writeCatalogDrafts(cleanCatalogDrafts(body.catalog));
  return json({ ok: true, catalog, message: "Catalogo publicado." });
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
