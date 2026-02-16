const express = require("express");
const router = express.Router({ mergeParams: true });

const bookingController = require("../controllers/booking.controller");
const { protect } = require("../middlewares/auth.middleware");
const wrapAsync = require("../utils/wrapAsync");


// Create booking for a listing
router.post(
  "/:listingId",
  protect,
  wrapAsync(bookingController.createBooking)
);

// My bookings
router.get(
  "/my",
  protect,
  wrapAsync(bookingController.getMyBookings)
);

// Host bookings
router.get(
  "/manage",
  protect,
  wrapAsync(bookingController.getHostBookings)
);

// Cancel
router.patch(
  "/:bookingId/cancel",
  protect,
  wrapAsync(bookingController.cancelBooking)
);

module.exports = router;
