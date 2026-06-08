import { g as getAdminSession } from '../../../chunks/admin_CkpypabV.mjs';
import { g as getPool } from '../../../chunks/db_DLSmC66R.mjs';
import sql from 'mssql';
export { renderers } from '../../../renderers.mjs';

function stateLabel(state, stateName) {
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
  const result = await pool.request().query(`
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
    stateLabel: stateLabel(user.State, user.StateName)
  }));
}
const GET = async ({ cookies }) => {
  if (!getAdminSession(cookies)) {
    return new Response(JSON.stringify({ ok: false, message: "No autorizado." }), {
      status: 401,
      headers: { "Content-Type": "application/json" }
    });
  }
  try {
    return new Response(JSON.stringify({ ok: true, users: await listUsers() }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Error cargando usuarios:", error);
    return new Response(JSON.stringify({ ok: false, message: "No se pudieron cargar los usuarios." }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};
const POST = async ({ request, cookies }) => {
  if (!getAdminSession(cookies)) {
    return new Response(JSON.stringify({ ok: false, message: "No autorizado." }), {
      status: 401,
      headers: { "Content-Type": "application/json" }
    });
  }
  const data = await request.formData();
  const userId = String(data.get("userId") ?? "");
  const state = Number(data.get("state") ?? 1);
  if (!userId || ![1, 3].includes(state)) {
    return new Response(JSON.stringify({ ok: false, message: "Seleccion invalida." }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }
  try {
    const pool = await getPool();
    await pool.request().input("ID", sql.NVarChar(50), userId).input("State", sql.Int, state).query("UPDATE USERS SET State = @State WHERE ID = @ID");
    return new Response(
      JSON.stringify({
        ok: true,
        message: state === 1 ? "Usuario bloqueado." : "Usuario activado.",
        users: await listUsers()
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    console.error("Error actualizando usuario:", error);
    return new Response(JSON.stringify({ ok: false, message: "No se pudo actualizar el usuario." }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
