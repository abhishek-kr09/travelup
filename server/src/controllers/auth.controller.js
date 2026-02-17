const User = require("../models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Generate JWT
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
};

// REGISTER
exports.register = async (req, res) => {
  const { username, email, password } = req.body;

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
res.cookie("token", token, {
  httpOnly: true,
  secure: true,          // MUST be true on HTTPS
  sameSite: "none",      // MUST be none for cross-site
  maxAge: 7 * 24 * 60 * 60 * 1000
});



  res.status(201).json({
    success: true,
    message: "User registered successfully"
  });
};

// LOGIN
exports.login = async (req, res) => {
  const { email, password } = req.body;

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

  res.cookie("token", token, {
  httpOnly: true,
  secure: true,          // MUST be true on HTTPS
  sameSite: "none",      // MUST be none for cross-site
  maxAge: 7 * 24 * 60 * 60 * 1000
});


  res.status(200).json({
    success: true,
    message: "Login successful"
  });
};


// LOGOUT
exports.logout = (req, res) => {
  res.clearCookie("token");

  res.status(200).json({
    success: true,
    message: "Logged out successfully"
  });
};


const Listing = require("../models/listing.model");

exports.isOwner = async (req, res, next) => {
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

exports.getMe = async (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user
  });
};
