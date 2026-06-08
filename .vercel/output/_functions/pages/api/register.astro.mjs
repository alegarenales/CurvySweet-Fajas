import { r as registrarUsuario, a as sendWelcomeEmail } from '../../chunks/users_tmOh82kS.mjs';
export { renderers } from '../../renderers.mjs';

const POST = async ({ request }) => {
  const data = await request.formData();
  const username = String(data.get("username") ?? "");
  const name = String(data.get("name") ?? "");
  const lastName = String(data.get("lastName") ?? "");
  const mail = String(data.get("mail") ?? "");
  const password = String(data.get("password") ?? "");
  const repeatPassword = String(data.get("repeatPassword") ?? "");
  if (password !== repeatPassword) {
    return new Response(JSON.stringify({ ok: false, message: "Las contrasenas no coinciden" }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }
  try {
    const result = await registrarUsuario({
      username,
      name,
      lastName,
      mail,
      password
    });
    if (result.ok) {
      await sendWelcomeEmail({
        to: mail,
        name
      });
    }
    return new Response(
      JSON.stringify({
        ok: result.ok,
        message: result.message,
        user: {
          name,
          username,
          mail
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
    return new Response(JSON.stringify({ ok: false, message: "Error al registrar" }), {
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
