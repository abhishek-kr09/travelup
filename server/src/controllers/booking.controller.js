import Stripe from "stripe";
import Booking from "../models/booking.model.js";
import Listing from "../models/listing.model.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// ------------------------------
// GET MY BOOKINGS
// ------------------------------
export const getMyBookings = async (req, res) => {
  const bookings = await Booking.find({ user: req.user._id })
    .populate("listing", "title location price image")
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: bookings.length,
    data: bookings,
  });
};

// ------------------------------
// GET HOST BOOKINGS
// ------------------------------
export const getHostBookings = async (req, res) => {
  const listings = await Listing.find({ owner: req.user._id }).select("_id");
  const listingIds = listings.map(l => l._id);

  const bookings = await Booking.find({
    listing: { $in: listingIds }
  })
    .populate("listing", "title location")
    .populate("user", "username email")
    .sort({ createdAt: -1 });

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

  const formattedRevenue = Number(totalRevenue.toFixed(2));

  res.status(200).json({
    success: true,
    data: {
      summary: {
       totalRevenue: formattedRevenue,
        totalBookings: confirmedBookings.length
      },
      confirmedBookings,
      cancelledBookings
    }
  });
};


// ------------------------------
// CANCEL BOOKING
// ------------------------------
export const cancelBooking = async (req, res) => {
  const { bookingId } = req.params;
  const booking = await Booking.findById(bookingId);

  if (!booking) {
    return res.status(404).json({
      success: false,
      message: "Booking not found",
    });
  }

  if (booking.user.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: "Not authorized",
    });
  }

  booking.status = "cancelled";
  await booking.save();

  res.status(200).json({
    success: true,
    message: "Booking cancelled successfully",
  });
};

// ------------------------------
// CREATE CHECKOUT SESSION
// ------------------------------
export const createCheckoutSession = async (req, res) => {
  try {
    const { listingId } = req.params;
    const { checkIn, checkOut, guests } = req.body;

    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).json({ message: "Listing not found" });
    }

    const start = new Date(checkIn);
    const end = new Date(checkOut);

    if (start >= end) {
      return res.status(400).json({ message: "Invalid dates" });
    }

    const nights = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    if (nights <= 0) {
      return res.status(400).json({ message: "Invalid stay duration" });
    }

    // Overlap check
    const overlapping = await Booking.findOne({
      listing: listingId,
      status: "confirmed",
      checkIn: { $lt: end },
      checkOut: { $gt: start },
    });

    if (overlapping) {
      return res.status(400).json({ message: "Dates already booked" });
    }

    const subtotal = nights * listing.price;
    const tax = Math.round(subtotal * 0.1);
    const total = subtotal + tax;

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: {
              name: listing.title,
            },
            unit_amount: total * 100,
          },
          quantity: 1,
        },
      ],
      metadata: {
        listingId: listingId.toString(),
        userId: req.user._id.toString(),
        checkIn: checkIn.toString(),
        checkOut: checkOut.toString(),
        guests: guests.toString(),
        nights: nights.toString(),
        subtotal: subtotal.toString(),
        tax: tax.toString(),
        total: total.toString(),
        pricePerNight: listing.price.toString(),
      },
      success_url: `${process.env.CLIENT_URL}/booking-success`,
      cancel_url: `${process.env.CLIENT_URL}/booking-cancel`,
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error("Checkout error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ------------------------------
// STRIPE WEBHOOK
// ------------------------------
export const stripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    const { listingId, userId, checkIn, checkOut, guests, total } =
      session.metadata;

    try {
      await Booking.create({
        listing: listingId,
        user: userId,
        checkIn,
        checkOut,
        guests: Number(guests),
        nights: Number(session.metadata.nights),
        pricePerNight: Number(session.metadata.pricePerNight),
        subtotal: Number(session.metadata.subtotal),
        tax: Number(session.metadata.tax),
        total: Number(session.metadata.total),
        status: "confirmed",
        paymentIntentId: session.payment_intent,
      });

      console.log("✅ Booking created after payment");
    } catch (err) {
      console.error("Booking creation failed:", err);
    }
  }

  res.status(200).json({ received: true });
};
