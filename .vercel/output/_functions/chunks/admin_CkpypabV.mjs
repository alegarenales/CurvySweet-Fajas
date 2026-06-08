import { createHmac, timingSafeEqual } from 'node:crypto';

const ADMIN_COOKIE_NAME = "curvysweet_admin";
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 8;
function getAdminEmails() {
  const rawEmails = "alegarenales@gmail.com";
  return String(rawEmails).split(",").map((email) => email.trim().toLowerCase()).filter(Boolean);
}
function getAdminSecret() {
  return "password123";
}
function normalizeEmail(email) {
  return email.trim().toLowerCase();
}
function sign(value) {
  return createHmac("sha256", getAdminSecret()).update(value).digest("hex");
}
function safeEqual(left, right) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }
  return timingSafeEqual(leftBuffer, rightBuffer);
}
function encodeSession(email) {
  const normalizedEmail = normalizeEmail(email);
  const signature = sign(normalizedEmail);
  return `${Buffer.from(normalizedEmail).toString("base64url")}.${signature}`;
}
function decodeSession(value) {
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
function isAdminEmail(email) {
  return getAdminEmails().includes(normalizeEmail(email));
}
function setAdminSession(cookies, email) {
  cookies.set(ADMIN_COOKIE_NAME, encodeSession(email), {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_MAX_AGE_SECONDS
  });
}
function clearAdminSession(cookies) {
  cookies.delete(ADMIN_COOKIE_NAME, {
    path: "/"
  });
}
function getAdminSession(cookies) {
  const cookie = cookies.get(ADMIN_COOKIE_NAME);
  if (!cookie?.value) {
    return null;
  }
  return decodeSession(cookie.value);
}

export { clearAdminSession as c, getAdminSession as g, isAdminEmail as i, setAdminSession as s };
