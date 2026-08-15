// src/pages/api/login.ts
import type { APIRoute } from "astro";
import { clearAdminSession, isAdminEmail, setAdminSession } from "../../lib/admin";
import { sendLoginEmail } from "../../lib/mail";
import { loginUsuario } from "../../lib/users";
import { clearUserSession, setUserSession } from "../../lib/userSession";
import { getClientIp, json, readFormBody } from "../../lib/security/http";
import { RATE_LIMITS, checkRateLimit, resetRateLimit } from "../../lib/security/rateLimit";
import { isValidEmail, normalizeEmail } from "../../lib/security/validation";

/**
 * Mensaje único para cualquier fallo de credenciales. Distinguir entre "ese
 * correo no existe" y "la contraseña no es correcta" permitiría a un atacante
 * averiguar qué correos están registrados.
 */
const GENERIC_LOGIN_ERROR = "Email o contraseña incorrectos.";

function findUserRow(recordsets: Record<string, unknown>[][] | undefined) {
  return recordsets
    ?.flat()
    .find((row) => row && typeof row === "object" && "ID" in row);
}

/**
 * Del mensaje que devuelve el procedimiento almacenado solo dejamos pasar el
 * aviso de cuenta bloqueada, porque el usuario necesita saber que el problema
 * no es su contraseña. Todo lo demás se sustituye por el mensaje genérico.
 */
function safeFailureMessage(procedureMessage: string) {
  const normalized = procedureMessage
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();

  if (normalized.includes("bloquead") || normalized.includes("inactiv")) {
    return "Tu cuenta está bloqueada. Ponte en contacto con nosotros.";
  }

  return GENERIC_LOGIN_ERROR;
}

export const POST: APIRoute = async ({ request, cookies }) => {
  const clientIp = getClientIp(request);
  const data = await readFormBody(request);

  if (!data) {
    return json({ ok: false, message: "Petición inválida." }, 400);
  }

  const mail = normalizeEmail(data.get("mail"));
  const password = String(data.get("password") ?? "");

  if (!isValidEmail(mail) || !password || password.length > 200) {
    return json({ ok: false, message: GENERIC_LOGIN_ERROR }, 400);
  }

  // Dos contadores: uno por IP (frena el escaneo de muchas cuentas desde un
  // mismo sitio) y otro por cuenta (frena el ataque distribuido contra una
  // cuenta concreta).
  for (const identifier of [clientIp, mail]) {
    const limit = checkRateLimit(identifier, RATE_LIMITS.login);

    if (!limit.allowed) {
      return json(
        {
          ok: false,
          message: `Demasiados intentos. Vuelve a probar en ${Math.ceil(limit.retryAfterSeconds / 60)} minutos.`,
        },
        429,
        { "Retry-After": String(limit.retryAfterSeconds) },
      );
    }
  }

  try {
    const result = await loginUsuario({ mail, password });
    const recordsets = result.recordsets as Record<string, unknown>[][] | undefined;
    const userData = findUserRow(recordsets);

    if (!result.ok || !userData?.ID) {
      // Aunque el procedimiento diga que las credenciales son correctas, sin
      // fila de usuario no podemos crear una sesión fiable.
      clearUserSession(cookies);
      clearAdminSession(cookies);

      return json({ ok: false, message: safeFailureMessage(result.message) }, 401);
    }

    const isAdmin = isAdminEmail(mail);

    setUserSession(cookies, String(userData.ID));

    if (isAdmin) {
      setAdminSession(cookies, mail);
    } else {
      clearAdminSession(cookies);
    }

    // El usuario ha demostrado conocer la contraseña: liberamos sus contadores
    // para que un par de fallos previos no le penalicen.
    resetRateLimit(clientIp, RATE_LIMITS.login.name);
    resetRateLimit(mail, RATE_LIMITS.login.name);

    try {
      await sendLoginEmail({ to: mail, name: String(userData.Name ?? mail) });
    } catch (emailError) {
      console.error("Error enviando correo de inicio de sesión.", emailError);
    }

    // Devolvemos solo los campos que necesita la interfaz. Antes se enviaba el
    // resultado completo del procedimiento almacenado, lo que exponía al
    // navegador columnas internas de la tabla USERS.
    return json({
      ok: true,
      message: "Sesión iniciada correctamente.",
      user: {
        id: userData.ID,
        name: userData.Name,
        lastName: userData.Last_name,
        username: userData.Username,
        mail: userData.Mail,
        rol: userData.Rol,
        isAdmin,
      },
    });
  } catch (error) {
    // El detalle va al registro del servidor; al cliente solo un mensaje neutro.
    console.error("Error al iniciar sesión.", error);

    return json({ ok: false, message: "Error al iniciar sesión." }, 500);
  }
};
