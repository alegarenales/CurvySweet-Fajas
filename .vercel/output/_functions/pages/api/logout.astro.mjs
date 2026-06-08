import { c as clearAdminSession } from '../../chunks/admin_CkpypabV.mjs';
export { renderers } from '../../renderers.mjs';

const POST = async ({ cookies }) => {
  clearAdminSession(cookies);
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" }
  });
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
