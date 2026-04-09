import express from "express";
const router = express.Router({ mergeParams: true });

// 1. Add .js extensions and use ESM imports
import * as reviewController from "../controllers/review.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import wrapAsync from "../utils/wrapAsync.js";

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

// 2. Use export default
export default router;
