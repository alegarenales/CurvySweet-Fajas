import { g as getAdminSession } from '../../../chunks/admin_CkpypabV.mjs';
import { r as readAdminState, w as writeAdminState } from '../../../chunks/admin-state_k_CUmbN4.mjs';
export { renderers } from '../../../renderers.mjs';

const GET = async ({ cookies }) => {
  if (!getAdminSession(cookies)) {
    return new Response(JSON.stringify({ ok: false, message: "No autorizado." }), {
      status: 401,
      headers: { "Content-Type": "application/json" }
    });
  }
  return new Response(JSON.stringify({ ok: true, enabled: readAdminState().maintenance }), {
    status: 200,
    headers: { "Content-Type": "application/json" }
  });
};
const POST = async ({ request, cookies }) => {
  if (!getAdminSession(cookies)) {
    return new Response(JSON.stringify({ ok: false, message: "No autorizado." }), {
      status: 401,
      headers: { "Content-Type": "application/json" }
    });
  }
  const body = await request.json().catch(() => ({ enabled: false }));
  const state = writeAdminState({ maintenance: Boolean(body.enabled) });
  return new Response(JSON.stringify({ ok: true, enabled: state.maintenance }), {
    status: 200,
    headers: { "Content-Type": "application/json" }
  });
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
