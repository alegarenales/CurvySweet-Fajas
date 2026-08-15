// src/pages/api/register.ts
import type { APIRoute } from "astro";
import { sendWelcomeEmail } from "../../lib/mail";
import { registrarUsuario } from "../../lib/users";
import { getClientIp, json, readFormBody } from "../../lib/security/http";
import { RATE_LIMITS, checkRateLimit } from "../../lib/security/rateLimit";
import { cleanText, isValidEmail, normalizeEmail, validatePassword } from "../../lib/security/validation";

/** Longitudes que admiten las columnas correspondientes en SQL Server. */
const NAME_MAX_LENGTH = 50;

export const POST: APIRoute = async ({ request }) => {
  const clientIp = getClientIp(request);

  // Sin este límite, cualquiera puede crear cuentas en bucle y, de paso, usar
  // el sitio para enviar correos de bienvenida a direcciones ajenas.
  const limit = checkRateLimit(clientIp, RATE_LIMITS.register);

  if (!limit.allowed) {
    return json(
      { ok: false, message: "Has creado demasiadas cuentas. Inténtalo más tarde." },
      429,
      { "Retry-After": String(limit.retryAfterSeconds) },
    );
  }

  const data = await readFormBody(request);

  if (!data) {
    return json({ ok: false, message: "Petición inválida." }, 400);
  }

  const username = cleanText(data.get("username"), NAME_MAX_LENGTH);
  const name = cleanText(data.get("name"), NAME_MAX_LENGTH);
  const lastName = cleanText(data.get("lastName"), NAME_MAX_LENGTH);
  const mail = normalizeEmail(data.get("mail"));
  const password = String(data.get("password") ?? "");
  const repeatPassword = String(data.get("repeatPassword") ?? "");

  if (!username || !name || !lastName) {
    return json({ ok: false, message: "Completa nombre, apellidos y nombre de usuario." }, 400);
  }

  if (!isValidEmail(mail)) {
    return json({ ok: false, message: "Introduce un correo electrónico válido." }, 400);
  }

  if (password !== repeatPassword) {
    return json({ ok: false, message: "Las contraseñas no coinciden" }, 400);
  }

  const passwordCheck = validatePassword(password);

  if (!passwordCheck.ok) {
    return json({ ok: false, message: passwordCheck.message }, 400);
  }

  try {
    const result = await registrarUsuario({
      username,
      name,
      lastName,
      mail,
      password: passwordCheck.password,
    });

    if (result.ok) {
      try {
        await sendWelcomeEmail({ to: mail, name });
      } catch (emailError) {
        // Que falle el correo no debe impedir que la cuenta quede creada.
        console.error("Error enviando correo de bienvenida.", emailError);
      }
    }

    // Igual que en el login, devolvemos solo lo que necesita la interfaz y no
    // el resultado completo del procedimiento almacenado.
    return json(
      {
        ok: result.ok,
        message: result.message,
        user: result.ok ? { name, username, mail } : null,
      },
      result.ok ? 200 : 400,
    );
  } catch (error) {
    console.error("Error al registrar usuario.", error);

    return json({ ok: false, message: "Error al registrar" }, 500);
  }
};
