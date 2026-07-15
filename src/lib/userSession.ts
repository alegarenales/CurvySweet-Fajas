import { createHmac, timingSafeEqual } from "node:crypto";

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
  return import.meta.env.USER_SESSION_SECRET ?? "curvysweet-dev-user-secret";
}

function sign(value: string) {
  return createHmac("sha256", getSecret())
    .update(value)
    .digest("hex");
}

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
}

function encodeSession(id: string) {
  const signature = sign(id);

  return `${Buffer.from(id).toString("base64url")}.${signature}`;
}

function decodeSession(value: string): UserSession | null {

  const [encoded, signature] = value.split(".");

  if (!encoded || !signature) {
    return null;
  }

  const id = Buffer.from(encoded, "base64url").toString("utf8");

  if (!safeEqual(signature, sign(id))) {
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