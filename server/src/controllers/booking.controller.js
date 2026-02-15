const Booking = require("../models/booking.model");
const Listing = require("../models/listing.model");


// Helper: check overlapping bookings
const isAvailable = async (listingId, checkIn, checkOut) => {
  const existing = await Booking.find({
    listing: listingId,
    status: { $ne: "cancelled" },
    $or: [
      {
        checkIn: { $lt: new Date(checkOut) },
        checkOut: { $gt: new Date(checkIn) }
      }
    ]
  });

  return existing.length === 0;
};


// CREATE BOOKING
exports.createBooking = async (req, res) => {
  const { listingId  } = req.params; // listing id
  const { checkIn, checkOut, guests } = req.body;

  const listing = await Listing.findById(listingId );

  if (!listing) {
    return res.status(404).json({
      success: false,
      message: "Listing not found"
    });
  }

  // 🚫 Owner cannot book own listing
if (listing.owner?.toString() === req.user._id.toString())
 {
    return res.status(403).json({
      success: false,
      message: "You cannot book your own listing"
    });
  }

  const available = await isAvailable(listingId , checkIn, checkOut);

  if (!available) {
    return res.status(400).json({
      success: false,
      message: "Dates not available"
    });
  }

  const nights = Math.ceil(
    (new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24)
  );

  if (nights <= 0) {
    return res.status(400).json({
      success: false,
      message: "Invalid date range"
    });
  }

  const pricePerNight = listing.price;
  const subtotal = pricePerNight * nights;
  const tax = subtotal * 0.18;
  const total = subtotal + tax;

  const booking = await Booking.create({
    listing: listing._id,
    user: req.user._id,
    checkIn,
    checkOut,
    guests,
    pricePerNight,
    nights,
    subtotal,
    tax,
    total
  });

  res.status(201).json({
    success: true,
    message: "Booking created successfully",
    data: booking
  });
};


// GET MY BOOKINGS
exports.getMyBookings = async (req, res) => {
  const bookings = await Booking.find({ user: req.user._id })
    .populate("listing", "title location price image")
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: bookings.length,
    data: bookings
  });
};


// GET BOOKINGS FOR HOST
exports.getHostBookings = async (req, res) => {
  const listings = await Listing.find({ owner: req.user._id }).select("_id");

  const listingIds = listings.map(l => l._id);

  const bookings = await Booking.find({
    listing: { $in: listingIds }
  })
    .populate("listing", "title location")
    .populate("user", "username email")
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: bookings.length,
    data: bookings
  });
};


// CANCEL BOOKING
exports.cancelBooking = async (req, res) => {
  const { bookingId } = req.params;

  const booking = await Booking.findById(bookingId);

  if (!booking) {
    return res.status(404).json({
      success: false,
      message: "Booking not found"
    });
  }

  // only booking owner can cancel
  if (booking.user.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: "Not authorized"
    });
  }

  booking.status = "cancelled";
  await booking.save();

  res.status(200).json({
    success: true,
    message: "Booking cancelled successfully"
  });
};
