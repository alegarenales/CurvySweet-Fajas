import nodemailer from "nodemailer";

type WelcomeEmailInput = {
  to: string;
  name: string;
};

const requiredEnv = [
  "SMTP_HOST",
  "SMTP_PORT",
  "SMTP_USER",
  "SMTP_PASSWORD",
  "SMTP_FROM",
] as const;

function hasMailConfig() {
  return requiredEnv.every((key) => Boolean(import.meta.env[key]));
}

export async function sendLoginEmail({ to, name }: WelcomeEmailInput) {
  if (!hasMailConfig()) {
    console.warn("No se envio el correo de inicio de sesion: faltan variables SMTP en .env");
    return;
  }

  const transporter = nodemailer.createTransport({
    host: import.meta.env.SMTP_HOST,
    port: Number(import.meta.env.SMTP_PORT),
    secure: import.meta.env.SMTP_SECURE === "true",
    auth: {
      user: import.meta.env.SMTP_USER,
      pass: import.meta.env.SMTP_PASSWORD,
    },
  });

  await transporter.sendMail({
    from: import.meta.env.SMTP_FROM,
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
    `,
  });
}

export async function sendWelcomeEmail({ to, name }: WelcomeEmailInput) {
  if (!hasMailConfig()) {
    console.warn("No se envio el correo de bienvenida: faltan variables SMTP en .env");
    return;
  }

  const transporter = nodemailer.createTransport({
    host: import.meta.env.SMTP_HOST,
    port: Number(import.meta.env.SMTP_PORT),
    secure: import.meta.env.SMTP_SECURE === "true",
    auth: {
      user: import.meta.env.SMTP_USER,
      pass: import.meta.env.SMTP_PASSWORD,
    },
  });

  await transporter.sendMail({
    from: import.meta.env.SMTP_FROM,
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
    `,
  });
}
