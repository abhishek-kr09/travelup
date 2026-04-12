import express from "express";
const router = express.Router();

// 1. Add .js extensions to local imports
import * as authController from "../controllers/auth.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

router.post("/register", authController.register);
router.post("/send-otp", authController.sendRegisterOtp);
router.post("/verify-otp", authController.verifyRegisterOtp);
router.post("/login", authController.login);
router.post("/logout", authController.logout);
router.get("/me", protect, authController.getMe);
router.get("/session", authController.getSession);

// 2. Use export default instead of module.exports
export default router;
