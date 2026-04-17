import nodemailer from "nodemailer";

const isSecure = process.env.SMTP_SECURE === "true";

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || '',
  port: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587,
  secure: isSecure,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail({ to, subject, html, text }: SendEmailOptions) {
  if (!process.env.SMTP_HOST) {
    console.log("📧 [DEV] Email no configurado:", { to, subject });
    return true;
  }

  try {
    const info = await transporter.sendMail({
      from:  process.env.SMTP_FROM,
      to,
      subject,
      html,
      text,
    });
    
    console.log("📧 Email enviado:", info.messageId);
    return true;
  } catch (error) {
    console.error("❌ Error enviando email:", error);
    return false;
  }
}

export function getResetPasswordEmailHtml(resetToken: string, userName: string) {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`;
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #B8860B; margin: 0;">Emanella Store</h1>
      </div>
      
      <h2>Hola ${userName},</h2>
      
      <p>Recibimos una solicitud para restablecer tu contraseña.</p>
      
      <p>Si no solicitaste este cambio, puedes ignorar este correo.</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" style="background-color: #B8860B; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
          Restablecer Contraseña
        </a>
      </div>
      
      <p style="font-size: 12px; color: #666;">
        Este enlace expire en 15 minutos.
      </p>
      
      <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
      
      <p style="font-size: 12px; color: #999; text-align: center;">
        © ${new Date().getFullYear()} Emanella Store. Todos los derechos reservados.
      </p>
    </body>
    </html>
  `;
}

export function getWelcomeEmailHtml(userName: string, email: string) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #B8860B; margin: 0;">Emanella Store</h1>
      </div>
      
      <h2>¡Bienvenido ${userName}!</h2>
      
      <p>Tu cuenta ha sido creada exitosamente.</p>
      
      <p><strong>Email:</strong> ${email}</p>
      
      <p>Ahora puedes:</p>
      <ul>
        <li>Explorar nuestro catálogo</li>
        <li>Realizar pedidos</li>
        <li>Historial de compras</li>
      </ul>
      
      <p style="font-size: 12px; color: #999; text-align: center; margin-top: 30px;">
        © ${new Date().getFullYear()} Emanella Store. Todos los derechos reservados.
      </p>
    </body>
    </html>
  `;
}