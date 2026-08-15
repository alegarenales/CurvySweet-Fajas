import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

const statePath = join(process.cwd(), ".curvysweet", "admin-state.json");

type AdminState = {
  maintenance: boolean;
};

const defaultState: AdminState = {
  maintenance: false,
};

/**
 * El middleware consulta este estado en cada petición. Sin caché, cada visita
 * haría una lectura de disco síncrona, que en una función serverless bloquea el
 * único hilo disponible. Un segundo de caché es suficiente para que el cambio
 * de modo mantenimiento se note enseguida sin pagar ese coste.
 */
const CACHE_MS = 1000;

let cachedState: AdminState = defaultState;
let cachedAt = 0;

function readStateFromDisk(): AdminState {
  if (!existsSync(statePath)) {
    return defaultState;
  }

  try {
    const parsed = JSON.parse(readFileSync(statePath, "utf-8")) as Partial<AdminState>;

    return {
      ...defaultState,
      // Normalizamos el tipo: el fichero podría venir manipulado o corrupto.
      maintenance: Boolean(parsed.maintenance),
    };
  } catch {
    return defaultState;
  }
}

export function readAdminState(): AdminState {
  const now = Date.now();

  if (now - cachedAt < CACHE_MS) {
    return cachedState;
  }

  cachedState = readStateFromDisk();
  cachedAt = now;

  return cachedState;
}

export function writeAdminState(nextState: Partial<AdminState>) {
  const state: AdminState = {
    ...readAdminState(),
    ...(nextState.maintenance === undefined ? {} : { maintenance: Boolean(nextState.maintenance) }),
  };

  try {
    mkdirSync(dirname(statePath), { recursive: true });
    writeFileSync(statePath, JSON.stringify(state, null, 2));
  } catch (error) {
    // En Vercel el sistema de ficheros de la función es de solo lectura, así
    // que esta escritura falla siempre. Lo registramos en lugar de romper la
    // petición; para que el modo mantenimiento funcione en producción hay que
    // guardarlo en la base de datos o en Vercel KV (ver README).
    console.error("No se pudo guardar el estado de administración en disco.", error);
  }

  cachedState = state;
  cachedAt = Date.now();

  return state;
}
