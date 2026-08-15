/**
 * Resolución de secretos de firma.
 *
 * Antes, `userSession.ts` y `admin.ts` caían a una constante escrita en el
 * código fuente cuando faltaba la variable de entorno. Como ese código está en
 * el repositorio, cualquiera que lo leyera podía firmar una cookie de sesión
 * (o de administrador) válida para cualquier usuario. Aquí exigimos que el
 * secreto exista y tenga longitud suficiente en producción.
 */

const MIN_SECRET_LENGTH = 32;

const developmentFallbacks = new Map<string, string>();

function isProduction() {
  return import.meta.env.PROD === true;
}

/**
 * Lee una variable de entorno del servidor en tiempo de ejecución.
 *
 * Es importante que sea así y no con `import.meta.env.NOMBRE`: esa forma la
 * sustituye Vite durante la compilación, de modo que el valor queda escrito tal
 * cual dentro de los ficheros de `.vercel/output`. Con `process.env` el secreto
 * no llega nunca al artefacto compilado y, además, cambiarlo en Vercel surte
 * efecto sin necesidad de volver a construir el proyecto.
 *
 * El respaldo a `import.meta.env` es para `astro dev`, donde Vite carga el
 * fichero `.env` ahí y no en `process.env`.
 */
export function serverEnv(name: string): string | undefined {
  const fromProcess = process.env?.[name];

  if (typeof fromProcess === "string" && fromProcess.length > 0) {
    return fromProcess;
  }

  const fromVite = (import.meta.env as Record<string, unknown>)[name];

  return typeof fromVite === "string" && fromVite.length > 0 ? fromVite : undefined;
}

/**
 * Devuelve el secreto pedido.
 *
 * - En producción: obligatorio y de al menos 32 caracteres. Si falta, lanzamos
 *   un error en lugar de degradar a un valor conocido.
 * - En desarrollo: si falta, generamos un valor aleatorio en memoria (distinto
 *   en cada arranque) para que nadie pueda depender de un secreto por defecto.
 */
export function getRequiredSecret(name: string): string {
  const value = serverEnv(name);

  if (typeof value === "string" && value.length >= MIN_SECRET_LENGTH) {
    return value;
  }

  if (isProduction()) {
    throw new Error(
      `Falta la variable de entorno ${name} o es demasiado corta ` +
        `(mínimo ${MIN_SECRET_LENGTH} caracteres). Configúrala en Vercel antes de desplegar.`,
    );
  }

  if (typeof value === "string" && value.length > 0) {
    console.warn(
      `[seguridad] ${name} tiene menos de ${MIN_SECRET_LENGTH} caracteres. ` +
        `Sirve para desarrollo, pero el despliegue en producción fallará hasta que la alargues.`,
    );
    return value;
  }

  let fallback = developmentFallbacks.get(name);

  if (!fallback) {
    fallback = crypto.randomUUID() + crypto.randomUUID();
    developmentFallbacks.set(name, fallback);
    console.warn(
      `[seguridad] ${name} no está definida. Uso un secreto aleatorio de desarrollo; ` +
        `las sesiones se invalidarán al reiniciar el servidor.`,
    );
  }

  return fallback;
}
