export default function ListingGallery({ listing }) {
  return (
    <div className="surface-card rounded-2xl overflow-hidden">
      <img
        src={listing.image?.url}
        alt={listing.title}
        className="w-full h-[280px] sm:h-[360px] md:h-[450px] object-cover"
      />
    </div>
  );
}
