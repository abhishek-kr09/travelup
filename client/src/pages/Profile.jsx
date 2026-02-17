import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
import API from "../api/axios";

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
      <div className="flex gap-4 border-b pb-2">
        {["overview", "listings", "bookings", "revenue"].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`capitalize px-3 py-2 rounded-lg ${
              activeTab === tab
                ? "bg-black text-white"
                : "bg-gray-200 dark:bg-zinc-800"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Overview */}
      {activeTab === "overview" && (
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow">
          <p><strong>Username:</strong> {user?.username}</p>
          <p><strong>Email:</strong> {user?.email}</p>
          <p><strong>Total Listings:</strong> {myListings.length}</p>
          <p><strong>Total Bookings:</strong> {myBookings.length}</p>
        </div>
      )}

      {/* Listings */}
      {activeTab === "listings" && (
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow">
          {myListings.length === 0 ? (
            <p>You have not created any listings yet.</p>
          ) : (
            myListings.map(listing => (
              <div key={listing._id} className="flex justify-between py-2">
                <span>{listing.title}</span>
                <a
                  href={`/listings/${listing._id}/edit`}
                  className="text-blue-500"
                >
                  Edit
                </a>
              </div>
            ))
          )}
        </div>
      )}

      {/* Bookings */}
      {activeTab === "bookings" && (
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow">
          {myBookings.length === 0 ? (
            <p>No bookings yet.</p>
          ) : (
            myBookings.map(b => (
              <div key={b._id} className="py-2 border-b">
                <p>{b.listing?.title}</p>
                <p className="text-sm text-gray-500">
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
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow">
          {myListings.length === 0 ? (
            <p>You are not a host yet.</p>
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
