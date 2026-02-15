import { Link } from "react-router-dom";

export default function ListingCard({ listing }) {
  return (
    <Link to={`/listings/${listing._id}`}>
      <div className="group rounded-2xl overflow-hidden 
                      bg-white dark:bg-zinc-900 
                      shadow-sm hover:shadow-xl 
                      transition duration-300 
                      hover:-translate-y-1">

        <div className="overflow-hidden">
          <img
            src={listing.image?.url}
            alt={listing.title}
            className="h-64 w-full object-cover
                       group-hover:scale-105
                       transition duration-500"
          />
        </div>

        <div className="p-4">
          <h3 className="font-semibold text-lg">
            {listing.title}
          </h3>

          <p className="text-sm text-gray-500 dark:text-gray-400">
            {listing.location}, {listing.country}
          </p>

          <p className="mt-2 font-semibold">
            ₹{listing.price}
          </p>
        </div>
      </div>
    </Link>
  );
}
