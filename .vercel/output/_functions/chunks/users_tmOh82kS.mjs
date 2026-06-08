import nodemailer from 'nodemailer';
import { g as getPool } from './db_DLSmC66R.mjs';
import sql from 'mssql';

const __vite_import_meta_env__ = {"ASSETS_PREFIX": undefined, "BASE_URL": "/", "DEV": false, "MODE": "production", "PROD": true, "PUBLIC_DOMAIN": "http://localhost:4321", "SITE": "https://curvysweet.com", "SSR": true};
const requiredEnv = [
  "SMTP_HOST",
  "SMTP_PORT",
  "SMTP_USER",
  "SMTP_PASSWORD",
  "SMTP_FROM"
];
function hasMailConfig() {
  return requiredEnv.every((key) => Boolean(Object.assign(__vite_import_meta_env__, { SMTP_HOST: "smtp.gmail.com", SMTP_PORT: "587", SMTP_SECURE: "false", SMTP_USER: "curvysweet.fajas@gmail.com", SMTP_PASSWORD: "gdeu fwjg emqe hmqr", SMTP_FROM: "CurvySweet <curvysweet.fajas@gmail.com>", OS: process.env.OS })[key]));
}
async function sendLoginEmail({ to, name }) {
  if (!hasMailConfig()) {
    console.warn("No se envio el correo de inicio de sesion: faltan variables SMTP en .env");
    return;
  }
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: Number("587"),
    secure: false,
    auth: {
      user: "curvysweet.fajas@gmail.com",
      pass: "gdeu fwjg emqe hmqr"
    }
  });
  await transporter.sendMail({
    from: "CurvySweet <curvysweet.fajas@gmail.com>",
    to,
    subject: "Bienvenida de nuevo a CurvySweet",
    text: `Nos alegra verte de nuevo, ${name}. Has iniciado sesion correctamente.`,
    html: `
      <div style="font-family: Arial, sans-serif; color: #2d1f26; line-height: 1.5;">
        <h1 style="color: #b84b73;">Bienvenida de nuevo a CurvySweet</h1>
        <p>Hola ${name},</p>
        <p>Ya puedes acceder a la tienda cuando quieras.</p>
        <p>Con cariño,<br />CurvySweet</p>
      </div>
    `
  });
}
async function sendWelcomeEmail({ to, name }) {
  if (!hasMailConfig()) {
    console.warn("No se envio el correo de bienvenida: faltan variables SMTP en .env");
    return;
  }
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: Number("587"),
    secure: false,
    auth: {
      user: "curvysweet.fajas@gmail.com",
      pass: "gdeu fwjg emqe hmqr"
    }
  });
  await transporter.sendMail({
    from: "CurvySweet <curvysweet.fajas@gmail.com>",
    to,
    subject: "Bienvenida a CurvySweet",
    text: `Hola ${name}, bienvenida a CurvySweet. Tu cuenta se ha creado correctamente.`,
    html: `
      <div style="font-family: Arial, sans-serif; color: #2d1f26; line-height: 1.5;">
        <h1 style="color: #b84b73;">Bienvenida a CurvySweet</h1>
        <p>Hola ${name},</p>
        <p>Tu cuenta se ha creado correctamente. Gracias por registrarte.</p>
        <p>Con cariño,<br />CurvySweet</p>
      </div>
    `
  });
}

function getProcedureMessage(recordset = []) {
  const firstRow = recordset[0];
  if (!firstRow) {
    return "No se recibio mensaje del procedimiento.";
  }
  return String(
    firstRow.Message ?? firstRow.message ?? firstRow.result ?? firstRow.Result ?? Object.values(firstRow)[0] ?? ""
  );
}
function normalizeMessage(message) {
  return message.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}
async function loginUsuario({
  mail,
  password
}) {
  const pool = await getPool();
  const result = await pool.request().input("Mail", sql.VarChar(50), mail).input("Password", sql.VarChar(25), password).execute("sp_user_login");
  const procedureMessage = getProcedureMessage(result.recordset);
  const normalizedMessage = normalizeMessage(procedureMessage);
  const ok = normalizedMessage.includes("usuario logueado correctamente");
  const message = procedureMessage === "No se recibio mensaje del procedimiento." ? "Email o contrasena incorrectos." : procedureMessage;
  return {
    returnValue: result.returnValue,
    ok,
    message,
    data: result.recordset,
    recordsets: result.recordsets
  };
}
async function registrarUsuario({
  username,
  name,
  lastName,
  mail,
  password,
  rol = 1
}) {
  const pool = await getPool();
  const result = await pool.request().input("Name", sql.VarChar(50), name).input("Last_name", sql.VarChar(50), lastName).input("Username", sql.VarChar(50), username).input("Mail", sql.VarChar(50), mail).input("Password", sql.VarChar(25), password).execute("sp_user_register");
  const procedureMessage = getProcedureMessage(result.recordset);
  const normalizedMessage = normalizeMessage(procedureMessage);
  return {
    returnValue: result.returnValue,
    ok: normalizedMessage.includes("usuario creado correctamente") || result.returnValue === 1,
    message: procedureMessage,
    data: result.recordset,
    recordsets: result.recordsets
  };
}

export { sendWelcomeEmail as a, loginUsuario as l, registrarUsuario as r, sendLoginEmail as s };
