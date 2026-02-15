const Listing = require("../models/listing.model");
const geocodeLocation = require("../utils/geocode");

// GET ALL (with search + category filter)
exports.getAllListings = async (req, res) => {
  const search = (req.query.search || "").trim();
  const category = (req.query.category || "").trim();

  const filter = {};

  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: "i" } },
      { location: { $regex: search, $options: "i" } },
    ];
  }

  if (category) {
    filter.category = category;
  }

  const listings = await Listing.find(filter);

  res.status(200).json({
    success: true,
    count: listings.length,
    data: listings,
  });
};

// GET ONE
exports.getListingById = async (req, res) => {
  const { id } = req.params;

  const listing = await Listing.findById(id)
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
};

// CREATE
exports.createListing = async (req, res) => {
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
      filename: req.file.filename,
    };
  }

  const savedListing = await newListing.save();

  res.status(201).json({
    success: true,
    data: savedListing,
  });
};

// UPDATE
exports.updateListing = async (req, res) => {
  const { id } = req.params;

  let listing = await Listing.findById(id);

  if (!listing) {
    return res.status(404).json({
      success: false,
      message: "Listing not found",
    });
  }

  Object.assign(listing, req.body);

  if (req.file) {
    if (listing.image?.filename) {
      await cloudinary.uploader.destroy(listing.image.filename);
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
};

// DELETE
exports.deleteListing = async (req, res) => {
  const { id } = req.params;

  const deleted = await Listing.findByIdAndDelete(id);

  if (!deleted) {
    return res.status(404).json({
      success: false,
      message: "Listing not found",
    });
  }

  if (deleted.image?.filename) {
    await cloudinary.uploader.destroy(deleted.image.filename);
  }

  res.status(200).json({
    success: true,
    message: "Listing deleted successfully",
  });
};
