import Stripe from "stripe";
import mongoose from "mongoose";
import Booking from "../models/booking.model.js";
import Listing from "../models/listing.model.js";
import eventBus from "../events/eventBus.js";
import {
  BOOKING_CONFIRMED_EVENT,
  BOOKING_CANCELLED_EVENT,
} from "../events/eventNames.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const PENDING_HOLD_MINUTES = 31;

const getPendingExpiryCutoff = () =>
  new Date(Date.now() - PENDING_HOLD_MINUTES * 60 * 1000);

const createStripeSessionForBooking = async ({
  listing,
  userId,
  checkIn,
  checkOut,
  guests,
  nights,
  subtotal,
  tax,
  total,
}) => {
  return stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "inr",
          product_data: { name: listing.title },
          unit_amount: total * 100,
        },
        quantity: 1,
      },
    ],
    metadata: {
      listingId: listing._id.toString(),
      userId: userId.toString(),
      checkIn: checkIn.toString(),
      checkOut: checkOut.toString(),
      guests: guests.toString(),
      nights: nights.toString(),
      subtotal: subtotal.toString(),
      tax: tax.toString(),
      total: total.toString(),
      pricePerNight: listing.price.toString(),
    },
    success_url: `${process.env.CLIENT_URL}/booking-success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.CLIENT_URL}/bookings/my`,
    expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
  });
};

export const getMyBookings = async (req, res) => {
  const bookings = await Booking.find({ user: req.user._id })
    .populate("listing", "title location price image")
    .sort({ createdAt: -1 });
  res.status(200).json({ success: true, count: bookings.length, data: bookings });
};

export const getHostBookings = async (req, res) => {
  const listings = await Listing.find({ owner: req.user._id }).select("_id");
  const listingIds = listings.map(l => l._id);

  const bookings = await Booking.find({ listing: { $in: listingIds } })
    .populate("listing", "title location")
    .populate("user", "username email")
    .sort({ createdAt: -1 });

  const confirmed = bookings.filter(b => b.status === "confirmed");
  const cancelled = bookings.filter(
    b => b.status === "cancelled" || b.status === "refunded"
  );
  const totalRevenue = Number(
    confirmed.reduce((sum, b) => sum + (b.total || 0), 0).toFixed(2)
  );

  res.status(200).json({
    success: true,
    data: {
      summary: { totalRevenue, totalBookings: confirmed.length },
      confirmedBookings: confirmed,
      cancelledBookings: cancelled,
    },
  });
};

export const cancelBooking = async (req, res) => {
  const { bookingId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(bookingId)) {
    return res.status(400).json({ success: false, message: "Invalid booking id" });
  }

  const booking = await Booking.findById(bookingId);

  if (!booking)
    return res.status(404).json({ success: false, message: "Booking not found" });

  if (booking.user.toString() !== req.user._id.toString())
    return res.status(403).json({ success: false, message: "Not authorized" });

  if (booking.status === "cancelled")
    return res.status(400).json({ success: false, message: "Already cancelled" });

  if (booking.status === "refunded")
    return res.status(400).json({ success: false, message: "Already refunded" });

  const wasPendingHold = booking.status === "pending";
  const wasConfirmedBooking = booking.status === "confirmed";

  const now = new Date();
  const daysUntilCheckIn = (new Date(booking.checkIn) - now) / (1000 * 60 * 60 * 24);

  let refundAmount = 0;
  if (daysUntilCheckIn >= 7) refundAmount = booking.total;
  else if (daysUntilCheckIn >= 2) refundAmount = booking.subtotal;

  if (refundAmount > 0 && booking.paymentIntentId) {
    try {
      await stripe.refunds.create({
        payment_intent: booking.paymentIntentId,
        amount: Math.round(refundAmount * 100),
      });
      booking.status = "refunded";
      booking.refundAmount = refundAmount;
    } catch (err) {
      console.error("Stripe refund failed:", err.message);
      return res.status(500).json({ success: false, message: "Refund failed" });
    }
  } else {
    booking.status = "cancelled";
  }

  booking.cancellationReason = req.body?.reason || "User requested";
  await booking.save();

  if (wasConfirmedBooking) {
    eventBus.emit(BOOKING_CANCELLED_EVENT, { bookingId: booking._id.toString() });
  }

  const message = wasPendingHold
    ? "Pending booking cancelled successfully."
    : refundAmount > 0
      ? `Cancelled. Refund of ₹${refundAmount} initiated.`
      : "Cancelled. No refund applicable.";

  res.status(200).json({
    success: true,
    message,
    refundAmount,
  });
};

export const createCheckoutSession = async (req, res) => {
  try {
    const { listingId } = req.params;
    const { checkIn, checkOut, guests } = req.body;

    if (!mongoose.Types.ObjectId.isValid(listingId)) {
      return res.status(400).json({ message: "Invalid listing id" });
    }

    const guestsCount = Number(guests);
    if (!Number.isInteger(guestsCount) || guestsCount < 1) {
      return res.status(400).json({ message: "Guests must be a positive integer" });
    }

    const listing = await Listing.findById(listingId);
    if (!listing)
      return res.status(404).json({ message: "Listing not found" });

    if (listing.owner.toString() === req.user._id.toString())
      return res.status(403).json({ message: "You cannot book your own listing" });

    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const now = new Date();

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return res.status(400).json({ message: "Invalid check-in/check-out date" });
    }

    if (start < now.setHours(0, 0, 0, 0))
      return res.status(400).json({ message: "Check-in cannot be in the past" });

    if (start >= end)
      return res.status(400).json({ message: "Check-out must be after check-in" });

    const nights = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

    if (listing.maxGuests && guestsCount > listing.maxGuests)
      return res.status(400).json({ message: `Max ${listing.maxGuests} guests allowed` });

    // Release stale pending reservations when webhook expiration is delayed/missed.
    const pendingExpiryCutoff = getPendingExpiryCutoff();
    await Booking.updateMany(
      {
        listing: listingId,
        status: "pending",
        updatedAt: { $lt: pendingExpiryCutoff },
      },
      {
        status: "cancelled",
        cancellationReason: "Payment session expired (auto cleanup)",
      }
    );

    const overlapping = await Booking.findOne({
      listing: listingId,
      checkIn: { $lt: end },
      checkOut: { $gt: start },
      $or: [
        { status: "confirmed" },
        { status: "pending", updatedAt: { $gte: pendingExpiryCutoff } },
      ],
    });

    if (overlapping) {
      const isSameUserPending =
        overlapping.status === "pending" &&
        overlapping.user.toString() === req.user._id.toString();

      if (!isSameUserPending) {
        return res.status(400).json({
          message: "These dates are currently held/booked by another user",
        });
      }

      if (overlapping.stripeSessionId) {
        try {
          const existingSession = await stripe.checkout.sessions.retrieve(
            overlapping.stripeSessionId
          );

          if (existingSession?.status === "open" && existingSession?.url) {
            return res.status(200).json({
              url: existingSession.url,
              bookingId: overlapping._id,
              reused: true,
            });
          }
        } catch (sessionErr) {
          console.error("Existing session fetch failed:", sessionErr.message);
        }
      }

      // Old/closed same-user pending hold: release it and create a fresh session below.
      overlapping.status = "cancelled";
      overlapping.cancellationReason = "Retrying payment with a fresh session";
      await overlapping.save();
    }

    const subtotal = nights * listing.price;
    const tax = Math.round(subtotal * 0.1);
    const total = subtotal + tax;

    const session = await createStripeSessionForBooking({
      listing,
      userId: req.user._id,
      checkIn,
      checkOut,
      guests: guestsCount,
      nights,
      subtotal,
      tax,
      total,
    });

    await Booking.create({
      listing: listingId,
      user: req.user._id,
      checkIn: start,
      checkOut: end,
      guests: guestsCount,
      nights,
      pricePerNight: listing.price,
      subtotal,
      tax,
      total,
      status: "pending",
      stripeSessionId: session.id,
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error("Checkout error:", error);
    res.status(500).json({ message: error.message });
  }
};

export const retryPendingBookingPayment = async (req, res) => {
  const { bookingId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(bookingId)) {
    return res.status(400).json({ success: false, message: "Invalid booking id" });
  }

  const booking = await Booking.findById(bookingId).populate("listing");
  if (!booking) {
    return res.status(404).json({ success: false, message: "Booking not found" });
  }

  if (booking.user.toString() !== req.user._id.toString()) {
    return res.status(403).json({ success: false, message: "Not authorized" });
  }

  if (booking.status !== "pending") {
    return res.status(400).json({ success: false, message: "Only pending bookings can be retried" });
  }

  const pendingExpiryCutoff = getPendingExpiryCutoff();

  await Booking.updateMany(
    {
      listing: booking.listing._id,
      status: "pending",
      updatedAt: { $lt: pendingExpiryCutoff },
    },
    {
      status: "cancelled",
      cancellationReason: "Payment session expired (auto cleanup)",
    }
  );

  const conflictingActive = await Booking.findOne({
    _id: { $ne: booking._id },
    listing: booking.listing._id,
    checkIn: { $lt: booking.checkOut },
    checkOut: { $gt: booking.checkIn },
    $or: [
      { status: "confirmed" },
      { status: "pending", updatedAt: { $gte: pendingExpiryCutoff } },
    ],
  });

  if (conflictingActive) {
    return res.status(400).json({
      success: false,
      message: "This booking slot is now held/booked by another user",
    });
  }

  if (booking.stripeSessionId) {
    try {
      const existingSession = await stripe.checkout.sessions.retrieve(booking.stripeSessionId);
      if (existingSession?.status === "open" && existingSession?.url) {
        return res.status(200).json({ success: true, url: existingSession.url, reused: true });
      }
    } catch (err) {
      console.error("Retry existing session lookup failed:", err.message);
    }
  }

  const session = await createStripeSessionForBooking({
    listing: booking.listing,
    userId: req.user._id,
    checkIn: booking.checkIn,
    checkOut: booking.checkOut,
    guests: booking.guests,
    nights: booking.nights,
    subtotal: booking.subtotal,
    tax: booking.tax,
    total: booking.total,
  });

  booking.stripeSessionId = session.id;
  booking.cancellationReason = undefined;
  await booking.save();

  res.status(200).json({ success: true, url: session.url, reused: false });
};

export const getCheckoutSessionStatus = async (req, res) => {
  const { sessionId } = req.params;

  if (!sessionId) {
    return res.status(400).json({ success: false, message: "Session id is required" });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const metadata = session.metadata || {};
    const sessionUserId = metadata.userId?.toString();

    if (sessionUserId && sessionUserId !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized for this session" });
    }

    let booking = await Booking.findOne({
      stripeSessionId: sessionId,
      user: req.user._id,
    }).populate("listing", "title");

    // Fallback reconciliation path: some older records may miss stripeSessionId.
    if (!booking && session.payment_intent) {
      booking = await Booking.findOne({
        paymentIntentId: session.payment_intent,
        user: req.user._id,
      }).populate("listing", "title");
    }

    if (
      !booking &&
      metadata.listingId &&
      metadata.checkIn &&
      metadata.checkOut
    ) {
      booking = await Booking.findOne({
        user: req.user._id,
        listing: metadata.listingId,
        checkIn: new Date(metadata.checkIn),
        checkOut: new Date(metadata.checkOut),
        status: { $in: ["pending", "confirmed"] },
      })
        .sort({ createdAt: -1 })
        .populate("listing", "title");

      if (booking && !booking.stripeSessionId) {
        booking.stripeSessionId = sessionId;
        await booking.save();
      }
    }

    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found for this session" });
    }

    if (
      booking.status === "pending" &&
      session.status === "complete" &&
      session.payment_status === "paid"
    ) {
      booking.status = "confirmed";
      if (!booking.stripeSessionId) {
        booking.stripeSessionId = sessionId;
      }
      if (session.payment_intent) {
        booking.paymentIntentId = session.payment_intent;
      }
      booking.cancellationReason = undefined;
      await booking.save();
      eventBus.emit(BOOKING_CONFIRMED_EVENT, { bookingId: booking._id.toString() });
    }

    if (booking.status === "pending" && session.status === "expired") {
      booking.status = "cancelled";
      booking.cancellationReason = "Payment session expired";
      await booking.save();
    }

    if (booking.status === "confirmed" && !booking.confirmationEmailSentAt) {
      eventBus.emit(BOOKING_CONFIRMED_EVENT, { bookingId: booking._id.toString() });
    }

    return res.status(200).json({
      success: true,
      data: {
        status: booking.status,
        booking,
      },
    });
  } catch (err) {
    console.error("Checkout session status lookup failed:", err.message);
    return res.status(500).json({
      success: false,
      message: "Failed to verify checkout session",
    });
  }
};

export const stripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body, sig, process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    try {
      const existing = await Booking.findOneAndUpdate(
        {
          stripeSessionId: session.id,
          status: "pending",
        },
        {
          status: "confirmed",
          paymentIntentId: session.payment_intent,
        },
        { returnDocument: "after" }
      );

      if (existing) {
        console.log("✅ Booking confirmed:", existing._id);
        eventBus.emit(BOOKING_CONFIRMED_EVENT, { bookingId: existing._id.toString() });
      } else {
        console.error("❌ No pending booking for session:", session.id);

        const fallbackBooking = await Booking.findOne({
          $or: [
            { stripeSessionId: session.id },
            { paymentIntentId: session.payment_intent },
          ],
          status: "confirmed",
        }).select("_id confirmationEmailSentAt");

        if (fallbackBooking && !fallbackBooking.confirmationEmailSentAt) {
          eventBus.emit(BOOKING_CONFIRMED_EVENT, {
            bookingId: fallbackBooking._id.toString(),
          });
        }
      }
    } catch (err) {
      if (err.code === 11000) {
        console.log("⚠️ Duplicate webhook ignored");
        return res.status(200).json({ received: true });
      }
      console.error("Booking confirmation failed:", err);
    }
  }

  if (event.type === "checkout.session.expired") {
    const session = event.data.object;
    await Booking.findOneAndUpdate(
      { stripeSessionId: session.id, status: "pending" },
      { status: "cancelled", cancellationReason: "Payment session expired" }
    );
    console.log("🕐 Pending booking released");
  }

  res.status(200).json({ received: true });
};