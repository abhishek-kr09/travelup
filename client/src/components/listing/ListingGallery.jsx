export default function ListingGallery({ listing }) {
  return (
    <div className="rounded-2xl overflow-hidden shadow-md">
      <img
        src={listing.image?.url}
        alt={listing.title}
        className="w-full h-[450px] object-cover"
      />
    </div>
  );
}
