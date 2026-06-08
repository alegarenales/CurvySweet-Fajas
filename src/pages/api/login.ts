// src/pages/api/login.ts
import type { APIRoute } from "astro";
import { clearAdminSession, isAdminEmail, setAdminSession } from "../../lib/admin";
import { sendLoginEmail } from "../../lib/mail";
import { loginUsuario } from "../../lib/users";

export const POST: APIRoute = async ({ request, cookies }) => {
  const data = await request.formData();

  const mail = String(data.get("mail") ?? "");
  const password = String(data.get("password") ?? "");

  try {
    const result = await loginUsuario({
      mail,
      password,
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
          name: mail,
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
          isAdmin,
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

    return new Response(JSON.stringify({ ok: false, message: "Error al iniciar sesion" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
