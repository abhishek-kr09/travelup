import Listing from "../models/listing.model.js";
import Review from "../models/review.model.js";
import geocodeLocation from "../utils/geocode.js";
import { cloudinary } from "../services/cloudConfig.js";

/* =========================
   GET ALL
========================= */
export const getAllListings = async (req, res) => {
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
export const getListingById = async (req, res) => {
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
export const createListing = async (req, res) => {
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
        filename: req.file.filename,
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
export const updateListing = async (req, res) => {
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
      message: err.message,
    });
  }
};

/* =========================
   DELETE
========================= */
export const deleteListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: "Listing not found",
      });
    }

    if (listing.image?.filename) {
      const result = await cloudinary.uploader.destroy(listing.image.filename);
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

export const getMyListings = async (req, res) => {
  const listings = await Listing.find({ owner: req.user._id });
  res.status(200).json({
    success: true,
    count: listings.length,
    data: listings,
  });
};

export const getHostProfileForListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id)
      .populate("owner", "firstName lastName username createdAt");

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: "Listing not found",
      });
    }

    const ownerId = listing.owner?._id || listing.owner;

    const hostListings = await Listing.find({ owner: ownerId }).select("_id");
    const listingIds = hostListings.map((item) => item._id);

    let totalReviews = 0;
    let averageRating = 0;

    if (listingIds.length > 0) {
      const [reviewStats] = await Review.aggregate([
        { $match: { listing: { $in: listingIds } } },
        {
          $group: {
            _id: null,
            totalReviews: { $sum: 1 },
            averageRating: { $avg: "$rating" },
          },
        },
      ]);

      totalReviews = reviewStats?.totalReviews || 0;
      averageRating = reviewStats?.averageRating || 0;
    }

    res.status(200).json({
      success: true,
      data: {
        host: {
          _id: listing.owner?._id,
          firstName: listing.owner?.firstName,
          lastName: listing.owner?.lastName,
          username: listing.owner?.username,
          joinedAt: listing.owner?.createdAt,
        },
        stats: {
          totalListings: hostListings.length,
          totalReviews,
          averageRating: Number(averageRating.toFixed(2)),
        },
      },
    });
  } catch (err) {
    console.error("GET HOST PROFILE ERROR:", err);
    res.status(500).json({ success: false, message: "Failed to load host profile" });
  }
};

export const getNearbyListingsForListing = async (req, res) => {
  try {
    const page = Math.max(Number.parseInt(req.query.page || "1", 10), 1);
    const limit = Math.min(
      Math.max(Number.parseInt(req.query.limit || "4", 10), 1),
      12
    );
    const maxDistanceKm = Math.min(
      Math.max(Number.parseInt(req.query.maxDistanceKm || "1200", 10), 50),
      5000
    );
    const maxDistanceMeters = maxDistanceKm * 1000;

    const listing = await Listing.findById(req.params.id).select(
      "_id country geometry"
    );

    if (!listing) {
      return res.status(404).json({ success: false, message: "Listing not found" });
    }

    if (
      !listing.geometry ||
      listing.geometry.type !== "Point" ||
      !Array.isArray(listing.geometry.coordinates) ||
      listing.geometry.coordinates.length !== 2
    ) {
      return res.status(200).json({
        success: true,
        page,
        limit,
        total: 0,
        totalPages: 0,
        data: [],
      });
    }

    const buildGeoNearStage = (distanceLimit) => ({
      $geoNear: {
        near: {
          type: "Point",
          coordinates: listing.geometry.coordinates,
        },
        key: "geometry",
        distanceField: "distanceMeters",
        spherical: true,
        query: {
          _id: { $ne: listing._id },
        },
        ...(distanceLimit ? { maxDistance: distanceLimit } : {}),
      },
    });

    const [withinRadiusCountDoc] = await Listing.aggregate([
      buildGeoNearStage(maxDistanceMeters),
      { $count: "total" },
    ]);

    const hasWithinRadiusResults = (withinRadiusCountDoc?.total || 0) > 0;
    const geoNearStage = hasWithinRadiusResults
      ? buildGeoNearStage(maxDistanceMeters)
      : buildGeoNearStage(null);

    const [countDoc] = await Listing.aggregate([geoNearStage, { $count: "total" }]);

    const total = countDoc?.total || 0;
    const totalPages = total > 0 ? Math.ceil(total / limit) : 0;
    const currentPage = totalPages > 0 ? Math.min(page, totalPages) : 1;
    const skip = (currentPage - 1) * limit;

    const nearbyListings = await Listing.aggregate([
      geoNearStage,
      { $sort: { distanceMeters: 1 } },
      { $skip: skip },
      { $limit: limit },
      {
        $project: {
          title: 1,
          image: 1,
          price: 1,
          location: 1,
          country: 1,
          category: 1,
          distanceMeters: 1,
        },
      },
    ]);

    res.status(200).json({
      success: true,
      page: currentPage,
      limit,
      maxDistanceKm: hasWithinRadiusResults ? maxDistanceKm : null,
      total,
      totalPages,
      count: nearbyListings.length,
      data: nearbyListings.map((item) => ({
        ...item,
        distanceKm: Number((item.distanceMeters / 1000).toFixed(1)),
      })),
    });
  } catch (err) {
    console.error("GET NEARBY LISTINGS ERROR:", err);
    res.status(500).json({ success: false, message: "Failed to load nearby listings" });
  }
};
