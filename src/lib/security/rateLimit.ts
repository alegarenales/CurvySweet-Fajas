/**
 * Limitador de peticiones por ventana deslizante.
 *
 * Está en memoria: cada instancia serverless mantiene su propio contador, así
 * que en Vercel el límite real es aproximado (se multiplica por el número de
 * instancias activas). Aun así corta de raíz la fuerza bruta desde una sola IP,
 * que es el caso habitual. Si el tráfico crece, sustituye `hit()` por Vercel KV
 * o Upstash Redis sin tocar el resto del código.
 */

type Bucket = {
  hits: number[];
  blockedUntil: number;
};

const buckets = new Map<string, Bucket>();

const MAX_BUCKETS = 10_000;

export type RateLimitOptions = {
  /** Identificador del límite, para no mezclar contadores entre endpoints. */
  name: string;
  /** Número máximo de peticiones permitidas dentro de la ventana. */
  limit: number;
  /** Tamaño de la ventana en milisegundos. */
  windowMs: number;
  /** Tiempo de bloqueo tras superar el límite. Por defecto, la ventana. */
  blockMs?: number;
};

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
};

function pruneIfNeeded(now: number) {
  if (buckets.size < MAX_BUCKETS) {
    return;
  }

  for (const [key, bucket] of buckets) {
    const lastHit = bucket.hits[bucket.hits.length - 1] ?? 0;

    if (bucket.blockedUntil < now && now - lastHit > 60 * 60 * 1000) {
      buckets.delete(key);
    }
  }

  // Si aun así seguimos llenos, vaciamos: es preferible perder contadores
  // antiguos a que el proceso crezca sin límite.
  if (buckets.size >= MAX_BUCKETS) {
    buckets.clear();
  }
}

export function checkRateLimit(identifier: string, options: RateLimitOptions): RateLimitResult {
  const now = Date.now();
  const key = `${options.name}:${identifier}`;
  const blockMs = options.blockMs ?? options.windowMs;

  pruneIfNeeded(now);

  const bucket = buckets.get(key) ?? { hits: [], blockedUntil: 0 };

  if (bucket.blockedUntil > now) {
    buckets.set(key, bucket);
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.ceil((bucket.blockedUntil - now) / 1000),
    };
  }

  bucket.hits = bucket.hits.filter((hit) => now - hit < options.windowMs);

  if (bucket.hits.length >= options.limit) {
    bucket.blockedUntil = now + blockMs;
    buckets.set(key, bucket);

    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.ceil(blockMs / 1000),
    };
  }

  bucket.hits.push(now);
  buckets.set(key, bucket);

  return {
    allowed: true,
    remaining: options.limit - bucket.hits.length,
    retryAfterSeconds: 0,
  };
}

/**
 * Borra el contador de un identificador. Se usa tras un login correcto, para
 * que un usuario legítimo que se equivocó un par de veces no arrastre el
 * consumo de intentos.
 */
export function resetRateLimit(identifier: string, name: string) {
  buckets.delete(`${name}:${identifier}`);
}

/** Límites usados por la aplicación, en un solo sitio para poder revisarlos. */
export const RATE_LIMITS = {
  login: { name: "login", limit: 8, windowMs: 10 * 60 * 1000, blockMs: 15 * 60 * 1000 },
  register: { name: "register", limit: 5, windowMs: 60 * 60 * 1000, blockMs: 60 * 60 * 1000 },
  review: { name: "review", limit: 10, windowMs: 10 * 60 * 1000 },
  checkout: { name: "checkout", limit: 20, windowMs: 10 * 60 * 1000 },
  favorites: { name: "favorites", limit: 60, windowMs: 5 * 60 * 1000 },
  adminWrite: { name: "admin-write", limit: 60, windowMs: 5 * 60 * 1000 },
  api: { name: "api", limit: 300, windowMs: 60 * 1000 },
} as const satisfies Record<string, RateLimitOptions>;
