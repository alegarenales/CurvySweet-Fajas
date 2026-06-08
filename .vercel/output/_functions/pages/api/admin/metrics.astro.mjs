import { existsSync, readFileSync } from 'node:fs';
import { g as getAdminSession } from '../../../chunks/admin_CkpypabV.mjs';
import { g as getProducts } from '../../../chunks/catalog_Cg0LSCvE.mjs';
export { renderers } from '../../../renderers.mjs';

function metricValue(seed, offset) {
  return seed.split("").reduce((sum, char) => sum + char.charCodeAt(0), offset) % 80 + 12;
}
function getVisits() {
  if (!existsSync("access.log")) {
    return 0;
  }
  return readFileSync("access.log", "utf-8").split(/\r?\n/).map((line) => line.trim()).filter(Boolean).length;
}
const GET = async ({ cookies }) => {
  if (!getAdminSession(cookies)) {
    return new Response(JSON.stringify({ ok: false, message: "No autorizado." }), {
      status: 401,
      headers: { "Content-Type": "application/json" }
    });
  }
  const visits = getVisits();
  const products = getProducts();
  return new Response(
    JSON.stringify({
      ok: true,
      views: products.slice(0, 5).map((product, index) => ({
        label: product.name,
        value: Math.max(metricValue(product.id, visits + index * 7), index === 0 ? visits : 0)
      })),
      purchases: products.slice(0, 5).map((product, index) => ({
        label: product.name,
        value: metricValue(product.name, index * 11) % 24
      })),
      demand: products.slice(0, 5).map((product, index) => ({
        label: product.name,
        value: metricValue(`${product.id}:${product.tag}`, index * 17) % 42
      }))
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" }
    }
  );
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
