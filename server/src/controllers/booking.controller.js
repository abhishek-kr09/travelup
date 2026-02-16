const Booking = require("../models/booking.model");
const Listing = require("../models/listing.model");


// Helper: check overlapping bookings
const isAvailable = async (listingId, checkIn, checkOut) => {
  const existing = await Booking.find({
    listing: listingId,
    status: { $ne: "cancelled" },
    checkIn: { $lt: new Date(checkOut) },
    checkOut: { $gt: new Date(checkIn) }
  });

  return existing.length === 0;
};



// CREATE BOOKING
exports.createBooking = async (req, res) => {
  const { listingId } = req.params;
  const { checkIn, checkOut, guests = 1 } = req.body;

  if (!checkIn || !checkOut) {
    return res.status(400).json({
      success: false,
      message: "Check-in and check-out required"
    });
  }

  const startDate = new Date(checkIn);
  const endDate = new Date(checkOut);

  if (isNaN(startDate) || isNaN(endDate)) {
    return res.status(400).json({
      success: false,
      message: "Invalid dates"
    });
  }

  if (endDate <= startDate) {
    return res.status(400).json({
      success: false,
      message: "Check-out must be after check-in"
    });
  }

  const listing = await Listing.findById(listingId);

  if (!listing) {
    return res.status(404).json({
      success: false,
      message: "Listing not found"
    });
  }

  if (listing.owner.toString() === req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: "You cannot book your own listing"
    });
  }

  const nights = Math.ceil(
    (endDate - startDate) / (1000 * 60 * 60 * 24)
  );

  if (nights <= 0) {
    return res.status(400).json({
      success: false,
      message: "Invalid date range"
    });
  }

  const available = await isAvailable(listingId, startDate, endDate);

  if (!available) {
    return res.status(400).json({
      success: false,
      message: "Dates not available"
    });
  }

  const pricePerNight = listing.price;
  const subtotal = pricePerNight * nights;
  const tax = Math.round(subtotal * 0.18);
  const total = subtotal + tax;

  const booking = await Booking.create({
  listing: listing._id,
  user: req.user._id,
  checkIn: startDate,
  checkOut: endDate,
  guests,
  pricePerNight,
  nights,
  subtotal,
  tax,
  total,
  status: "confirmed" // ✅ Instant booking
});


  res.status(201).json({
    success: true,
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


// GET BOOKINGS FOR HOST (Instant Book Version)
exports.getHostBookings = async (req, res) => {
  // Get all listings owned by host
  const listings = await Listing.find({ owner: req.user._id }).select("_id");

  const listingIds = listings.map(l => l._id);

  const bookings = await Booking.find({
    listing: { $in: listingIds }
  })
    .populate("listing", "title location")
    .populate("user", "username email")
    .sort({ createdAt: -1 });

  // 🔥 Revenue calculation only from confirmed bookings
  const confirmedBookings = bookings.filter(
    b => b.status === "confirmed"
  );

  const cancelledBookings = bookings.filter(
    b => b.status === "cancelled"
  );

  const totalRevenue = confirmedBookings.reduce(
    (sum, b) => sum + (b.total || 0),
    0
  );

  res.status(200).json({
    success: true,
    data: {
      summary: {
        totalRevenue,
        totalBookings: bookings.length
      },
      confirmedBookings,
      cancelledBookings
    }
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



