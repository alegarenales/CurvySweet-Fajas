// src/pages/api/login.ts
import type { APIRoute } from "astro";
import { clearAdminSession, isAdminEmail, setAdminSession } from "../../lib/admin";
import { sendLoginEmail } from "../../lib/mail";
import { loginUsuario } from "../../lib/users";
import { clearUserSession, setUserSession } from "../../lib/userSession";

export const POST: APIRoute = async ({ request, cookies }) => {
  console.log(">>>>>>>>>>>> LOGIN.TS EJECUTÁNDOSE <<<<<<<<<<<<");
  const data = await request.formData();

  const mail = String(data.get("mail") ?? "");
  const password = String(data.get("password") ?? "");

  try {
    const result = await loginUsuario({
      mail,
      password,
    });
    console.log("===== RECORDSETS =====");
    console.dir(result.recordsets, { depth: null });

    console.log("===== RECORDSET 0 =====");
    console.dir(result.recordsets?.[0], { depth: null });

    console.log("===== RECORDSET 1 =====");
    console.dir(result.recordsets?.[1], { depth: null });

    console.log("===== RECORDSET 2 =====");
    console.dir(result.recordsets?.[2], { depth: null });
    const userData = result.recordsets?.[1]?.[0];

    console.log("USER DATA:");
    console.log(JSON.stringify(userData, null, 2));
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
        console.error("Error enviando correo de inicio de sesión:", emailError);
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

    return new Response(JSON.stringify({ ok: false, message: "Error al iniciar sesión" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
