import { useNavigate } from "react-router-dom";

export default function ListingHeader({ listing, user, onDelete }) {
  const navigate = useNavigate();

  const isOwner =
    user &&
    listing.owner &&
    user._id === listing.owner._id;

  return (
    <div className="flex justify-between items-start mb-8">
      <h1 className="text-3xl font-semibold">
        {listing.title}
      </h1>

      {isOwner && (
        <div className="flex gap-3">
          <button
            onClick={() => navigate(`/listings/${listing._id}/edit`)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:opacity-90 transition"
          >
            Edit
          </button>

          <button
            onClick={onDelete}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:opacity-90 transition"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
