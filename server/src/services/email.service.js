import nodemailer from "nodemailer";
import { config } from "../config/index.js";

const transporter = nodemailer.createTransport({
  host: config.smtpHost,
  port: config.smtpPort,
  secure: config.smtpSecure,
  auth: {
    user: config.smtpUser,
    pass: config.smtpPass,
  },
});

const assertMailerConfig = () => {
  if (!config.smtpHost || !config.smtpUser || !config.smtpPass || !config.smtpFrom) {
    const err = new Error("Email service is not configured. Set SMTP_HOST, SMTP_USER, SMTP_PASS, SMTP_FROM.");
    err.statusCode = 500;
    throw err;
  }
};

export const sendOtpEmail = async ({ email, code, expiryMinutes }) => {
  assertMailerConfig();

  await transporter.sendMail({
    from: config.smtpFrom,
    to: email,
    subject: "TravelUp verification code",
    text: `Your TravelUp verification code is ${code}. It expires in ${expiryMinutes} minutes.`,
    html: `<p>Your TravelUp verification code is <strong>${code}</strong>.</p><p>This code expires in ${expiryMinutes} minutes.</p>`,
  });
};