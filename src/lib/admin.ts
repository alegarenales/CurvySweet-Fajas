import { createHmac, timingSafeEqual } from "node:crypto";
import { getRequiredSecret, serverEnv } from "./security/secrets";

const ADMIN_COOKIE_NAME = "curvysweet_admin";
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 8;

type CookieJar = {
  get: (name: string) => { value: string } | undefined;
  set: (
    name: string,
    value: string,
    options?: {
      httpOnly?: boolean;
      secure?: boolean;
      sameSite?: "strict" | "lax" | "none";
      path?: string;
      maxAge?: number;
    },
  ) => void;
  delete: (name: string, options?: { path?: string }) => void;
};

export type AdminSession = {
  email: string;
};

function getAdminEmails() {
  // Se lee en tiempo de ejecución para poder añadir o quitar administradoras
  // desde Vercel sin volver a compilar el proyecto.
  const rawEmails = serverEnv("ADMIN_EMAILS") ?? serverEnv("ADMIN_EMAIL") ?? "";

  return String(rawEmails)
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

function getAdminSecret() {
  return getRequiredSecret("ADMIN_SESSION_SECRET");
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function sign(value: string) {
  return createHmac("sha256", getAdminSecret()).update(value).digest("hex");
}

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
}

/**
 * La caducidad forma parte del valor firmado. El `maxAge` de la cookie solo lo
 * respeta el navegador; quien copie la cookie podría reutilizarla para siempre
 * si el servidor no comprobase la fecha por su cuenta.
 */
function encodeSession(email: string) {
  const normalizedEmail = normalizeEmail(email);
  const expiresAt = Math.floor(Date.now() / 1000) + COOKIE_MAX_AGE_SECONDS;
  const payload = `${Buffer.from(normalizedEmail).toString("base64url")}.${expiresAt}`;

  return `${payload}.${sign(payload)}`;
}

function decodeSession(value: string): AdminSession | null {
  const parts = value.split(".");

  if (parts.length !== 3) {
    return null;
  }

  const [encodedEmail, expiresAt, signature] = parts;

  if (!encodedEmail || !expiresAt || !signature) {
    return null;
  }

  if (!safeEqual(signature, sign(`${encodedEmail}.${expiresAt}`))) {
    return null;
  }

  const expiry = Number(expiresAt);

  if (!Number.isFinite(expiry) || expiry * 1000 < Date.now()) {
    return null;
  }

  const email = Buffer.from(encodedEmail, "base64url").toString("utf8");
  const normalizedEmail = normalizeEmail(email);

  // Segunda comprobación: aunque la firma sea válida, el correo tiene que
  // seguir estando en ADMIN_EMAILS. Así, quitar a alguien de esa lista revoca
  // su sesión de inmediato sin esperar a que caduque la cookie.
  if (!isAdminEmail(normalizedEmail)) {
    return null;
  }

  return { email: normalizedEmail };
}

export function isAdminEmail(email: string) {
  return getAdminEmails().includes(normalizeEmail(email));
}

export function setAdminSession(cookies: CookieJar, email: string) {
  cookies.set(ADMIN_COOKIE_NAME, encodeSession(email), {
    httpOnly: true,
    secure: import.meta.env.PROD,
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_MAX_AGE_SECONDS,
  });
}

export function clearAdminSession(cookies: CookieJar) {
  cookies.delete(ADMIN_COOKIE_NAME, {
    path: "/",
  });
}

export function getAdminSession(cookies: CookieJar): AdminSession | null {
  const cookie = cookies.get(ADMIN_COOKIE_NAME);

  if (!cookie?.value) {
    return null;
  }

  return decodeSession(cookie.value);
}
