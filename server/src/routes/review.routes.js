const express = require("express");
const router = express.Router({ mergeParams: true });

const reviewController = require("../controllers/review.controller");
const wrapAsync = require("../utils/wrapAsync");

const { protect } = require("../middlewares/auth.middleware");


// CREATE REVIEW
router.post(
  "/",
  protect,
  wrapAsync(reviewController.createReview)
);


// DELETE REVIEW
router.delete(
  "/:reviewId",
  protect,
  wrapAsync(reviewController.deleteReview)
);

module.exports = router;
