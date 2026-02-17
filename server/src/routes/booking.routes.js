import express from "express";
import {
  createCheckoutSession,
  getMyBookings,
  getHostBookings,
  cancelBooking
} from "../controllers/booking.controller.js";

import { protect } from "../middlewares/auth.middleware.js";
import wrapAsync from "../utils/wrapAsync.js";

const router = express.Router({ mergeParams: true });

// My bookings
router.get(
  "/my",
  protect,
  wrapAsync(getMyBookings)
);

// Host bookings
router.get(
  "/manage",
  protect,
  wrapAsync(getHostBookings)
);

// Cancel booking
router.patch(
  "/:bookingId/cancel",
  protect,
  wrapAsync(cancelBooking)
);

// Create Stripe checkout session
router.post(
  "/checkout/:listingId",
  protect,
  createCheckoutSession
);

export default router;
