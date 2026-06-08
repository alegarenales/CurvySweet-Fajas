import { i as isAdminEmail, s as setAdminSession, c as clearAdminSession } from '../../chunks/admin_CkpypabV.mjs';
import { l as loginUsuario, s as sendLoginEmail } from '../../chunks/users_tmOh82kS.mjs';
export { renderers } from '../../renderers.mjs';

const POST = async ({ request, cookies }) => {
  const data = await request.formData();
  const mail = String(data.get("mail") ?? "");
  const password = String(data.get("password") ?? "");
  try {
    const result = await loginUsuario({
      mail,
      password
    });
    const isAdmin = result.ok && isAdminEmail(mail);
    if (isAdmin) {
      setAdminSession(cookies, mail);
    } else {
      clearAdminSession(cookies);
    }
    if (result.ok) {
      try {
        await sendLoginEmail({
          to: mail,
          name: mail
        });
      } catch (emailError) {
        console.error("Error enviando correo de inicio de sesion:", emailError);
      }
    }
    return new Response(
      JSON.stringify({
        ok: result.ok,
        message: result.message,
        user: {
          name: mail.split("@")[0],
          username: mail.split("@")[0],
          mail,
          isAdmin
        },
        data: result
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ ok: false, message: "Error al iniciar sesion" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
