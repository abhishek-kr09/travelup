import { useEffect, useState } from "react";
import API from "../api/axios";

export default function HostBookings() {
  const [summary, setSummary] = useState(null);
  const [confirmedBookings, setConfirmedBookings] = useState([]);
  const [cancelledBookings, setCancelledBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await API.get("/bookings/manage");

      setSummary(res.data.data.summary);
      setConfirmedBookings(res.data.data.confirmedBookings);
      setCancelledBookings(res.data.data.cancelledBookings);
    } catch (err) {
      console.error("Host bookings error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-10 text-center">Loading...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 space-y-12">
      <h1 className="text-3xl font-semibold">Manage Bookings</h1>

      {/* 🔥 Revenue Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="Total Revenue" value={`₹${summary?.totalRevenue || 0}`} />
        <Card title="Total Bookings" value={summary?.totalBookings || 0} />
      </div>

      {/* 🔥 Confirmed Section */}
      <Section title="Confirmed Bookings">
        {confirmedBookings.length === 0 && (
          <p className="text-gray-500">No confirmed bookings yet.</p>
        )}

        {confirmedBookings.map((booking) => (
          <BookingCard
            key={booking._id}
            booking={booking}
            badge={
              <span className="text-green-600 font-medium">
                Confirmed
              </span>
            }
          />
        ))}
      </Section>

      {/* 🔥 Cancelled Section */}
      <Section title="Cancelled Bookings">
        {cancelledBookings.length === 0 && (
          <p className="text-gray-500">No cancelled bookings.</p>
        )}

        {cancelledBookings.map((booking) => (
          <BookingCard
            key={booking._id}
            booking={booking}
            badge={
              <span className="text-red-600 font-medium">
                Cancelled
              </span>
            }
          />
        ))}
      </Section>
    </div>
  );
}

/* ---------- UI Components ---------- */

function Card({ title, value }) {
  return (
    <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow">
      <p className="text-gray-500 text-sm">{title}</p>
      <p className="text-2xl font-semibold">{value}</p>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <section className="space-y-6">
      <h2 className="text-xl font-semibold">{title}</h2>
      {children}
    </section>
  );
}

function BookingCard({ booking, badge }) {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow p-6 flex justify-between items-center">
      <div>
        <h3 className="font-semibold">{booking.listing?.title}</h3>
        <p className="text-sm text-gray-500">
          Guest: {booking.user?.username}
        </p>
        <p className="text-sm">
          {new Date(booking.checkIn).toLocaleDateString()} →{" "}
          {new Date(booking.checkOut).toLocaleDateString()}
        </p>
        <p className="text-sm">
          {booking.nights} nights • ₹{booking.total}
        </p>
      </div>
      {badge}
    </div>
  );
}
