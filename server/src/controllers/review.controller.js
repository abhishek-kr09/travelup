const Listing = require("../models/listing.model");
const Review = require("../models/review.model");


// CREATE REVIEW
exports.createReview = async (req, res) => {
  const { id } = req.params;
  const { comment, rating } = req.body;

  const listing = await Listing.findById(id);

  if (!listing) {
    return res.status(404).json({
      success: false,
      message: "Listing not found"
    });
  }

  const review = new Review({
    comment,
    rating,
    author: req.user._id,
    listing: id   // 🔥 IMPORTANT FIX
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
exports.deleteReview = async (req, res) => {
  const { id, reviewId } = req.params;

  const review = await Review.findById(reviewId);

  if (!review) {
    return res.status(404).json({
      success: false,
      message: "Review not found"
    });
  }

  if (review.author.toString() !== req.user._id.toString()) {
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

exports.getReviewsForListing = async (req, res) => {
  const { id } = req.params;

  const reviews = await Review.find({ listing: id })
    .populate("author", "username")
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: reviews.length,
    data: reviews
  });
};
