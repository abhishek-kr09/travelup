import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ThemeToggle from "../components/ThemeToggle";

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-gray-100 dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/listings" className="text-xl font-semibold">
          TravelUp
        </Link>

        {/* Right Section */}
        <div className="flex items-center gap-6">
          <Link
            to="/listings/new"
            className="px-4 py-2 rounded-xl bg-black text-white text-sm hover:opacity-90 transition"
          >
            + Create Listing
          </Link>

          {user ? (
            <button
              onClick={logout}
              className="text-sm text-gray-600 dark:text-gray-300"
            >
              Logout
            </button>
          ) : (
            <Link to="/login" className="text-sm">
              Login
            </Link>
          )}

          {/* Theme Toggle */}
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
}

{
  /* <ThemeToggle/> */
}
