const Listing = require("../models/listing.model");
const Review = require("../models/review.model");


// CREATE REVIEW
exports.createReview = async (req, res) => {
  const { id } = req.params; // listing id
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
    author: req.user._id
  });

  await review.save();

  listing.reviews.push(review._id);
  await listing.save();

  res.status(201).json({
    success: true,
    message: "Review created successfully",
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
