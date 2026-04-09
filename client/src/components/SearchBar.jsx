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
          border border-stone-300 dark:border-zinc-700
          bg-stone-50 dark:bg-zinc-900
          text-zinc-800 dark:text-zinc-100
          placeholder:text-zinc-500 dark:placeholder:text-zinc-500
          focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-300
          outline-none
          transition-all
        "
      />
    </div>
  );
}
