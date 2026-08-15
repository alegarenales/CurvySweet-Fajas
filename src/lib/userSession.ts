import { createHmac, timingSafeEqual } from "node:crypto";
import { getRequiredSecret } from "./security/secrets";

const USER_COOKIE_NAME = "curvysweet_user";
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

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

export type UserSession = {
  id: string;
};

function getSecret() {
  return getRequiredSecret("USER_SESSION_SECRET");
}

function sign(value: string) {
  return createHmac("sha256", getSecret()).update(value).digest("hex");
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
 * La caducidad va dentro de la parte firmada. El `maxAge` de la cookie solo es
 * una sugerencia para el navegador: quien tenga la cookie puede conservarla
 * indefinidamente, así que la fecha de expiración tiene que verificarla el
 * servidor.
 */
function encodeSession(id: string) {
  const expiresAt = Math.floor(Date.now() / 1000) + COOKIE_MAX_AGE_SECONDS;
  const payload = `${Buffer.from(id).toString("base64url")}.${expiresAt}`;

  return `${payload}.${sign(payload)}`;
}

function decodeSession(value: string): UserSession | null {
  const parts = value.split(".");

  if (parts.length !== 3) {
    return null;
  }

  const [encoded, expiresAt, signature] = parts;

  if (!encoded || !expiresAt || !signature) {
    return null;
  }

  if (!safeEqual(signature, sign(`${encoded}.${expiresAt}`))) {
    return null;
  }

  const expiry = Number(expiresAt);

  if (!Number.isFinite(expiry) || expiry * 1000 < Date.now()) {
    return null;
  }

  const id = Buffer.from(encoded, "base64url").toString("utf8");

  // El identificador se usa como parámetro en consultas SQL. Las consultas ya
  // van parametrizadas, pero comprobamos también la forma: acepta GUID,
  // identificadores numéricos y slugs, y descarta espacios, comillas y
  // caracteres de control aunque la firma cuadre.
  if (!id || id.length > 100 || !/^[A-Za-z0-9._:@{}-]+$/.test(id)) {
    return null;
  }

  return { id };
}

export function setUserSession(cookies: CookieJar, id: string) {
  cookies.set(USER_COOKIE_NAME, encodeSession(id), {
    httpOnly: true,
    secure: import.meta.env.PROD,
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_MAX_AGE_SECONDS,
  });
}

export function clearUserSession(cookies: CookieJar) {
  cookies.delete(USER_COOKIE_NAME, {
    path: "/",
  });
}

export function getUserSession(cookies: CookieJar) {
  const cookie = cookies.get(USER_COOKIE_NAME);

  if (!cookie?.value) {
    return null;
  }

  return decodeSession(cookie.value);
}
