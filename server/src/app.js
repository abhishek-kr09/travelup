import express from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";

import { config } from "./config/index.js";
import listingRoutes from "./routes/listing.routes.js";
import authRoutes from "./routes/auth.routes.js";
import reviewRoutes from "./routes/review.routes.js";
import bookingRoutes from "./routes/booking.routes.js";
import aiRoutes from "./routes/ai.routes.js";
import { stripeWebhook } from "./controllers/booking.controller.js";
import wrapAsync from "./utils/wrapAsync.js"; // Adjust path if necessary


const app = express();
app.set("trust proxy", 1);

// 🔥 Webhook FIRST — before any body parser
// app.js or server.js — BEFORE express.json() middleware
app.post(
  "/api/bookings/webhook",
  express.raw({ type: "application/json" }), // ← critical, raw body for Stripe
  wrapAsync(stripeWebhook)
);

// Normal middleware after webhook
app.use(cors({
  origin: config.clientURL,
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use(cookieParser());

app.use((req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      success: false,
      message: "Database unavailable. Please check server network/DB and retry.",
    });
  }

  return next();
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/listings", listingRoutes);
app.use("/api/listings", reviewRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/ai", aiRoutes);

app.get("/", (req, res) => {
  res.json({ message: "Travelup API running" });
});

app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

app.use((err, req, res, next) => {
  console.error(err);

  if (err.name === "CastError") {
    return res.status(400).json({ success: false, message: "Invalid request data" });
  }

  const statusCode = err.statusCode || 500;
  const message = statusCode >= 500 ? "Internal server error" : err.message;
  res.status(statusCode).json({ success: false, message });
});

export default app;
