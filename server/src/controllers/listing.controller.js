const Listing = require("../models/listing.model");
const geocodeLocation = require("../utils/geocode");
const { cloudinary } = require("../services/cloudConfig");

/* =========================
   GET ALL
========================= */
exports.getAllListings = async (req, res) => {
  try {
    const { sort } = req.query;

    let sortOption = {};

    if (sort === "price_asc") sortOption.price = 1;
    if (sort === "price_desc") sortOption.price = -1;

    const listings = await Listing.find().sort(sortOption);

    res.status(200).json({
      success: true,
      count: listings.length,
      data: listings,
    });
  } catch (err) {
    console.error("GET ALL ERROR:", err);
    res.status(500).json({ success: false });
  }
};

/* =========================
   GET ONE
========================= */
exports.getListingById = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id)
      .populate({
        path: "reviews",
        populate: { path: "author" },
      })
      .populate("owner");

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: "Listing not found",
      });
    }

    res.status(200).json({
      success: true,
      data: listing,
    });
  } catch (err) {
    console.error("GET ONE ERROR:", err);
    res.status(500).json({ success: false });
  }
};

/* =========================
   CREATE
========================= */
exports.createListing = async (req, res) => {
  try {
    const { location, country } = req.body;

    const geometry = await geocodeLocation(location, country);

    if (!geometry) {
      return res.status(400).json({
        success: false,
        message: "Invalid location",
      });
    }

    const newListing = new Listing({
      ...req.body,
      owner: req.user._id,
      geometry,
    });

    if (req.file) {
      newListing.image = {
        url: req.file.path,
        filename: req.file.filename, // already Travelup/xxxx
      };
    }

    const savedListing = await newListing.save();

    res.status(201).json({
      success: true,
      data: savedListing,
    });
  } catch (err) {
    console.error("CREATE ERROR:", err);
    res.status(500).json({ success: false });
  }
};

/* =========================
   UPDATE
========================= */
exports.updateListing = async (req, res) => {
  try {
    const { id } = req.params;

    const listing = await Listing.findById(id);

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: "Listing not found",
      });
    }

    listing.title = req.body.title ?? listing.title;
    listing.description = req.body.description ?? listing.description;
    listing.price = req.body.price ?? listing.price;
    listing.location = req.body.location ?? listing.location;
    listing.country = req.body.country ?? listing.country;
    listing.category = req.body.category ?? listing.category;

    // Handle image safely
    if (req.file) {
      if (listing.image?.filename) {
        try {
          await cloudinary.uploader.destroy(listing.image.filename);
        } catch (err) {
          console.error("Cloudinary destroy error:", err.message);
        }
      }

      listing.image = {
        url: req.file.path,
        filename: req.file.filename,
      };
    }

    await listing.save();

    res.status(200).json({
      success: true,
      data: listing,
    });

  } catch (err) {
    console.error("UPDATE ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Update failed",
    });
  }
};





/* =========================
   DELETE
========================= */
exports.deleteListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: "Listing not found",
      });
    }

    // 🔥 IMPORTANT: delete image FIRST
    if (listing.image?.filename) {
      const result = await cloudinary.uploader.destroy(
        listing.image.filename
      );

      console.log("Cloudinary delete result:", result);

      if (result.result !== "ok" && result.result !== "not found") {
        return res.status(500).json({
          success: false,
          message: "Cloudinary image deletion failed",
        });
      }
    }

    await listing.deleteOne();

    res.status(200).json({
      success: true,
      message: "Listing deleted successfully",
    });
  } catch (err) {
    console.error("DELETE ERROR:", err);
    res.status(500).json({ success: false });
  }
};
