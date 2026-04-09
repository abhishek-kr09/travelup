import { useParams } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import API from "../api/axios";

// TAX_RATE must match server — server uses 0.10 (10%)
const TAX_RATE = 0.10;

export default function CreateBooking() {
  const { id } = useParams();
  const { user } = useAuth();

  const [listing, setListing] = useState(null);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(1);
  const [bookedRanges, setBookedRanges] = useState([]); // [{checkIn, checkOut}]
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    fetchListing();
    fetchBookedDates();
  }, [id]);

  const fetchListing = async () => {
    try {
      const res = await API.get(`/listings/${id}`);
      setListing(res.data.data);
    } catch {
      setError("Failed to load listing.");
    }
  };

  // Fetch confirmed+pending bookings for this listing
  // so we can block those dates in the UI
  const fetchBookedDates = async () => {
    try {
      const res = await API.get(`/listings/${id}/booked-dates`);
      setBookedRanges(res.data.data || []);
    } catch {
      // non-critical — date blocking is a UX improvement, not a security gate
    }
  };

  const isOwner =
    user &&
    listing &&
    (listing.owner?._id === user._id || listing.owner === user._id);

  // Reset checkout if it falls before new check-in
  useEffect(() => {
    if (checkOut && checkOut <= checkIn) setCheckOut("");
  }, [checkIn]);

  // Check if a given date string falls within any booked range
  const isDateBooked = (dateStr) => {
    const d = new Date(dateStr);
    return bookedRanges.some(({ checkIn: ci, checkOut: co }) => {
      return d >= new Date(ci) && d < new Date(co);
    });
  };

  // Warn user if selected range overlaps a booked range
  const rangeOverlapsBooked = useMemo(() => {
    if (!checkIn || !checkOut) return false;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    return bookedRanges.some(({ checkIn: ci, checkOut: co }) => {
      return start < new Date(co) && end > new Date(ci);
    });
  }, [checkIn, checkOut, bookedRanges]);

  const nights = useMemo(() => {
    if (!checkIn || !checkOut) return 0;
    const diff = (new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24);
    return diff > 0 ? diff : 0;
  }, [checkIn, checkOut]);

  const subtotal = nights * (listing?.price || 0);
  const tax = Math.round(subtotal * TAX_RATE);
  const total = subtotal + tax;

  const handleBooking = async () => {
    setError("");

    if (!checkIn || !checkOut) {
      setError("Please select both dates.");
      return;
    }
    if (new Date(checkOut) <= new Date(checkIn)) {
      setError("Check-out must be after check-in.");
      return;
    }
    if (rangeOverlapsBooked) {
      setError("These dates overlap with an existing booking. Please choose different dates.");
      return;
    }
    if (listing?.maxGuests && guests > listing.maxGuests) {
      setError(`Max ${listing.maxGuests} guests allowed for this listing.`);
      return;
    }

    try {
      setLoading(true);
      const res = await API.post(`/bookings/checkout/${id}`, {
        checkIn,
        checkOut,
        guests,
      });
      window.location.href = res.data.url;
    } catch (err) {
      setError(err.response?.data?.message || "Booking failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!listing) return <div className="p-10 text-center">Loading...</div>;
  if (!user) return null;

  if (isOwner) {
    return (
      <div className="p-10 text-center text-red-500 font-medium">
        You cannot book your own listing.
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-8 sm:mt-14 surface-card p-5 sm:p-8 space-y-6">
      <h2 className="text-2xl font-semibold">Book {listing.title}</h2>

      {/* Check In */}
      <div>
        <label className="block text-sm mb-1">Check In</label>
        <input
          type="date"
          min={today}
          value={checkIn}
          onChange={(e) => setCheckIn(e.target.value)}
          className="w-full border border-stone-300 dark:border-zinc-700 p-2 rounded-lg bg-stone-100 dark:bg-zinc-800"
        />
        {checkIn && isDateBooked(checkIn) && (
          <p className="text-red-500 text-xs mt-1">This date is already booked.</p>
        )}
      </div>

      {/* Check Out */}
      <div>
        <label className="block text-sm mb-1">Check Out</label>
        <input
          type="date"
          min={checkIn || today}
          value={checkOut}
          onChange={(e) => setCheckOut(e.target.value)}
          className="w-full border border-stone-300 dark:border-zinc-700 p-2 rounded-lg bg-stone-100 dark:bg-zinc-800"
        />
      </div>

      {/* Guests */}
      <div>
        <label className="block text-sm mb-1">
          Guests {listing.maxGuests ? `(max ${listing.maxGuests})` : ""}
        </label>
        <input
          type="number"
          min={1}
          max={listing.maxGuests || 99}
          value={guests}
          onChange={(e) => setGuests(Number(e.target.value))}
          className="w-full border border-stone-300 dark:border-zinc-700 p-2 rounded-lg bg-stone-100 dark:bg-zinc-800"
        />
      </div>

      {/* Overlap warning */}
      {rangeOverlapsBooked && (
        <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm p-3 rounded-lg">
          These dates overlap with an existing booking.
        </div>
      )}

      {/* Price Breakdown */}
      {nights > 0 && !rangeOverlapsBooked && (
        <div className="bg-stone-100 dark:bg-zinc-800 p-4 rounded-xl space-y-2 text-sm border border-stone-200 dark:border-zinc-700">
          <p>₹{listing.price} × {nights} night{nights > 1 ? "s" : ""}</p>
          <p>Subtotal: ₹{subtotal}</p>
          <p>Tax (10%): ₹{tax}</p>
          <hr className="border-gray-300 dark:border-zinc-700" />
          <p className="font-semibold text-base">Total: ₹{total}</p>
        </div>
      )}

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <button
        onClick={handleBooking}
        disabled={loading || rangeOverlapsBooked}
        className="w-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 py-3 rounded-xl hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Redirecting to payment..." : "Confirm & Pay"}
      </button>
    </div>
  );
}