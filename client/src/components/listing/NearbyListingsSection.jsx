import { useEffect, useRef, useState } from "react";
import API from "../../api/axios";
import ListingCard from "../ListingCard";

export default function NearbyListingsSection({ listingId }) {
  const [allListings, setAllListings] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const touchStartRef = useRef({ x: 0, y: 0 });

  const ITEMS_PER_PAGE = 4;

  useEffect(() => {
    setPage(1);
  }, [listingId]);

  useEffect(() => {
    if (!listingId) return;

    const fetchNearby = async () => {
      try {
        setLoading(true);
        const res = await API.get(`/listings/${listingId}/nearby`, {
          params: { page: 1, limit: 12 },
        });

        setAllListings(res.data.data || []);
      } catch (err) {
        console.error("Nearby fetch error:", err);
        setAllListings([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNearby();
  }, [listingId]);

  const totalPages = Math.ceil(allListings.length / ITEMS_PER_PAGE);

  const pagedListings = Array.from({ length: totalPages }, (_, pageIndex) =>
    allListings.slice(
      pageIndex * ITEMS_PER_PAGE,
      pageIndex * ITEMS_PER_PAGE + ITEMS_PER_PAGE
    )
  );

  if (!allListings.length && !loading) return null;

  const canGoPrev = page > 1;
  const canGoNext = totalPages > 1 && page < totalPages;

  const handleTouchStart = (event) => {
    const touch = event.touches?.[0];
    if (!touch) return;

    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchEnd = (event) => {
    if (loading || totalPages <= 1) return;

    const touch = event.changedTouches?.[0];
    if (!touch) return;

    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;

    // Ignore tiny or mostly vertical gestures.
    if (Math.abs(deltaX) < 50 || Math.abs(deltaX) < Math.abs(deltaY)) return;

    if (deltaX < 0 && canGoNext) {
      setPage((prev) => prev + 1);
    }

    if (deltaX > 0 && canGoPrev) {
      setPage((prev) => prev - 1);
    }
  };

  return (
    <section className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h2 className="text-xl sm:text-2xl font-semibold">More stays nearby</h2>

        {totalPages > 1 && (
          <div className="flex items-center gap-3 self-end sm:self-auto">
            <span className="text-sm text-zinc-500 dark:text-zinc-400">
              {page} / {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => canGoPrev && setPage((prev) => prev - 1)}
                disabled={!canGoPrev || loading}
                className="w-9 h-9 rounded-full border border-zinc-300 dark:border-zinc-700 flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                aria-label="Previous nearby listings"
              >
                ‹
              </button>
              <button
                type="button"
                onClick={() => canGoNext && setPage((prev) => prev + 1)}
                disabled={!canGoNext || loading}
                className="w-9 h-9 rounded-full border border-zinc-300 dark:border-zinc-700 flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                aria-label="Next nearby listings"
              >
                ›
              </button>
            </div>
          </div>
        )}
      </div>

      <div
        className="overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${(page - 1) * 100}%)` }}
        >
          {pagedListings.map((group, groupIndex) => (
            <div
              key={`nearby-page-${groupIndex + 1}`}
              className="min-w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {group.map((listing, index) => (
                <ListingCard
                  key={listing._id}
                  listing={listing}
                  index={groupIndex * ITEMS_PER_PAGE + index}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
