const categories = [
  "All",
  "Rooms",
  "Mountains",
  "Castles",
  "Amazing pools",
  "Camping",
  "Farms",
  "Iconic cities"
];

export default function CategoryFilter({ active, setActive }) {
  return (
    <div className="overflow-x-auto pb-2">
      <div className="flex gap-4 min-w-max">

        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActive(cat)}
            className={`
              px-4 py-2 rounded-full text-sm whitespace-nowrap
              transition-all
              ${
                active === cat
                  ? "bg-black text-white"
                  : "bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200"
              }
            `}
          >
            {cat}
          </button>
        ))}

      </div>
    </div>
  );
}
