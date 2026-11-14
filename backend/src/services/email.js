import nodemailer from "nodemailer";
import { env } from "../config/env.js";

let transporter;

export function isSmtpConfigured() {
  return Boolean(env.SMTP_HOST && env.SMTP_PORT && env.SMTP_FROM && (!env.SMTP_USER || env.SMTP_PASS));
}

function getTransporter() {
  if (!isSmtpConfigured()) {
    throw new Error("SMTP is not configured. Set SMTP_HOST, SMTP_PORT and SMTP_FROM in the backend environment.");
  }

  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_SECURE,
      ...(env.SMTP_USER ? { auth: { user: env.SMTP_USER, pass: env.SMTP_PASS } } : {}),
      connectionTimeout: 15000,
      greetingTimeout: 10000,
      socketTimeout: 20000,
    });
  }
  return transporter;
}

function escapeHtml(value = "") {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[char]);
}

export async function sendPasswordResetEmail({ to, fullName, resetUrl, expiresMinutes = 30 }) {
  const safeName = escapeHtml(fullName || "Applicant");
  await getTransporter().sendMail({
    from: env.SMTP_FROM,
    to,
    subject: "Reset your CrediFit password",
    text: `Hello ${fullName || "Applicant"},\n\nWe received a request to reset your CrediFit password. Open this link within ${expiresMinutes} minutes:\n${resetUrl}\n\nIf you did not request this, you can ignore this email. Your password will not change.`,
    html: `<!doctype html><html><body style="margin:0;background:#f4f7fb;font-family:Arial,sans-serif;color:#172554"><div style="max-width:560px;margin:32px auto;padding:32px;background:#fff;border:1px solid #e2e8f0;border-radius:16px"><h2 style="margin-top:0;color:#17185f">Reset your CrediFit password</h2><p>Hello ${safeName},</p><p>We received a request to reset the password for your CrediFit account.</p><p style="margin:28px 0"><a href="${resetUrl}" style="display:inline-block;padding:12px 20px;border-radius:10px;background:#26236f;color:#fff;text-decoration:none;font-weight:700">Reset password</a></p><p>This link expires in ${expiresMinutes} minutes and can only be used once.</p><p style="color:#64748b;font-size:13px">If you did not request this, ignore this email. Your password will not change.</p></div></body></html>`,
  });
}

export async function verifyEmailTransport() {
  await getTransporter().verify();
  return true;
}
