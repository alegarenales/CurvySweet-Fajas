/**
 * Validación y normalización de entrada.
 *
 * La regla es que ningún endpoint use directamente lo que llega del cliente:
 * primero pasa por aquí, se recorta a una longitud máxima y se comprueba el
 * formato. Los límites de longitud coinciden con los de las columnas de SQL
 * Server para que la base de datos nunca reciba algo que tenga que truncar.
 */

/** Correo: máximo 50 porque la columna Mail es VARCHAR(50). */
const EMAIL_MAX_LENGTH = 50;

/** Contraseña: la columna Password es VARCHAR(25). */
export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 25;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;

/** Caracteres de control, incluidos \r y \n (evita inyección en cabeceras). */
const CONTROL_CHARACTERS = /[\u0000-\u001f\u007f]/g;

export function cleanText(value: unknown, maxLength: number): string {
  return String(value ?? "")
    .replace(CONTROL_CHARACTERS, "")
    .trim()
    .slice(0, maxLength);
}

export function normalizeEmail(value: unknown): string {
  return cleanText(value, EMAIL_MAX_LENGTH).toLowerCase();
}

export function isValidEmail(value: string): boolean {
  return value.length > 0 && value.length <= EMAIL_MAX_LENGTH && EMAIL_PATTERN.test(value);
}

/**
 * Comprueba la contraseña. No la recortamos: si no cabe, es un error del
 * usuario y hay que decírselo, porque truncar en silencio haría que la
 * contraseña guardada no fuese la que escribió.
 */
export function validatePassword(
  value: unknown,
): { ok: true; password: string } | { ok: false; message: string } {
  const password = String(value ?? "");

  if (password.length < PASSWORD_MIN_LENGTH) {
    return {
      ok: false,
      message: `La contraseña debe tener al menos ${PASSWORD_MIN_LENGTH} caracteres.`,
    };
  }

  if (password.length > PASSWORD_MAX_LENGTH) {
    return {
      ok: false,
      message: `La contraseña no puede superar los ${PASSWORD_MAX_LENGTH} caracteres.`,
    };
  }

  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);

  if (!hasLetter || !hasNumber) {
    return { ok: false, message: "La contraseña debe combinar letras y números." };
  }

  return { ok: true, password };
}

/**
 * Identificadores de producto y de pedido. Solo aceptamos el juego de
 * caracteres que realmente usan (GUID o slug), lo que descarta de entrada
 * cualquier intento de inyección o de path traversal.
 */
const IDENTIFIER_PATTERN = /^[A-Za-z0-9_-]{1,100}$/;

export function isValidIdentifier(value: unknown): value is string {
  return typeof value === "string" && IDENTIFIER_PATTERN.test(value);
}

export function isValidGuid(value: unknown): value is string {
  return (
    typeof value === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)
  );
}

/** Estados válidos de un pedido; el panel de administración no acepta otros. */
export const ORDER_STATES = [
  "Pendiente",
  "Preparando",
  "Enviado",
  "Entregado",
  "Cancelado",
] as const;

export type OrderState = (typeof ORDER_STATES)[number];

export function isValidOrderState(value: unknown): value is OrderState {
  return typeof value === "string" && (ORDER_STATES as readonly string[]).includes(value);
}

/**
 * Rutas de imagen del catálogo: solo admitimos rutas relativas del propio
 * sitio. Así un administrador (o alguien que le robe la sesión) no puede
 * apuntar las imágenes a un dominio externo ni colar un `javascript:`.
 */
export function isSafeImagePath(value: unknown): value is string {
  if (typeof value !== "string" || value.length === 0 || value.length > 300) {
    return false;
  }

  return /^\/[A-Za-z0-9/_\-.]*$/.test(value) && !value.includes("..");
}
