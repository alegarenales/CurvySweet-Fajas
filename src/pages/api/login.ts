// src/pages/api/login.ts
import type { APIRoute } from "astro";
import { clearAdminSession, isAdminEmail, setAdminSession } from "../../lib/admin";
import { sendLoginEmail } from "../../lib/mail";
import { loginUsuario } from "../../lib/users";
import { clearUserSession, setUserSession } from "../../lib/userSession";

export const POST: APIRoute = async ({ request, cookies }) => {
  const data = await request.formData();

  const mail = String(data.get("mail") ?? "");
  const password = String(data.get("password") ?? "");

  try {
    const result = await loginUsuario({
      mail,
      password,
    });
    const userData = result.recordsets?.[1]?.[0];
    console.log(JSON.stringify(result, null, 2));

    const isAdmin = result.ok && isAdminEmail(mail);

    if (result.ok && userData?.ID) {
      setUserSession(cookies, userData.ID);
    } else {
      clearUserSession(cookies);
    }

    if (isAdmin) {
      setAdminSession(cookies, mail);
    } else {
      clearAdminSession(cookies);
    }

    if (result.ok) {
      try {
        await sendLoginEmail({
          to: mail,
          name: userData?.Name ?? mail,
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
          id: userData?.ID,
          name: userData?.Name,
          lastName: userData?.Last_name,
          username: userData?.Username,
          mail: userData?.Mail,
          rol: userData?.Rol,
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
