import express from "express";
import cors from "cors";
import morgan from "morgan";
import { config } from "./config/index.js";
import listingRoutes from "./routes/listing.routes.js";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes.js";
import reviewRoutes from "./routes/review.routes.js";
import bookingRoutes from "./routes/booking.routes.js";


const app = express();

app.use(cors({
  origin: config.clientURL,
  credentials: true
}));

app.use(express.json());
app.use(morgan("dev"));
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/listings", listingRoutes);
app.use("/api/listings/:id/reviews", reviewRoutes);
app.use("/api/bookings", bookingRoutes);


app.get("/", (req, res) => {
  res.json({ message: "Travelup API running" });
});

app.use((err, req, res, next) => {
  console.error("ERROR:", err);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Something went wrong",
    error: err
  });
});


export default app;
