import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
import API from "../api/axios";
import { Link } from "react-router-dom";

export default function Profile() {
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState("overview");
  const [myListings, setMyListings] = useState([]);
  const [myBookings, setMyBookings] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const listingsRes = await API.get("/listings/my");

      setMyListings(listingsRes.data.data || []);

      const bookingsRes = await API.get("/bookings/my");
      setMyBookings(bookingsRes.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const totalRevenue = myListings.length > 0
    ? myBookings
        .filter(b => b.status === "confirmed")
        .reduce((sum, b) => sum + (b.total || 0), 0)
    : 0;

  return (
    <div className="space-y-8">

      <h1 className="text-3xl font-bold">My Profile</h1>

      {/* Tabs */}
      <div className="flex gap-3 border-b border-stone-300 dark:border-zinc-800 pb-3 overflow-x-auto">
        {["overview", "listings", "bookings", "revenue"].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`capitalize px-3 py-2 rounded-lg whitespace-nowrap ${
              activeTab === tab
                ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                : "bg-stone-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Overview */}
      {activeTab === "overview" && (
        <div className="surface-card p-6">
          <div className="grid sm:grid-cols-2 gap-4 text-sm sm:text-base">
            <p><strong>Username:</strong> {user?.username}</p>
            <p><strong>Email:</strong> {user?.email}</p>
            <p><strong>Total Listings:</strong> {myListings.length}</p>
            <p><strong>Total Bookings:</strong> {myBookings.length}</p>
          </div>
        </div>
      )}

      {/* Listings */}
      {activeTab === "listings" && (
        <div className="surface-card p-6">
          {myListings.length === 0 ? (
            <p className="text-zinc-600 dark:text-zinc-400">You have not created any listings yet.</p>
          ) : (
            myListings.map(listing => (
              <div key={listing._id} className="flex items-center justify-between py-3 border-b last:border-b-0 border-stone-200 dark:border-zinc-800">
                <span className="font-medium">{listing.title}</span>
                <Link
                  to={`/listings/${listing._id}/edit`}
                  className="text-zinc-800 dark:text-zinc-200 underline"
                >
                  Edit
                </Link>
              </div>
            ))
          )}
        </div>
      )}

      {/* Bookings */}
      {activeTab === "bookings" && (
        <div className="surface-card p-6">
          {myBookings.length === 0 ? (
            <p className="text-zinc-600 dark:text-zinc-400">No bookings yet.</p>
          ) : (
            myBookings.map(b => (
              <div key={b._id} className="py-3 border-b last:border-b-0 border-stone-200 dark:border-zinc-800">
                <p className="font-medium">{b.listing?.title}</p>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  {new Date(b.checkIn).toLocaleDateString()} →
                  {new Date(b.checkOut).toLocaleDateString()}
                </p>
              </div>
            ))
          )}
        </div>
      )}

      {/* Revenue */}
      {activeTab === "revenue" && (
        <div className="surface-card p-6">
          {myListings.length === 0 ? (
            <p className="text-zinc-600 dark:text-zinc-400">You are not a host yet.</p>
          ) : (
            <p className="text-xl font-semibold">
              Total Revenue: ₹{totalRevenue}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
