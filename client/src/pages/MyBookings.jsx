import { useEffect, useState } from "react";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function MyBookings() {
  const { user, loading: authLoading } = useAuth();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // Wait for auth to fully load
    if (authLoading) return;

    if (!user) return;

    fetchBookings();
  }, [user, authLoading]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await API.get("/bookings/my");
      console.log("Bookings response:", res.data);
      setBookings(res.data.data || []);
    } catch (err) {
      console.error("Booking fetch error:", err);
      setError("Failed to load bookings");
    } finally {
      setLoading(false);
    }

    console.log("Current user:", user?._id);
console.log("API response:", res.data);

  };

  const cancelBooking = async (id) => {
    try {
      await API.patch(`/bookings/${id}/cancel`);
      fetchBookings();
    } catch (err) {
      console.error("Cancel failed:", err);
      alert("Cancel failed");
    }
  };

  if (authLoading || loading) {
    return (
      <div className="text-center py-20 text-gray-500">
        Loading bookings...
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-semibold mb-8">My Bookings</h1>

      {error && (
        <div className="text-red-500 mb-6">{error}</div>
      )}

      {bookings.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          No bookings yet.
        </div>
      ) : (
        <div className="grid gap-6">
          {bookings.map((booking) => (
            <div
              key={booking._id}
              className="border rounded-2xl p-6 shadow-sm bg-white dark:bg-zinc-900"
            >
              <h2 className="text-xl font-semibold">
                {booking.listing?.title}
              </h2>

              <p className="text-gray-500">
                {new Date(booking.checkIn).toLocaleDateString()} →{" "}
                {new Date(booking.checkOut).toLocaleDateString()}
              </p>

              <p className="mt-2 font-medium">
                ₹{booking.total}
              </p>

              <StatusBadge status={booking.status} />

              {booking.status !== "cancelled" && (
                <button
                  onClick={() => cancelBooking(booking._id)}
                  className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:opacity-90"
                >
                  Cancel
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }) {
  const colors = {
    confirmed: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-700",
  };

  return (
    <span
      className={`inline-block mt-3 px-3 py-1 text-sm rounded-full ${
        colors[status] || "bg-gray-200 text-gray-700"
      }`}
    >
      {status}
    </span>
  );
}

