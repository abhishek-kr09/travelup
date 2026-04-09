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
                  ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                  : "bg-stone-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 hover:bg-stone-300 dark:hover:bg-zinc-700"
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
