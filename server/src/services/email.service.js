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

const getFromAddress = () => {
  const rawFrom = (config.smtpFrom || "").trim();
  const fallback = (config.smtpUser || "").trim();

  if (!rawFrom) return fallback;

  const emailMatch = rawFrom.match(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/);
  if (!emailMatch) return fallback || rawFrom;

  const email = emailMatch[0];
  if (rawFrom === email) return email;

  const displayName = rawFrom.replace(email, "").trim();
  return displayName ? `${displayName} <${email}>` : email;
};

export const sendOtpEmail = async ({ email, code, expiryMinutes }) => {
  assertMailerConfig();
  const from = getFromAddress();

  await transporter.sendMail({
    from,
    to: email,
    subject: "TravelUp verification code",
    text: `Your TravelUp verification code is ${code}. It expires in ${expiryMinutes} minutes.`,
    html: `<p>Your TravelUp verification code is <strong>${code}</strong>.</p><p>This code expires in ${expiryMinutes} minutes.</p>`,
  });
};

export const sendBookingConfirmationEmail = async ({
  email,
  guestName,
  bookingDetails,
}) => {
  assertMailerConfig();
  const from = getFromAddress();

  const {
    title,
    location,
    mapUrl,
    checkIn,
    checkOut,
    guests,
    nights,
    total,
  } = bookingDetails;

  await transporter.sendMail({
    from,
    to: email,
    subject: `Booking confirmed: ${title}`,
    text: [
      `Hi ${guestName},`,
      "",
      "Your booking is confirmed.",
      `Listing: ${title}`,
      `Location: ${location}`,
      `Map: ${mapUrl}`,
      `Check-in: ${checkIn}`,
      `Check-out: ${checkOut}`,
      `Guests: ${guests}`,
      `Nights: ${nights}`,
      `Total paid: INR ${total}`,
      "",
      "Thanks for choosing TravelUp.",
    ].join("\n"),
    html: `
      <p>Hi ${guestName},</p>
      <p>Your booking is <strong>confirmed</strong>.</p>
      <ul>
        <li><strong>Listing:</strong> ${title}</li>
        <li><strong>Location:</strong> ${location}</li>
        <li><strong>Check-in:</strong> ${checkIn}</li>
        <li><strong>Check-out:</strong> ${checkOut}</li>
        <li><strong>Guests:</strong> ${guests}</li>
        <li><strong>Nights:</strong> ${nights}</li>
        <li><strong>Total paid:</strong> INR ${total}</li>
      </ul>
      <p><a href="${mapUrl}">Open location in Maps</a></p>
      <p>Thanks for choosing TravelUp.</p>
    `,
  });
};

export const sendBookingCancellationEmail = async ({
  email,
  guestName,
  bookingDetails,
}) => {
  assertMailerConfig();
  const from = getFromAddress();

  const {
    title,
    location,
    checkIn,
    checkOut,
    status,
    refundAmount,
    cancellationReason,
  } = bookingDetails;

  const refundLine = refundAmount > 0
    ? `Refund initiated: INR ${refundAmount}`
    : "No refund applicable for this cancellation.";

  await transporter.sendMail({
    from,
    to: email,
    subject: `Booking cancelled: ${title}`,
    text: [
      `Hi ${guestName},`,
      "",
      "Your booking has been cancelled.",
      `Listing: ${title}`,
      `Location: ${location}`,
      `Check-in: ${checkIn}`,
      `Check-out: ${checkOut}`,
      `Cancellation status: ${status}`,
      refundLine,
      `Reason: ${cancellationReason || "User requested"}`,
      "",
      "If you did not request this, contact TravelUp support.",
    ].join("\n"),
    html: `
      <p>Hi ${guestName},</p>
      <p>Your booking has been <strong>cancelled</strong>.</p>
      <ul>
        <li><strong>Listing:</strong> ${title}</li>
        <li><strong>Location:</strong> ${location}</li>
        <li><strong>Check-in:</strong> ${checkIn}</li>
        <li><strong>Check-out:</strong> ${checkOut}</li>
        <li><strong>Cancellation status:</strong> ${status}</li>
        <li><strong>${refundLine}</strong></li>
        <li><strong>Reason:</strong> ${cancellationReason || "User requested"}</li>
      </ul>
      <p>If you did not request this, contact TravelUp support.</p>
    `,
  });
};