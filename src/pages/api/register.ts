// src/pages/api/register.ts
import type { APIRoute } from "astro";
import { sendWelcomeEmail } from "../../lib/mail";
import { registrarUsuario } from "../../lib/users";

export const POST: APIRoute = async ({ request }) => {
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
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const result = await registrarUsuario({
      username,
      name,
      lastName,
      mail,
      password,
    });

    if (result.ok) {
      await sendWelcomeEmail({
        to: mail,
        name,
      });
    }

    return new Response(
      JSON.stringify({
        ok: result.ok,
        message: result.message,
        user: {
          name,
          username,
          mail,
        },
        data: result,
      }),
      {
      status: 200,
      headers: { "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error(error);

    return new Response(JSON.stringify({ ok: false, message: "Error al registrar" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
