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
        className="mt-6 w-full bg-zinc-800 dark:bg-zinc-100 text-white dark:text-zinc-900 py-3 rounded-xl hover:opacity-90 transition"
      >
        Login to Book
      </button>
    );
  }

  // Logged-in non-owner
  return (
    <button
      onClick={() => navigate(`/listings/${listing._id}/book`)}
      className="mt-6 w-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 py-3 rounded-xl hover:opacity-90 transition"
    >
      Book Now
    </button>
  );
}
