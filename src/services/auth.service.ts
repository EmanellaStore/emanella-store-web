//src/services/auth.service.ts
import db from "@/lib/db";
import { UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";
import { sendEmail, getResetPasswordEmailHtml } from "@/lib/email";
import crypto from "crypto";

const SALT_ROUNDS = 10;

export async function createUser(data: {
  email: string;
  password: string;
  name: string;
  lastName?: string;
  phone?: string;
}) {
  const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS);
  
  const user = await db.user.create({
    data: {
      email: data.email.toLowerCase(),
      password: hashedPassword,
      name: data.name,
      lastName: data.lastName,
      phone: data.phone,
      role: UserRole.CLIENT,
    },
  });

  const customer = await db.customer.create({
    data: {
      name: `${data.name} ${data.lastName || ""}`.trim(),
      phone: data.phone || "",
      userId: user.id,
    },
  });

  return { user, customer };
}

export async function verifyUser(email: string, password: string) {
  const user = await db.user.findUnique({
    where: { email: email.toLowerCase() },
    include: { customer: true },
  });

  if (!user) return null;

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) return null;

  return user;
}

export async function getUserById(userId: string) {
  return db.user.findUnique({
    where: { id: userId },
    include: { customer: true },
  });
}

export async function getUserByEmail(email: string) {
  return db.user.findUnique({
    where: { email: email.toLowerCase() },
  });
}

export async function updateUserPassword(userId: string, newPassword: string) {
  const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
  
  return db.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
  });
}

export async function requestPasswordReset(email: string) {
  const user = await db.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (!user) {
    return { success: true, message: "Si el email existe, recibirás un enlace de recuperación" };
  }

  // Clear any existing expired tokens first
  if (user.resetExpires && user.resetExpires < new Date()) {
    await db.user.update({
      where: { id: user.id },
      data: { resetToken: null, resetExpires: null },
    });
  }

  // Generate reset token
  const resetToken = crypto.randomBytes(32).toString("hex");
  const resetExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

  await db.user.update({
    where: { id: user.id },
    data: {
      resetToken,
      resetExpires,
    },
  });

  // Send email
  const html = getResetPasswordEmailHtml(resetToken, user.name);
  
  await sendEmail({
    to: user.email,
    subject: "Recupera tu contraseña - Emanella Store",
    html,
  });

  return { success: true, message: "Si el email existe, recibirás un enlace de recuperación" };
}

export async function resetPassword(token: string, newPassword: string) {
  // First check if token exists at all - use findFirst instead of findUnique
  const userWithToken = await db.user.findFirst({
    where: { resetToken: token },
  });

  if (!userWithToken) {
    return { success: false, error: "Token inválido" };
  }

  // Check if expired
  if (!userWithToken.resetExpires || userWithToken.resetExpires <= new Date()) {
    // Clear expired token
    await db.user.update({
      where: { id: userWithToken.id },
      data: { resetToken: null, resetExpires: null },
    });
    return { success: false, error: "Token expirado. Solicita uno nuevo." };
  }

  const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);

  await db.user.update({
    where: { id: userWithToken.id },
    data: {
      password: hashedPassword,
      resetToken: null,
      resetExpires: null,
    },
  });

  return { success: true };
}