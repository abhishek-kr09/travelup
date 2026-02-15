const categories = [
  "All",
  "Rooms",
  "Mountains",
  "Castles",
  "Camping",
  "Farms",
  "Amazing pools",
  "Iconic cities"
];

export default function CategoryFilter({ active, setActive }) {
  return (
    <div className="flex flex-wrap gap-3 mb-8">
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => setActive(cat)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300
            ${
              active === cat
                ? "bg-red-500 text-white shadow-md"
                : "bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700"
            }`}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}
