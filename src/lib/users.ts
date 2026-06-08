import { getPool, sql } from "./db";

type RegisterUserInput = {
  username: string;
  name: string;
  lastName: string;
  mail: string;
  password: string;
  rol?: number;
};

type LoginUserInput = {
  mail: string;
  password: string;
};

function getProcedureMessage(recordset: Record<string, unknown>[] = []) {
  const firstRow = recordset[0];

  if (!firstRow) {
    return "No se recibio mensaje del procedimiento.";
  }

  return String(
    firstRow.Message ??
      firstRow.message ??
      firstRow.result ??
      firstRow.Result ??
      Object.values(firstRow)[0] ??
      "",
  );
}

function normalizeMessage(message: string) {
  return message
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export async function loginUsuario({
  mail,
  password,
}: LoginUserInput) {
  const pool = await getPool();

  const result = await pool
    .request()
    .input("Mail", sql.VarChar(50), mail)
    .input("Password", sql.VarChar(25), password)
    .execute("sp_user_login");

  const procedureMessage = getProcedureMessage(result.recordset);
  const normalizedMessage = normalizeMessage(procedureMessage);
  const ok = normalizedMessage.includes("usuario logueado correctamente");
  const message = procedureMessage === "No se recibio mensaje del procedimiento."
    ? "Email o contrasena incorrectos."
    : procedureMessage;

  return {
    returnValue: result.returnValue,
    ok,
    message,
    data: result.recordset,
    recordsets: result.recordsets,
  };
}

export async function registrarUsuario({
  username,
  name,
  lastName,
  mail,
  password,
  rol = 1,
}: RegisterUserInput) {
  const pool = await getPool();

  const result = await pool
    .request()
    .input("Name", sql.VarChar(50), name)
    .input("Last_name", sql.VarChar(50), lastName)
    .input("Username", sql.VarChar(50), username)
    .input("Mail", sql.VarChar(50), mail)
    .input("Password", sql.VarChar(25), password)
    .execute("sp_user_register");

  const procedureMessage = getProcedureMessage(result.recordset);
  const normalizedMessage = normalizeMessage(procedureMessage);

  return {
    returnValue: result.returnValue,
    ok: normalizedMessage.includes("usuario creado correctamente") || result.returnValue === 1,
    message: procedureMessage,
    data: result.recordset,
    recordsets: result.recordsets,
  };
}
