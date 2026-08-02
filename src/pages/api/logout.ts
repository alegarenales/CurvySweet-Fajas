import type { APIRoute } from "astro";
import { clearAdminSession } from "../../lib/admin";
import { clearUserSession } from "../../lib/userSession";

export const POST: APIRoute = async ({ cookies }) => {

  clearUserSession(cookies);
  clearAdminSession(cookies);

  return new Response(
    JSON.stringify({ ok: true }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
};
