import Listing from "../models/listing.model.js";
import Review from "../models/review.model.js";
import mongoose from "mongoose";

// CREATE REVIEW
export const createReview = async (req, res) => {
  const { id } = req.params;
  const { comment, rating } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, message: "Invalid listing id" });
  }

  if (!comment?.trim() || !Number.isFinite(Number(rating))) {
    return res.status(400).json({ success: false, message: "Comment and valid rating are required" });
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
    comment: comment.trim(),
    rating: Number(rating),
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
    .populate("author", "username")
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: reviews.length,
    data: reviews
  });
};
