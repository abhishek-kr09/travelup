import express from "express";
import wrapAsync from "../utils/wrapAsync.js";
import { protect } from "../middlewares/auth.middleware.js";
import { generateListingDescription } from "../controllers/ai.controller.js";

const router = express.Router();

router.get("/ping", (req, res) => {
  res.status(200).json({ success: true, message: "AI routes active" });
});

router.post(
  "/generate-description",
  protect,
  wrapAsync(generateListingDescription)
);

export default router;
