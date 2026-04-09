export default function ListingInfo({ listing }) {
  return (
    <div className="surface-card p-5 sm:p-6 space-y-4">
      <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed">
        {listing.description}
      </p>

      <p className="text-xl font-semibold">
        ₹{listing.price} / night
      </p>

      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        {listing.location}, {listing.country}
      </p>
    </div>
  );
}
