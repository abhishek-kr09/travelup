const express = require("express");
const router = express.Router();

const listingController = require("../controllers/listing.controller");
const wrapAsync = require("../utils/wrapAsync");

const { protect, isOwner } = require("../middlewares/auth.middleware");

const multer = require("multer");
const { storage } = require("../services/cloudConfig");
const upload = multer({ storage });

router.get("/my", protect, wrapAsync(listingController.getMyListings));

// GET ALL + CREATE
router.route("/").get(wrapAsync(listingController.getAllListings)).post(
  protect, // 🔐 require login
  upload.single("image"),
  wrapAsync(listingController.createListing),
);

// GET ONE + UPDATE + DELETE
router
  .route("/:id")
  .get(wrapAsync(listingController.getListingById))
  .put(
    protect, // 🔐 require login
    isOwner, // 🔒 must be owner
    upload.single("image"),
    wrapAsync(listingController.updateListing),
  )
  .delete(protect, isOwner, wrapAsync(listingController.deleteListing));



module.exports = router;
