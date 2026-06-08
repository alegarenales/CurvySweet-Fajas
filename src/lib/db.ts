// src/lib/db.ts
import sql from "mssql";

const config: sql.config = {
  user: import.meta.env.DB_USER,
  password: import.meta.env.DB_PASSWORD,
  server: import.meta.env.DB_SERVER,
  database: import.meta.env.DB_NAME,
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
};

let pool: sql.ConnectionPool | null = null;

export async function getPool() {
  if (!pool) {
    pool = await sql.connect(config);
  }

  return pool;
}

export { sql };
