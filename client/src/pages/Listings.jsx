import { useEffect, useState } from "react";
import API from "../api/axios";
import ListingCard from "../components/ListingCard";
import CategoryFilter from "../components/CategoryFilter";
import SearchBar from "../components/SearchBar";

export default function Listings() {
  const [listings, setListings] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [sortOption, setSortOption] = useState("");

  useEffect(() => {
    fetchListings(sortOption);
  }, [sortOption]);

  const fetchListings = async (sort = "") => {
    try {
      const res = await API.get(`/listings${sort ? `?sort=${sort}` : ""}`);

      setListings(res.data.data);
      setFiltered(res.data.data);
    } catch (err) {
      console.error("Error fetching listings:", err);
    } finally {
      setLoading(false);
    }
  };

  // CATEGORY FILTER
  useEffect(() => {
    if (activeCategory === "All") {
      setFiltered(listings);
    } else {
      setFiltered(listings.filter((item) => item.category === activeCategory));
    }
  }, [activeCategory, listings]);

  // SEARCH
  const handleSearch = (query) => {
    const lower = query.toLowerCase();

    const result = listings.filter(
      (item) =>
        item.title.toLowerCase().includes(lower) ||
        item.location.toLowerCase().includes(lower),
    );

    setFiltered(result);
  };

  return (
    <div className="space-y-10">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <h1 className="text-3xl font-semibold tracking-tight">Explore stays</h1>

        <SearchBar onSearch={handleSearch} />
      </div>

      {/* CATEGORY BAR */}
      <CategoryFilter active={activeCategory} setActive={setActiveCategory} />

      <div className="flex justify-end">
        <select
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
          className="
      px-4 py-2 rounded-lg
      border border-gray-300 dark:border-zinc-700
      bg-white dark:bg-zinc-900
      text-sm
      focus:ring-2 focus:ring-black
      outline-none
      transition-all
    "
        >
          <option value="">Sort by</option>
          <option value="price_asc">Price: Low → High</option>
          <option value="price_desc">Price: High → Low</option>
        </select>
      </div>

      {/* CONTENT */}
      {loading ? (
        <div className="text-center py-20 text-gray-500">
          Loading listings...
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          No listings found.
        </div>
      ) : (
        <div
          className="
            grid gap-8
            sm:grid-cols-1
            md:grid-cols-2
            lg:grid-cols-3
            xl:grid-cols-4
            transition-all
          "
        >
          {filtered.map((listing) => (
            <ListingCard key={listing._id} listing={listing} />
          ))}
        </div>
      )}
    </div>
  );
}
