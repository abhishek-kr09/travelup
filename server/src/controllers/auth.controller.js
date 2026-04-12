import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Listing from "../models/listing.model.js";
import EmailOtp from "../models/emailOtp.model.js";
import { sendOtpEmail } from "../services/email.service.js";
import { config } from "../config/index.js";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const isValidEmail = (email) => EMAIL_REGEX.test(email);

const generateOtpCode = () => String(Math.floor(100000 + Math.random() * 900000));

const createUniqueUsername = async (firstName, lastName) => {
  const base = `${firstName}${lastName}`.toLowerCase().replace(/[^a-z0-9]/g, "") || "user";

  let candidate = base;
  let attempts = 0;

  while (attempts < 5) {
    const existing = await User.findOne({ username: candidate }).select("_id");
    if (!existing) {
      return candidate;
    }
    attempts += 1;
    candidate = `${base}${Math.floor(1000 + Math.random() * 9000)}`;
  }

  return `${base}${Date.now()}`;
};

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
  const firstName = req.body.firstName?.trim();
  const lastName = req.body.lastName?.trim();
  const email = req.body.email?.trim().toLowerCase();
  const password = req.body.password;

  if (!firstName || !lastName || !email || !password) {
    return res.status(400).json({
      success: false,
      message: "First name, last name, email, and password are required"
    });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({
      success: false,
      message: "Please enter a valid email address"
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

  const otpRecord = await EmailOtp.findOne({ email });

  if (!otpRecord || otpRecord.expiresAt < new Date()) {
    return res.status(400).json({
      success: false,
      message: "OTP expired or not found. Please request a new code"
    });
  }

  if (!otpRecord.verifiedAt) {
    return res.status(400).json({
      success: false,
      message: "Please verify OTP before continuing"
    });
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  const username = await createUniqueUsername(firstName, lastName);

  const user = await User.create({
    firstName,
    lastName,
    username,
    email,
    password: hashedPassword
  });

  await EmailOtp.deleteOne({ email });

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

  if (!isValidEmail(email)) {
    return res.status(400).json({
      success: false,
      message: "Please enter a valid email address"
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

export const sendRegisterOtp = async (req, res) => {
  const email = req.body.email?.trim().toLowerCase();

  if (!email) {
    return res.status(400).json({
      success: false,
      message: "Email is required"
    });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({
      success: false,
      message: "Please enter a valid email address"
    });
  }

  if (!config.smtpHost || !config.smtpUser || !config.smtpPass || !config.smtpFrom) {
    return res.status(500).json({
      success: false,
      message: "OTP email service is not configured. Add SMTP_HOST, SMTP_USER, SMTP_PASS, SMTP_FROM in server/.env"
    });
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: "Email is already registered"
    });
  }

  const code = generateOtpCode();
  const expiresAt = new Date(Date.now() + config.otpExpiryMinutes * 60 * 1000);
  const codeHash = await bcrypt.hash(code, 10);

  await EmailOtp.findOneAndUpdate(
    { email },
    { codeHash, expiresAt, verifiedAt: null },
    { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
  );

  await sendOtpEmail({
    email,
    code,
    expiryMinutes: config.otpExpiryMinutes,
  });

  res.status(200).json({
    success: true,
    message: "OTP sent to your email"
  });
};

export const verifyRegisterOtp = async (req, res) => {
  const email = req.body.email?.trim().toLowerCase();
  const otp = req.body.otp?.trim();

  if (!email || !otp) {
    return res.status(400).json({
      success: false,
      message: "Email and OTP are required"
    });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({
      success: false,
      message: "Please enter a valid email address"
    });
  }

  const otpRecord = await EmailOtp.findOne({ email });

  if (!otpRecord || otpRecord.expiresAt < new Date()) {
    return res.status(400).json({
      success: false,
      message: "OTP expired or not found. Please request a new code"
    });
  }

  const isOtpMatch = await bcrypt.compare(otp, otpRecord.codeHash);

  if (!isOtpMatch) {
    return res.status(400).json({
      success: false,
      message: "Invalid OTP"
    });
  }

  otpRecord.verifiedAt = new Date();
  await otpRecord.save();

  return res.status(200).json({
    success: true,
    message: "OTP verified. Continue registration"
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

export const getSession = async (req, res) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(200).json({
      success: true,
      user: null
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(200).json({
        success: true,
        user: null
      });
    }

    return res.status(200).json({
      success: true,
      user
    });
  } catch {
    return res.status(200).json({
      success: true,
      user: null
    });
  }
};
