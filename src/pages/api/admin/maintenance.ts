import type { APIRoute } from "astro";
import { getAdminSession } from "../../../lib/admin";
import { readAdminState, writeAdminState } from "../../../lib/admin-state";

export const GET: APIRoute = async ({ cookies }) => {
  if (!getAdminSession(cookies)) {
    return new Response(JSON.stringify({ ok: false, message: "No autorizado." }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ ok: true, enabled: readAdminState().maintenance }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};

export const POST: APIRoute = async ({ request, cookies }) => {
  if (!getAdminSession(cookies)) {
    return new Response(JSON.stringify({ ok: false, message: "No autorizado." }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const body = await request.json().catch(() => ({ enabled: false }));
  const state = writeAdminState({ maintenance: Boolean(body.enabled) });

  return new Response(JSON.stringify({ ok: true, enabled: state.maintenance }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
