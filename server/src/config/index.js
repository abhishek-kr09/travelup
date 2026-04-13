import dotenv from "dotenv";

dotenv.config({ quiet: true });

export const config = {
  port: process.env.PORT || 5000,
  mongoURI: process.env.MONGO_URI,
  clientURL: process.env.CLIENT_URL || "http://localhost:5173",
  otpExpiryMinutes: Number(process.env.OTP_EXPIRY_MINUTES || 10),
  smtpHost: process.env.SMTP_HOST,
  smtpPort: Number(process.env.SMTP_PORT || 587),
  smtpSecure: process.env.SMTP_SECURE === "true",
  smtpUser: process.env.SMTP_USER,
  smtpPass: process.env.SMTP_PASS,
  smtpFrom: process.env.SMTP_FROM || process.env.SMTP_USER
};
