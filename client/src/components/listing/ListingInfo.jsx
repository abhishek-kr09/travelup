export default function ListingInfo({ listing }) {
  return (
    <div className="space-y-4">
      <p className="text-gray-600 dark:text-gray-300">
        {listing.description}
      </p>

      <p className="text-xl font-semibold">
        ₹{listing.price} / night
      </p>

      <p className="text-sm text-gray-500">
        {listing.location}, {listing.country}
      </p>
    </div>
  );
}
