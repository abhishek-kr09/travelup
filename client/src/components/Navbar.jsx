import ThemeToggle from "./ThemeToggle";
import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 dark:bg-zinc-900/80 border-b border-gray-200 dark:border-zinc-800">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link
          to="/listings"
          className="text-xl font-semibold text-red-500"
        >
          TravelUp
        </Link>

        {/* Right Side */}
        <div className="flex items-center gap-6">
          <Link
            to="/listings"
            className="hover:text-red-500 transition"
          >
            Explore
          </Link>

          <Link
            to="/login"
            className="hover:text-red-500 transition"
          >
            Login
          </Link>

          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
