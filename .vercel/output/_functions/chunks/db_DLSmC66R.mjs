import sql from 'mssql';

const config = {
  user: "sa",
  password: "Aleg0097mola",
  server: "127.0.0.1",
  database: "CurvySweet",
  options: {
    encrypt: false,
    trustServerCertificate: true
  }
};
let pool = null;
async function getPool() {
  if (!pool) {
    pool = await sql.connect(config);
  }
  return pool;
}

export { getPool as g };
