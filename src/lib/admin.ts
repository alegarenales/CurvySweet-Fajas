import { createHmac, timingSafeEqual } from "node:crypto";

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
  const rawEmails = import.meta.env.ADMIN_EMAILS ?? import.meta.env.ADMIN_EMAIL ?? "";

  return String(rawEmails)
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

function getAdminSecret() {
  return import.meta.env.ADMIN_SESSION_SECRET ?? "curvysweet-dev-admin-secret";
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

function encodeSession(email: string) {
  const normalizedEmail = normalizeEmail(email);
  const signature = sign(normalizedEmail);

  return `${Buffer.from(normalizedEmail).toString("base64url")}.${signature}`;
}

function decodeSession(value: string): AdminSession | null {
  const [encodedEmail, signature] = value.split(".");

  if (!encodedEmail || !signature) {
    return null;
  }

  const email = Buffer.from(encodedEmail, "base64url").toString("utf8");
  const normalizedEmail = normalizeEmail(email);
  const expectedSignature = sign(normalizedEmail);

  if (!safeEqual(signature, expectedSignature)) {
    return null;
  }

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
