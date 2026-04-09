import { useEffect, useState } from "react";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";
import ConfirmDialog from "../components/ConfirmDialog";

export default function MyBookings() {
  const { user, loading: authLoading } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancellingId, setCancellingId] = useState(null);
  const [cancelMessage, setCancelMessage] = useState("");
  const [confirmCancelId, setConfirmCancelId] = useState(null);

  useEffect(() => {
    if (authLoading || !user) return;
    fetchBookings();
  }, [user, authLoading]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await API.get("/bookings/my");
      setBookings(res.data.data || []);
    } catch (err) {
      setError("Failed to load bookings.");
    } finally {
      setLoading(false);
    }
    // FIX: removed console.log(res.data) that was outside try block — would crash
  };

  const cancelBooking = async (id) => {
    setCancelMessage("");
    try {
      setCancellingId(id);
      const res = await API.patch(`/bookings/${id}/cancel`);
      // Show refund message from server
      setCancelMessage(res.data.message || "Booking cancelled.");
      fetchBookings();
    } catch (err) {
      setError(err?.response?.data?.message || "Cancel failed.");
    } finally {
      setCancellingId(null);
    }
    // FIX: removed toast.error — toast was never imported, caused crash
  };

  if (authLoading || loading) {
    return <div className="text-center py-20 text-gray-500">Loading bookings...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-2 sm:px-4 py-8 sm:py-12">
      <h1 className="text-3xl font-semibold mb-8">My Bookings</h1>

      {error && (
        <div className="text-red-500 mb-4 p-3 bg-red-50 dark:bg-red-950 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Refund / cancellation confirmation message */}
      {cancelMessage && (
        <div className="text-green-700 dark:text-green-400 mb-4 p-3 bg-green-50 dark:bg-green-950 rounded-lg text-sm">
          {cancelMessage}
        </div>
      )}

      {bookings.length === 0 ? (
        <div className="surface-card text-center py-14 text-zinc-500">No bookings yet.</div>
      ) : (
        <div className="grid gap-6">
          {bookings.map((booking) => (
            <div
              key={booking._id}
              className="surface-card p-5 sm:p-6"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold">
                    {booking.listing?.title || "Listing removed"}
                  </h2>
                  <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">
                    {new Date(booking.checkIn).toLocaleDateString()} →{" "}
                    {new Date(booking.checkOut).toLocaleDateString()}
                    {" · "}{booking.nights} night{booking.nights > 1 ? "s" : ""}
                    {" · "}{booking.guests} guest{booking.guests > 1 ? "s" : ""}
                  </p>
                </div>
                <StatusBadge status={booking.status} />
              </div>

              {/* Price breakdown */}
              <div className="mt-4 text-sm text-zinc-600 dark:text-zinc-400 space-y-1">
                <p>₹{booking.pricePerNight}/night × {booking.nights} nights = ₹{booking.subtotal}</p>
                <p>Tax: ₹{booking.tax}</p>
                <p className="font-semibold text-base text-zinc-900 dark:text-white">
                  Total: ₹{booking.total}
                </p>
                {/* FIX: show refund amount when status is refunded */}
                {booking.status === "refunded" && booking.refundAmount > 0 && (
                  <p className="text-green-600 dark:text-green-400 font-medium">
                    Refunded: ₹{booking.refundAmount}
                  </p>
                )}
              </div>

              {/* Pending explanation */}
              {booking.status === "pending" && (
                <p className="mt-3 text-xs text-yellow-600 dark:text-yellow-400">
                  Payment is being confirmed. This may take a few seconds.
                </p>
              )}

              {/* Cancel button — only for confirmed bookings */}
              {booking.status === "confirmed" && (
                <button
                  onClick={() => setConfirmCancelId(booking._id)}
                  disabled={cancellingId === booking._id}
                  className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:opacity-90 transition text-sm disabled:opacity-50"
                >
                  {cancellingId === booking._id ? "Cancelling..." : "Cancel Booking"}
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={Boolean(confirmCancelId)}
        title="Cancel this booking?"
        message="Refund amount depends on cancellation policy."
        confirmLabel="Yes, Cancel"
        onCancel={() => setConfirmCancelId(null)}
        onConfirm={() => cancelBooking(confirmCancelId)}
        loading={Boolean(confirmCancelId && cancellingId === confirmCancelId)}
      />
    </div>
  );
}

// FIX: added pending and refunded states
function StatusBadge({ status }) {
  const styles = {
    confirmed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    cancelled:  "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    pending:    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    refunded:   "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  };

  return (
    <span className={`shrink-0 px-3 py-1 text-xs font-medium rounded-full ${styles[status] || "bg-gray-200 text-gray-700"}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}