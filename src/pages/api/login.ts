import type { APIRoute } from "astro";
import { clearAdminSession, isAdminEmail, setAdminSession } from "../../lib/admin";
import { sendLoginEmail } from "../../lib/mail";
import { loginUsuario } from "../../lib/users";
import { clearUserSession, setUserSession } from "../../lib/userSession";
import { getClientIp, json, readFormBody } from "../../lib/security/http";
import { RATE_LIMITS, checkRateLimit, resetRateLimit } from "../../lib/security/rateLimit";
import { isValidEmail, normalizeEmail } from "../../lib/security/validation";

const GENERIC_LOGIN_ERROR = "Email o contraseña incorrectos.";
const LOGIN_ENDPOINT_VERSION = "curvysweet-login-2026-08-16-v2";

function loginJson(body: unknown, status = 200, headers: HeadersInit = {}) {
  return json(body, status, {
    "X-CurvySweet-Login-Version": LOGIN_ENDPOINT_VERSION,
    ...headers,
  });
}

function findUserRow(recordsets: Record<string, unknown>[][] | undefined) {
  return recordsets?.flat().find((row) => {
    if (!row || typeof row !== "object") return false;

    return "ID" in row || "Id" in row || "id" in row;
  });
}

function getUserId(userData: Record<string, unknown>) {
  return userData.ID ?? userData.Id ?? userData.id;
}

function normalizeProcedureMessage(message: string) {
  return message
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}

function isBlockedMessage(normalizedMessage: string) {
  return normalizedMessage.includes("bloquead") || normalizedMessage.includes("inactiv");
}

function safeFailureMessage(procedureMessage: string) {
  const normalized = normalizeProcedureMessage(procedureMessage);

  if (isBlockedMessage(normalized)) {
    return "Tu cuenta está bloqueada. Ponte en contacto con nosotros.";
  }

  return GENERIC_LOGIN_ERROR;
}

export const POST: APIRoute = async ({ request, cookies }) => {
  const clientIp = getClientIp(request);
  const data = await readFormBody(request);

  if (!data) {
    return loginJson({ ok: false, message: "Petición inválida." }, 400);
  }

  const mail = normalizeEmail(data.get("mail"));
  const password = String(data.get("password") ?? "");

  if (!isValidEmail(mail) || !password || password.length > 200) {
    return loginJson({ ok: false, message: GENERIC_LOGIN_ERROR }, 400);
  }

  for (const identifier of [clientIp, mail]) {
    const limit = checkRateLimit(identifier, RATE_LIMITS.login);

    if (!limit.allowed) {
      return loginJson(
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
    const userId = userData ? getUserId(userData) : null;
    const normalizedProcedureMessage = normalizeProcedureMessage(result.message);

    if (!userData || !userId || isBlockedMessage(normalizedProcedureMessage)) {
      console.warn("Login rechazado por respuesta incompleta del procedimiento.", {
        procedureMessage: result.message,
        recordsetSizes: recordsets?.map((recordset) => recordset.length) ?? [],
        firstRowKeys: recordsets?.map((recordset) => Object.keys(recordset[0] ?? {})) ?? [],
      });

      clearUserSession(cookies);
      clearAdminSession(cookies);

      return loginJson({ ok: false, message: safeFailureMessage(result.message) }, 401);
    }

    const isAdmin = isAdminEmail(mail);

    setUserSession(cookies, String(userId));

    if (isAdmin) {
      setAdminSession(cookies, mail);
    } else {
      clearAdminSession(cookies);
    }

    resetRateLimit(clientIp, RATE_LIMITS.login.name);
    resetRateLimit(mail, RATE_LIMITS.login.name);

    try {
      await sendLoginEmail({ to: mail, name: String(userData.Name ?? userData.name ?? mail) });
    } catch (emailError) {
      console.error("Error enviando correo de inicio de sesión.", emailError);
    }

    return loginJson({
      ok: true,
      message: "Sesión iniciada correctamente.",
      user: {
        id: userId,
        name: userData.Name ?? userData.name,
        lastName: userData.Last_name ?? userData.lastName,
        username: userData.Username ?? userData.username,
        mail: userData.Mail ?? userData.mail ?? mail,
        rol: userData.Rol ?? userData.rol,
        isAdmin,
      },
    });
  } catch (error) {
    console.error("Error al iniciar sesión.", error);

    return loginJson({ ok: false, message: "Error al iniciar sesión." }, 500);
  }
};
