import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import API from "../api/axios";

const MAX_POLLS = 12;
const POLL_INTERVAL = 2500;

export default function BookingSuccess() {
  // FIX: read session_id Stripe appends to the redirect URL
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");

  const [status, setStatus] = useState("polling");
  const [booking, setBooking] = useState(null);

  useEffect(() => {
    let attempts = 0;

    const poll = async () => {
      try {
        const res = await API.get("/bookings/my");
        const bookings = res.data.data || [];

        // FIX: find the booking that matches THIS session, not just bookings[0]
        const match = bookings.find(
          b => b.stripeSessionId === sessionId && b.status === "confirmed"
        );

        if (match) {
          setBooking(match);
          setStatus("confirmed");
          return;
        }

        attempts++;
        if (attempts >= MAX_POLLS) {
          setStatus("timeout");
          return;
        }

        setTimeout(poll, POLL_INTERVAL);
      } catch {
        setStatus("timeout");
      }
    };

    poll();
  }, [sessionId]);

  if (status === "polling") {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-10 h-10 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-gray-500 text-sm">Confirming your payment...</p>
        </div>
      </div>
    );
  }

  if (status === "timeout") {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="surface-card p-8 sm:p-10 text-center max-w-md w-full space-y-4">
          <div className="text-yellow-500 text-4xl">⏳</div>
          <h1 className="text-2xl font-bold">Payment received</h1>
          <p className="text-zinc-500 text-sm">
            Your payment went through. Booking confirmation is taking a moment —
            check My Bookings in a few seconds.
          </p>
          <Link to="/bookings/my" className="block bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 py-3 rounded-xl font-medium hover:opacity-90 transition">
            View My Bookings
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="surface-card p-8 sm:p-10 text-center max-w-md w-full space-y-5">
        <div className="text-green-600 text-5xl">✓</div>
        <h1 className="text-2xl font-bold">Booking Confirmed!</h1>

        {booking && (
          <div className="bg-stone-100 dark:bg-zinc-800 rounded-xl p-4 text-sm text-left space-y-2 border border-stone-200 dark:border-zinc-700">
            <p className="font-semibold text-base">{booking.listing?.title}</p>
            <p className="text-zinc-500">
              {new Date(booking.checkIn).toLocaleDateString()} →{" "}
              {new Date(booking.checkOut).toLocaleDateString()}
            </p>
            <p className="text-zinc-500">
              {booking.nights} night{booking.nights > 1 ? "s" : ""} ·{" "}
              {booking.guests} guest{booking.guests > 1 ? "s" : ""}
            </p>
            <hr className="border-gray-200 dark:border-zinc-700" />
            <p className="font-semibold">Total paid: ₹{booking.total}</p>
          </div>
        )}

        <div className="flex flex-col gap-3 pt-2">
          <Link to="/bookings/my" className="bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 py-3 rounded-xl font-medium hover:opacity-90 transition">
            View My Bookings
          </Link>
          <Link to="/listings" className="border border-zinc-300 dark:border-zinc-700 py-3 rounded-xl font-medium hover:bg-zinc-900 hover:text-white dark:hover:bg-zinc-100 dark:hover:text-zinc-900 transition">
            Explore More Listings
          </Link>
        </div>
      </div>
    </div>
  );
}