import express from "express";
import multer from "multer";

// Local imports (MUST include .js extension)
import * as listingController from "../controllers/listing.controller.js";
import wrapAsync from "../utils/wrapAsync.js";
import { protect, isOwner } from "../middlewares/auth.middleware.js";
import { storage } from "../services/cloudConfig.js";
import Booking from "../models/booking.model.js"; // Added this for the booked-dates route

const router = express.Router();
const upload = multer({ storage });

router.get("/my", protect, wrapAsync(listingController.getMyListings));

// GET ALL + CREATE
router.route("/")
  .get(wrapAsync(listingController.getAllListings))
  .post(
    protect, 
    upload.single("image"),
    wrapAsync(listingController.createListing)
  );

// GET ONE + UPDATE + DELETE
router.route("/:id")
  .get(wrapAsync(listingController.getListingById))
  .put(
    protect, 
    isOwner, 
    upload.single("image"),
    wrapAsync(listingController.updateListing)
  )
  .delete(protect, isOwner, wrapAsync(listingController.deleteListing));

// GET BOOKED DATES
router.get("/:id/booked-dates", wrapAsync(async (req, res) => {
  const pendingExpiryCutoff = new Date(Date.now() - 31 * 60 * 1000);

  const bookings = await Booking.find({
    listing: req.params.id,
    checkOut: { $gte: new Date() },
    $or: [
      { status: "confirmed" },
      { status: "pending", createdAt: { $gte: pendingExpiryCutoff } },
    ],
  }).select("checkIn checkOut -_id");

  res.json({ success: true, data: bookings });
}));

export default router;
