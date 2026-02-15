import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../api/axios";

import ListingHeader from "../components/listing/ListingHeader";
import ListingGallery from "../components/listing/ListingGallery";
import ListingInfo from "../components/listing/ListingInfo";
import BookingSection from "../components/listing/BookingSection";
import ReviewsSection from "../components/listing/ReviewsSection";
import MapSection from "../components/listing/MapSection";

export default function ListingDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchListing();
  }, [id]);

  const fetchListing = async () => {
    try {
      const res = await API.get(`/listings/${id}`);
      setListing(res.data.data);
    } catch (err) {
      console.error("Listing fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this listing?")) return;

    try {
      await API.delete(`/listings/${id}`);
      navigate("/listings");
    } catch (error) {
      console.error("Delete failed:", error);
      alert("Delete failed");
    }
  };

  if (loading) return <div className="p-10">Loading...</div>;
  if (!listing) return <div className="p-10">Listing not found</div>;

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 space-y-16">

      {/* Header */}
      <ListingHeader
        listing={listing}
        user={user}
        onDelete={handleDelete}
      />

      {/* Owner Section */}
<div className="flex items-center gap-3 border-b pb-4">
  <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center font-semibold">
    {listing.owner?.username?.charAt(0).toUpperCase()}
  </div>

  <div>
    <p className="text-sm text-gray-500">Owned by</p>
    <p className="font-medium">
      {listing.owner?.username}
    </p>
  </div>
</div>


      {/* Gallery + Info + Booking */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <ListingGallery listing={listing} />

        <div className="flex flex-col justify-between">
          <ListingInfo listing={listing} />
          <BookingSection listing={listing} user={user} />
        </div>
      </div>

      {/* Map Section */}
      <MapSection geometry={listing.geometry} />


      {/* Reviews Section */}
      <ReviewsSection
  listingId={id}
  listingOwnerId={listing.owner?._id || listing.owner}
  user={user}
/>



    </div>
  );
}
