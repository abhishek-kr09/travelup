import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import API from "../api/axios";

export default function CreateBooking() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [listing, setListing] = useState(null);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    fetchListing();
  }, [id]);

  const fetchListing = async () => {
    try {
      const res = await API.get(`/listings/${id}`);
      setListing(res.data.data);
    } catch (err) {
      console.error(err);
      setError("Failed to load listing.");
    }
  };

  const isOwner =
    user &&
    listing &&
    (listing.owner?._id === user._id ||
      listing.owner === user._id);

  // 🔥 Auto-reset checkout if check-in changes
  useEffect(() => {
    if (checkOut && checkOut <= checkIn) {
      setCheckOut("");
    }
  }, [checkIn]);

  // 🔥 Smart nights calculation
  const nights = useMemo(() => {
    if (!checkIn || !checkOut) return 0;

    const start = new Date(checkIn);
    const end = new Date(checkOut);

    const diff = (end - start) / (1000 * 60 * 60 * 24);
    return diff > 0 ? diff : 0;
  }, [checkIn, checkOut]);

  const subtotal = nights * (listing?.price || 0);
  const tax = subtotal * 0.18;
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

  try {
    setLoading(true);

    const res = await API.post(
      `/bookings/checkout/${id}`,
      {
        checkIn,
        checkOut,
        guests: 1, // or however you’re tracking guest count
      }
    );

    // ✅ Redirect to checkout page
    window.location.href = res.data.url;

  } catch (err) {
    setError(
      err.response?.data?.message || "Booking failed"
    );
  } finally {
    setLoading(false);
  }
};


  if (!listing) return <div className="p-10">Loading...</div>;
  if (!user) return null;

  if (isOwner) {
    return (
      <div className="p-10 text-center text-red-500">
        You cannot book your own listing.
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-20 bg-white dark:bg-zinc-900 p-8 rounded-2xl shadow-lg space-y-6">

      <h2 className="text-2xl font-semibold">
        Book {listing.title}
      </h2>

      {/* Check In */}
      <div>
        <label className="block text-sm mb-1">Check In</label>
        <input
          type="date"
          min={today}
          value={checkIn}
          onChange={(e) => setCheckIn(e.target.value)}
          className="w-full border p-2 rounded-lg"
        />
      </div>

      {/* Check Out */}
      <div>
        <label className="block text-sm mb-1">Check Out</label>
        <input
          type="date"
          min={checkIn || today}
          value={checkOut}
          onChange={(e) => setCheckOut(e.target.value)}
          className="w-full border p-2 rounded-lg"
        />
      </div>

      {/* Smart Price Breakdown */}
      {nights > 0 && (
        <div className="bg-gray-100 dark:bg-zinc-800 p-4 rounded-xl space-y-2">
          <p>
            ₹{listing.price} × {nights} nights
          </p>
          <p>Subtotal: ₹{subtotal}</p>
          <p>Tax (18%): ₹{tax.toFixed(0)}</p>
          <hr />
          <p className="font-semibold text-lg">
            Total: ₹{total.toFixed(0)}
          </p>
        </div>
      )}

      {error && (
        <div className="text-red-500 text-sm">
          {error}
        </div>
      )}

      <button
        onClick={handleBooking}
        disabled={loading}
        className="w-full bg-black text-white py-3 rounded-xl hover:opacity-90 transition"
      >
        {loading ? "Processing..." : "Confirm Booking"}
      </button>

    </div>
  );
}
