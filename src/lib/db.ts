// src/lib/db.ts
import sql from "mssql";
import { serverEnv } from "./security/secrets";

// Las credenciales se leen en tiempo de ejecución. Si se escribieran como
// `import.meta.env.DB_PASSWORD`, Vite las sustituiría durante la compilación y
// la contraseña de la base de datos quedaría en texto plano dentro de los
// ficheros generados en `.vercel/output`.
const config: sql.config = {
  user: serverEnv("DB_USER"),
  password: serverEnv("DB_PASSWORD"),
  server: serverEnv("DB_SERVER") ?? "",
  database: serverEnv("DB_NAME"),
  options: {
    // Conexión cifrada y con validación del certificado del servidor: sin esto
    // el tráfico con Azure SQL sería interceptable.
    encrypt: true,
    trustServerCertificate: false,
  },
  connectionTimeout: 30000,
  requestTimeout: 30000,
};

let pool: sql.ConnectionPool | null = null;

export async function getPool() {
  if (!pool) {
    pool = await sql.connect(config);
  }

  return pool;
}

export { sql };
