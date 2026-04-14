import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../api/axios";
import toast from "react-hot-toast";
import ConfirmDialog from "../components/ConfirmDialog";

import ListingHeader from "../components/listing/ListingHeader";
import ListingGallery from "../components/listing/ListingGallery";
import ListingInfo from "../components/listing/ListingInfo";
import BookingSection from "../components/listing/BookingSection";
import ReviewsSection from "../components/listing/ReviewsSection";
import MapSection from "../components/listing/MapSection";
import MeetHostSection from "../components/listing/MeetHostSection";
import NearbyListingsSection from "../components/listing/NearbyListingsSection";
import ThingsToKnowSection from "../components/listing/ThingsToKnowSection";

export default function ListingDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [hostProfile, setHostProfile] = useState(null);

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

  const fetchHostProfile = async () => {
    try {
      const res = await API.get(`/listings/${id}/host-profile`);
      setHostProfile(res.data.data || null);
    } catch (err) {
      console.error("Host profile fetch error:", err);
      setHostProfile(null);
    }
  };

  useEffect(() => {
    fetchHostProfile();
  }, [id]);

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await API.delete(`/listings/${id}`);
      toast.success("Listing deleted successfully");
      navigate("/listings");
    } catch (error) {
      console.error("Delete failed:", error);
      toast.error(error?.response?.data?.message || "Failed to delete listing");
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  if (loading) return <div className="p-10">Loading...</div>;
  if (!listing) return <div className="p-10">Listing not found</div>;

  return (
    <div className="max-w-7xl mx-auto py-8 sm:py-10 space-y-12 sm:space-y-16">

      {/* Header */}
      <ListingHeader
        listing={listing}
        user={user}
        onDelete={() => setShowDeleteConfirm(true)}
      />

      {/* Gallery + Info + Booking */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <ListingGallery listing={listing} />

        <div className="flex flex-col justify-between">
          <ListingInfo listing={listing} />
          <BookingSection listing={listing} user={user} />
        </div>
      </div>

      {/* Reviews Section */}
      <ReviewsSection
  listingId={id}
  listingOwnerId={listing.owner?._id || listing.owner}
  user={user}
/>

      {/* Map Section */}
      <MapSection geometry={listing.geometry} />

      {/* Meet Host Section */}
      <MeetHostSection hostProfile={hostProfile} />

      {/* Nearby Listings Section */}
      <NearbyListingsSection listingId={id} />

      {/* Things To Know Section */}
      <ThingsToKnowSection listing={listing} />

      <ConfirmDialog
        open={showDeleteConfirm}
        title="Delete this listing?"
        message="This action cannot be undone."
        confirmLabel="Delete"
        onCancel={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        loading={deleting}
      />



    </div>
  );
}
