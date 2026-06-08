import type { APIRoute } from "astro";
import { getAdminSession } from "../../../lib/admin";
import { getPool, sql } from "../../../lib/db";

type DbUser = {
  ID: string;
  Username: string | null;
  Name: string | null;
  Mail: string | null;
  State: number;
  StateName?: string | null;
};

function stateLabel(state: number, stateName?: string | null) {
  if (stateName) {
    return stateName;
  }

  if (state === 1) return "Bloqueado";
  if (state === 3) return "Activo";
  if (state === 5) return "Logueado";

  return `Estado ${state}`;
}

async function listUsers() {
  const pool = await getPool();
  const result = await pool.request().query<DbUser>(`
    SELECT TOP 100
      U.ID,
      U.Username,
      U.Name,
      U.Mail,
      U.State,
      S.State AS StateName
    FROM USERS U
    LEFT JOIN State S ON S.ID = U.State
    ORDER BY U.Date DESC
  `);

  return result.recordset.map((user) => ({
    id: user.ID,
    username: user.Username,
    name: user.Name,
    mail: user.Mail,
    state: user.State,
    stateLabel: stateLabel(user.State, user.StateName),
  }));
}

export const GET: APIRoute = async ({ cookies }) => {
  if (!getAdminSession(cookies)) {
    return new Response(JSON.stringify({ ok: false, message: "No autorizado." }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    return new Response(JSON.stringify({ ok: true, users: await listUsers() }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error cargando usuarios:", error);
    return new Response(JSON.stringify({ ok: false, message: "No se pudieron cargar los usuarios." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

export const POST: APIRoute = async ({ request, cookies }) => {
  if (!getAdminSession(cookies)) {
    return new Response(JSON.stringify({ ok: false, message: "No autorizado." }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const data = await request.formData();
  const userId = String(data.get("userId") ?? "");
  const state = Number(data.get("state") ?? 1);

  if (!userId || ![1, 3].includes(state)) {
    return new Response(JSON.stringify({ ok: false, message: "Seleccion invalida." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const pool = await getPool();
    await pool
      .request()
      .input("ID", sql.NVarChar(50), userId)
      .input("State", sql.Int, state)
      .query("UPDATE USERS SET State = @State WHERE ID = @ID");

    return new Response(
      JSON.stringify({
        ok: true,
        message: state === 1 ? "Usuario bloqueado." : "Usuario activado.",
        users: await listUsers(),
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Error actualizando usuario:", error);
    return new Response(JSON.stringify({ ok: false, message: "No se pudo actualizar el usuario." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
