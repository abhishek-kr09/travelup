import { useNavigate } from "react-router-dom";

export default function BookingSection({ listing, user }) {
  const navigate = useNavigate();

  const isOwner =
    user &&
    listing.owner &&
    user._id === listing.owner._id;

  // Owner cannot book
  if (isOwner) return null;

  // Not logged in
  if (!user) {
    return (
      <button
        onClick={() =>
          navigate("/login", {
            state: { from: `/listings/${listing._id}` },
          })
        }
        className="mt-6 w-full bg-gray-800 text-white py-3 rounded-xl hover:opacity-90 transition"
      >
        Login to Book
      </button>
    );
  }

  // Logged-in non-owner
  return (
    <button
      onClick={() => navigate(`/listings/${listing._id}/book`)}
      className="mt-6 w-full bg-black text-white py-3 rounded-xl hover:opacity-90 transition"
    >
      Book Now
    </button>
  );
}
