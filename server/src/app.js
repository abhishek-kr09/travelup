import express from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";

import { config } from "./config/index.js";
import listingRoutes from "./routes/listing.routes.js";
import authRoutes from "./routes/auth.routes.js";
import reviewRoutes from "./routes/review.routes.js";
import bookingRoutes from "./routes/booking.routes.js";
import { stripeWebhook } from "./controllers/booking.controller.js";

const app = express();
app.set("trust proxy", 1);

// 🔥 Webhook FIRST — before any body parser
app.post(
  "/api/bookings/webhook",
  express.raw({ type: "application/json" }),
  stripeWebhook
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

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/listings", listingRoutes);
app.use("/api/listings", reviewRoutes);
app.use("/api/bookings", bookingRoutes);

app.get("/", (req, res) => {
  res.json({ message: "Travelup API running" });
});

export default app;
