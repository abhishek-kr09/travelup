const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const Listing = require("../models/listing.model");

// 🔐 Protect Route
exports.protect = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized. No token."
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User no longer exists"
      });
    }

    req.user = user;
    next();

  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token"
    });
  }
};

// 🔒 Check Ownership
exports.isOwner = async (req, res, next) => {
  try {
    const { id } = req.params;

    const listing = await Listing.findById(id);

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: "Listing not found"
      });
    }

    if (!listing.owner.equals(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to modify this listing"
      });
    }

    next();

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Ownership check failed"
    });
  }
};
