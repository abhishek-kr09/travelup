import { Link } from "react-router-dom";

export default function ListingCard({ listing, index = 0 }) {
  return (
    <Link to={`/listings/${listing._id}`}>
      <div
        style={{ animationDelay: `${Math.min(index * 70, 560)}ms` }}
        className="
  group
  listing-card-reveal
  relative
  rounded-2xl
  overflow-hidden
  bg-stone-50/95 dark:bg-zinc-900/95
  border border-stone-300/70 dark:border-zinc-800
  shadow-[0_10px_28px_-18px_rgba(15,23,42,0.58)]
  hover:shadow-[0_20px_36px_-18px_rgba(15,23,42,0.7)]
  transition-all duration-300
  hover:-translate-y-1
"
      >
        <div className="pointer-events-none absolute inset-0 opacity-70 dark:opacity-40 bg-[radial-gradient(circle_at_15%_0%,rgba(255,255,255,0.9),transparent_42%)]" />

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
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
        </div>

        {/* Content */}
        <div className="relative p-4 space-y-2">
          <h3 className="font-semibold text-lg truncate text-zinc-900 dark:text-zinc-100">{listing.title}</h3>

          <p className="text-sm text-zinc-600 dark:text-zinc-400 truncate">
            {listing.location}, {listing.country}
          </p>

          <p className="font-medium text-zinc-900 dark:text-zinc-100">
            ₹{listing.price}
            <span className="text-sm text-zinc-500 dark:text-zinc-400"> / night</span>
          </p>
        </div>
      </div>
    </Link>
  );
}
