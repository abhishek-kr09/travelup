import Booking from "../models/booking.model.js";
import eventBus from "./eventBus.js";
import {
  sendBookingConfirmationEmail,
  sendBookingCancellationEmail,
} from "../services/email.service.js";
import {
  BOOKING_CONFIRMED_EVENT,
  BOOKING_CANCELLED_EVENT,
} from "./eventNames.js";

const toDate = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toDateString();
};

eventBus.on(BOOKING_CONFIRMED_EVENT, async ({ bookingId }) => {
  try {
    if (!bookingId) return;

    const booking = await Booking.findById(bookingId)
      .populate("user", "email firstName lastName username")
      .populate("listing", "title location country");

    if (!booking || booking.status !== "confirmed") return;
    if (booking.confirmationEmailSentAt) return;
    if (!booking.user?.email || !booking.listing) return;

    console.log(
      `📧 Sending booking confirmation email for booking ${booking._id.toString()} to ${booking.user.email}`
    );

    const listingLocation = booking.listing.country
      ? `${booking.listing.location}, ${booking.listing.country}`
      : booking.listing.location;

    const mapQuery = encodeURIComponent(listingLocation);
    const mapUrl = `https://www.google.com/maps/search/?api=1&query=${mapQuery}`;

    await sendBookingConfirmationEmail({
      email: booking.user.email,
      guestName:
        `${booking.user.firstName || ""} ${booking.user.lastName || ""}`.trim() ||
        booking.user.username ||
        "Guest",
      bookingDetails: {
        title: booking.listing.title,
        location: listingLocation,
        mapUrl,
        checkIn: toDate(booking.checkIn),
        checkOut: toDate(booking.checkOut),
        guests: booking.guests,
        nights: booking.nights,
        total: booking.total,
      },
    });

    booking.confirmationEmailSentAt = new Date();
    await booking.save();

    console.log(
      `✅ Booking confirmation email sent for booking ${booking._id.toString()} to ${booking.user.email}`
    );
  } catch (err) {
    console.error("Booking confirmation email event failed:", err.message);
  }
});

eventBus.on(BOOKING_CANCELLED_EVENT, async ({ bookingId }) => {
  try {
    if (!bookingId) return;

    const booking = await Booking.findById(bookingId)
      .populate("user", "email firstName lastName username")
      .populate("listing", "title location country");

    if (!booking || !["cancelled", "refunded"].includes(booking.status)) return;
    if (booking.cancellationEmailSentAt) return;
    if (!booking.user?.email || !booking.listing) return;

    const listingLocation = booking.listing.country
      ? `${booking.listing.location}, ${booking.listing.country}`
      : booking.listing.location;

    await sendBookingCancellationEmail({
      email: booking.user.email,
      guestName:
        `${booking.user.firstName || ""} ${booking.user.lastName || ""}`.trim() ||
        booking.user.username ||
        "Guest",
      bookingDetails: {
        title: booking.listing.title,
        location: listingLocation,
        checkIn: toDate(booking.checkIn),
        checkOut: toDate(booking.checkOut),
        status: booking.status,
        refundAmount: booking.refundAmount || 0,
        cancellationReason: booking.cancellationReason,
      },
    });

    booking.cancellationEmailSentAt = new Date();
    await booking.save();
  } catch (err) {
    console.error("Booking cancellation email event failed:", err.message);
  }
});
