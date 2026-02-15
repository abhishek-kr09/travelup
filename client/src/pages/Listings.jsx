import { useEffect, useState } from "react";
import API from "../api/axios";
import ListingCard from "../components/ListingCard";
import CategoryFilter from "../components/CategoryFilter";
import SearchBar from "../components/SearchBar";

export default function Listings() {
  const [listings, setListings] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [activeCategory, setActiveCategory] = useState("All");

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    const res = await API.get("/listings");
    setListings(res.data.data);
    setFiltered(res.data.data);
  };

  // CATEGORY FILTER
  useEffect(() => {
    if (activeCategory === "All") {
      setFiltered(listings);
    } else {
      setFiltered(
        listings.filter(
          (item) => item.category === activeCategory
        )
      );
    }
  }, [activeCategory, listings]);

  // SEARCH
  const handleSearch = (query) => {
    const lower = query.toLowerCase();

    const result = listings.filter((item) =>
      item.title.toLowerCase().includes(lower) ||
      item.location.toLowerCase().includes(lower)
    );

    setFiltered(result);
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">
        Explore stays
      </h1>

      <CategoryFilter
        active={activeCategory}
        setActive={setActiveCategory}
      />

      <SearchBar onSearch={handleSearch} />

      {/* GRID */}
      <div className="grid gap-8
                      sm:grid-cols-1
                      md:grid-cols-2
                      lg:grid-cols-3
                      xl:grid-cols-4">
        {filtered.map((listing) => (
          <ListingCard
            key={listing._id}
            listing={listing}
          />
        ))}
      </div>
    </div>
  );
}
