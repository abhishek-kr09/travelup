const express = require("express");
const router = express.Router({ mergeParams: true });

const reviewController = require("../controllers/review.controller");
const { protect } = require("../middlewares/auth.middleware");
const wrapAsync = require("../utils/wrapAsync");

// POST /api/listings/:id/reviews
router.post(
  "/:id/reviews",
  protect,
  wrapAsync(reviewController.createReview)
);

// GET /api/listings/:id/reviews
router.get(
  "/:id/reviews",
  wrapAsync(reviewController.getReviewsForListing)
);

// DELETE /api/listings/:id/reviews/:reviewId
router.delete(
  "/:id/reviews/:reviewId",
  protect,
  wrapAsync(reviewController.deleteReview)
);

module.exports = router;
