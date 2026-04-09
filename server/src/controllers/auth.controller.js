import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Listing from "../models/listing.model.js";

const getCookieOptions = () => {
  const isProd = process.env.NODE_ENV === "production";

  return {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };
};

// Generate JWT
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
};

// REGISTER
export const register = async (req, res) => {
  const username = req.body.username?.trim();
  const email = req.body.email?.trim().toLowerCase();
  const password = req.body.password;

  if (!username || !email || !password) {
    return res.status(400).json({
      success: false,
      message: "Username, email, and password are required"
    });
  }

  if (password.length < 6) {
    return res.status(400).json({
      success: false,
      message: "Password must be at least 6 characters"
    });
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: "User already exists"
    });
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await User.create({
    username,
    email,
    password: hashedPassword
  });

  const token = generateToken(user);
  res.cookie("token", token, getCookieOptions());

  res.status(201).json({
    success: true,
    message: "User registered successfully"
  });
};

// LOGIN
export const login = async (req, res) => {
  const email = req.body.email?.trim().toLowerCase();
  const password = req.body.password;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Email and password are required"
    });
  }

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(400).json({
      success: false,
      message: "Invalid credentials"
    });
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    return res.status(400).json({
      success: false,
      message: "Invalid credentials"
    });
  }

  const token = generateToken(user);

  res.cookie("token", token, getCookieOptions());

  res.status(200).json({
    success: true,
    message: "Login successful"
  });
};

// LOGOUT
export const logout = (req, res) => {
  const { httpOnly, secure, sameSite } = getCookieOptions();
  res.clearCookie("token", { httpOnly, secure, sameSite });

  res.status(200).json({
    success: true,
    message: "Logged out successfully"
  });
};

// OWNERSHIP CHECK
export const isOwner = async (req, res, next) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);

  if (!listing) {
    return res.status(404).json({
      success: false,
      message: "Listing not found"
    });
  }

  if (!listing.owner || listing.owner.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: "Not authorized. You are not the owner."
    });
  }

  next();
};

// GET ME
export const getMe = async (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user
  });
};
