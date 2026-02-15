import { useState } from "react";

export default function SearchBar({ onSearch }) {
  const [query, setQuery] = useState("");

  const handleChange = (e) => {
    setQuery(e.target.value);
    onSearch(e.target.value);
  };

  return (
    <div className="relative w-full md:w-96">
      <input
        type="text"
        placeholder="Search by title or location"
        value={query}
        onChange={handleChange}
        className="
          w-full px-4 py-2 rounded-full
          border border-gray-300 dark:border-zinc-700
          bg-white dark:bg-zinc-900
          focus:ring-2 focus:ring-black
          outline-none
          transition-all
        "
      />
    </div>
  );
}
