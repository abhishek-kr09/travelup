import { Link } from "react-router-dom";

export default function ListingCard({ listing }) {
  return (
    <Link to={`/listings/${listing._id}`}>
      <div className="
        group
        rounded-2xl
        overflow-hidden
        bg-white dark:bg-zinc-900
        border border-gray-200 dark:border-zinc-800
        hover:shadow-xl
        transition-all duration-300
        hover:-translate-y-1
      ">

        {/* Image */}
        <div className="relative overflow-hidden">
          <img
            src={listing.image?.url}
            alt={listing.title}
            className="
              h-60 w-full object-cover
              group-hover:scale-105
              transition-transform duration-500
            "
          />
        </div>

        {/* Content */}
        <div className="p-4 space-y-2">
          <h3 className="font-semibold text-lg truncate">
            {listing.title}
          </h3>

          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
            {listing.location}, {listing.country}
          </p>

          <p className="font-medium">
            ₹{listing.price}
            <span className="text-sm text-gray-500"> / night</span>
          </p>
        </div>

      </div>
    </Link>
  );
}
