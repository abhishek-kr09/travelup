import { useState } from "react";

export default function SearchBar({ onSearch }) {
  const [query, setQuery] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-xl mx-auto mb-12 relative"
    >
      <input
        type="text"
        placeholder="Search listings..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full rounded-full px-6 py-4 pr-32
                   bg-white dark:bg-zinc-900
                   border border-gray-200 dark:border-zinc-700
                   shadow-md focus:ring-2 focus:ring-red-400
                   outline-none transition"
      />

      <button
        type="submit"
        className="absolute right-2 top-2 bottom-2 px-6
                   bg-red-500 hover:bg-red-600
                   text-white rounded-full
                   transition"
      >
        Search
      </button>
    </form>
  );
}
