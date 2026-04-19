import express from "express";
const router = express.Router();

import * as authController from "../controllers/auth.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

router.post("/register", authController.register);
router.post("/send-otp", authController.sendRegisterOtp);
router.post("/verify-otp", authController.verifyRegisterOtp);
router.post("/login", authController.login);
router.post("/logout", authController.logout);
router.get("/me", protect, authController.getMe);
router.get("/session", authController.getSession);

export default router;
