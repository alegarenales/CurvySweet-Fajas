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

type PurchaseEmailInput = {
  to: string;
  name: string;
  products: {
    name: string;
    quantity: number;
    price: string;
  }[];
  total: string;
};

export async function sendPurchaseEmail({
  to,
  name,
  products,
  total,
}: PurchaseEmailInput) {
  if (!hasMailConfig()) {
    console.warn("No se envio el correo de compra: faltan variables SMTP en .env");
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

  const productsHtml = products
    .map(
      (p) => `
        <tr>
          <td style="padding:8px;border-bottom:1px solid #eee;">${p.name}</td>
          <td style="padding:8px;text-align:center;border-bottom:1px solid #eee;">${p.quantity}</td>
          <td style="padding:8px;text-align:right;border-bottom:1px solid #eee;">${p.price}</td>
        </tr>
      `
    )
    .join("");

  await transporter.sendMail({
    from: import.meta.env.SMTP_FROM,
    to,
    subject: "💖 Gracias por tu compra en CurvySweet",
    text: `Hola ${name}, hemos recibido correctamente tu pedido. Muchas gracias por confiar en CurvySweet.`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:650px;margin:auto;color:#333">

        <h1 style="color:#d63384;">
          ¡Gracias por tu compra!
        </h1>

        <p>Hola ${name},</p>

        <p>
          Hemos recibido correctamente tu pedido y ya nos hemos puesto manos a la obra para prepararlo.
        </p>

        <table style="width:100%;border-collapse:collapse;margin-top:25px;">
          <thead>
            <tr>
              <th align="left">Producto</th>
              <th>Cantidad</th>
              <th align="right">Precio</th>
            </tr>
          </thead>

          <tbody>
            ${productsHtml}
          </tbody>
        </table>

        <hr style="margin:30px 0;">

        <h2 style="text-align:right;">
          Total: ${total}
        </h2>

        <p>
          En cuanto el pedido salga de nuestras instalaciones te avisaremos.
        </p>

        <p>
          Gracias por confiar en <strong>CurvySweet</strong>. 💕
        </p>

      </div>
    `,
  });
}