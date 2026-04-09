import { useNavigate } from "react-router-dom";

export default function ListingHeader({ listing, user, onDelete }) {
  const navigate = useNavigate();

  const isOwner =
    user &&
    listing.owner &&
    user._id === listing.owner._id;

  return (
    <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4 mb-8">
      <h1 className="text-3xl font-semibold leading-tight">
        {listing.title}
      </h1>

      {isOwner && (
        <div className="flex gap-3">
          <button
            onClick={() => navigate(`/listings/${listing._id}/edit`)}
            className="px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg hover:opacity-90 transition"
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
