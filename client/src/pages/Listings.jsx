import { useEffect, useState, useMemo } from "react";
import API from "../api/axios";
import ListingCard from "../components/ListingCard";
import CategoryFilter from "../components/CategoryFilter";
import SearchBar from "../components/SearchBar";

export default function Listings() {
  const [listings, setListings] = useState([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    try {
      const res = await API.get("/listings");
      setListings(res.data.data || []);
      // FIX: removed console.log — never leave these in production code
    } catch (err) {
      setError("Failed to load listings. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const filteredListings = useMemo(() => {
    let result = [...listings];

    if (activeCategory !== "All") {
      result = result.filter((item) => item.category === activeCategory);
    }

    if (searchQuery) {
      const lower = searchQuery.toLowerCase();
      result = result.filter(
        (item) =>
          item.title?.toLowerCase().includes(lower) ||
          item.location?.toLowerCase().includes(lower)
      );
    }

    if (sortOption === "price_asc") result.sort((a, b) => a.price - b.price);
    if (sortOption === "price_desc") result.sort((a, b) => b.price - a.price);

    return result;
  }, [listings, activeCategory, searchQuery, sortOption]);

  return (
    <div className="space-y-8 sm:space-y-10">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Explore stays</h1>
          <p className="text-sm mt-1 text-zinc-600 dark:text-zinc-400">Find places that feel right for your next trip.</p>
        </div>
        <SearchBar onSearch={setSearchQuery} />
      </div>

      <CategoryFilter active={activeCategory} setActive={setActiveCategory} />

      <div className="flex justify-end">
        <select
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
          className="px-4 py-2 rounded-lg border border-stone-300 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-900 text-sm text-zinc-700 dark:text-zinc-200 focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-300 outline-none transition-all"
        >
          <option value="">Sort by</option>
          <option value="price_asc">Price: Low → High</option>
          <option value="price_desc">Price: High → Low</option>
        </select>
      </div>

      {error && (
        <div className="text-center py-6 text-red-500 text-sm">{error}</div>
      )}

      {loading ? (
        <div className="text-center py-20 text-zinc-500">Loading listings...</div>
      ) : filteredListings.length === 0 ? (
        <div className="surface-card text-center py-16 px-4 text-zinc-500">No listings found.</div>
      ) : (
        <div className="grid gap-8 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredListings.map((listing, index) => (
            <ListingCard key={listing._id} listing={listing} index={index} />
          ))}
        </div>
      )}
    </div>
  );
}