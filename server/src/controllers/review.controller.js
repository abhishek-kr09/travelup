import Listing from "../models/listing.model.js";
import Review from "../models/review.model.js";
import mongoose from "mongoose";

// CREATE REVIEW
export const createReview = async (req, res) => {
  const { id } = req.params;
  const { comment, description, rating } = req.body;
  const parsedRating = Number(rating);
  const reviewText = (comment ?? description ?? "").trim();

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, message: "Invalid listing id" });
  }

  if (!Number.isFinite(parsedRating) || parsedRating < 1 || parsedRating > 5) {
    return res.status(400).json({ success: false, message: "Valid rating between 1 and 5 is required" });
  }

  const listing = await Listing.findById(id);

  if (!listing) {
    return res.status(404).json({
      success: false,
      message: "Listing not found"
    });
  }

  const existingReview = await Review.findOne({
    listing: id,
    author: req.user._id,
  });

  if (existingReview) {
    return res.status(400).json({
      success: false,
      message: "You have already reviewed this listing"
    });
  }

  const review = new Review({
    comment: reviewText,
    rating: parsedRating,
    author: req.user._id,
    listing: id
  });

  await review.save();

  listing.reviews.push(review._id);
  await listing.save();

  res.status(201).json({
    success: true,
    data: review
  });
};

// UPDATE REVIEW
export const updateReview = async (req, res) => {
  const { id, reviewId } = req.params;
  const { comment, description, rating } = req.body;
  const parsedRating = Number(rating);
  const reviewText = (comment ?? description ?? "").trim();

  if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(reviewId)) {
    return res.status(400).json({ success: false, message: "Invalid review/listing id" });
  }

  if (!Number.isFinite(parsedRating) || parsedRating < 1 || parsedRating > 5) {
    return res.status(400).json({ success: false, message: "Valid rating between 1 and 5 is required" });
  }

  const review = await Review.findById(reviewId);

  if (!review || review.listing.toString() !== id) {
    return res.status(404).json({ success: false, message: "Review not found" });
  }

  const isAuthor = review.author.toString() === req.user._id.toString();
  if (!isAuthor) {
    return res.status(403).json({ success: false, message: "Not authorized to edit this review" });
  }

  review.rating = parsedRating;
  review.comment = reviewText;
  await review.save();

  res.status(200).json({
    success: true,
    data: review,
    message: "Review updated successfully"
  });
};

// DELETE REVIEW
export const deleteReview = async (req, res) => {
  const { id, reviewId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(reviewId)) {
    return res.status(400).json({ success: false, message: "Invalid review/listing id" });
  }

  const listing = await Listing.findById(id).select("owner");
  if (!listing) {
    return res.status(404).json({ success: false, message: "Listing not found" });
  }

  const review = await Review.findById(reviewId);

  if (!review) {
    return res.status(404).json({
      success: false,
      message: "Review not found"
    });
  }

  const isAuthor = review.author.toString() === req.user._id.toString();
  const isListingOwner = listing.owner?.toString() === req.user._id.toString();

  if (!isAuthor && !isListingOwner) {
    return res.status(403).json({
      success: false,
      message: "Not authorized to delete this review"
    });
  }

  await Listing.findByIdAndUpdate(id, {
    $pull: { reviews: reviewId }
  });

  await review.deleteOne();

  res.status(200).json({
    success: true,
    message: "Review deleted successfully"
  });
};

// GET REVIEWS FOR LISTING
export const getReviewsForListing = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, message: "Invalid listing id" });
  }

  const reviews = await Review.find({ listing: id })
    .populate("author", "firstName lastName username email")
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: reviews.length,
    data: reviews
  });
};
