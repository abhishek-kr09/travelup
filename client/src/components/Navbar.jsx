import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import ThemeToggle from "../components/ThemeToggle";

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const userInitial = user?.username?.charAt(0)?.toUpperCase() || "U";

  const handleLogout = async () => {
    await logout();
    setMenuOpen(false);
    navigate("/listings");
  };

  const closeMenu = () => setMenuOpen(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const onEscape = (event) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    };

    window.addEventListener("keydown", onEscape);
    return () => window.removeEventListener("keydown", onEscape);
  }, []);

  return (
    <nav className="sticky top-0 z-50 bg-stone-50/90 dark:bg-zinc-900/90 border-b border-stone-200 dark:border-zinc-800 backdrop-blur shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        {/* Logo */}
        <div className="flex items-center justify-between gap-3">
          <Link to="/listings" className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100" onClick={closeMenu}>
            TravelUp
          </Link>

          {/* Desktop Right Section */}
          <div className="hidden md:flex items-center gap-5 text-sm font-medium">
            {user && (
              <>
                <div className="flex items-center gap-2 px-2 py-1 rounded-full bg-stone-200 dark:bg-zinc-800">
                  <div className="w-7 h-7 rounded-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 flex items-center justify-center text-xs font-semibold">
                    {userInitial}
                  </div>
                  <span className="text-zinc-700 dark:text-zinc-300 font-semibold">{user?.username}</span>
                </div>

                <Link
                  to="/profile"
                  className="hover:text-black dark:hover:text-white text-zinc-700 dark:text-zinc-300"
                >
                  Profile
                </Link>

                <Link to="/bookings/my" className="text-zinc-700 dark:text-zinc-300">My Bookings</Link>

                <Link to="/bookings/manage" className="text-zinc-700 dark:text-zinc-300">Host Dashboard</Link>

                <Link
                  to="/listings/new"
                  className="bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 px-4 py-2 rounded-full"
                >
                  + Create Listing
                </Link>

                <button onClick={handleLogout} className="text-zinc-700 dark:text-zinc-300">Logout</button>
              </>
            )}

            {!user && (
              <>
                <Link to="/login" className="text-zinc-700 dark:text-zinc-300">Login</Link>
                <Link
                  to="/register"
                  className="bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 px-4 py-2 rounded-full"
                >
                  Register
                </Link>
              </>
            )}

            <ThemeToggle />
          </div>

          {/* Mobile Controls */}
          <div className="md:hidden flex items-center gap-2">
            <ThemeToggle />
            <button
              type="button"
              onClick={() => setMenuOpen((prev) => !prev)}
              className="p-2 rounded-lg border border-stone-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200"
              aria-label="Toggle navigation menu"
              aria-expanded={menuOpen}
            >
              {menuOpen ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={`md:hidden mt-3 pt-3 border-t border-stone-200 dark:border-zinc-800 space-y-2 overflow-hidden transition-all duration-300 ease-out ${
            menuOpen ? "max-h-[26rem] opacity-100" : "max-h-0 opacity-0 pt-0 mt-0 border-t-0"
          }`}
          aria-hidden={!menuOpen}
        >
            {user && (
              <div className="flex items-center gap-2 px-2 py-2 rounded-lg bg-stone-200 dark:bg-zinc-800">
                <div className="w-8 h-8 rounded-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 flex items-center justify-center text-xs font-semibold">
                  {userInitial}
                </div>
                <span className="text-zinc-700 dark:text-zinc-300 font-semibold">{user?.username}</span>
              </div>
            )}

            {user ? (
              <>
                <Link to="/profile" onClick={closeMenu} className="block px-2 py-2 rounded-lg text-zinc-700 dark:text-zinc-300 hover:bg-stone-200 dark:hover:bg-zinc-800">Profile</Link>
                <Link to="/bookings/my" onClick={closeMenu} className="block px-2 py-2 rounded-lg text-zinc-700 dark:text-zinc-300 hover:bg-stone-200 dark:hover:bg-zinc-800">My Bookings</Link>
                <Link to="/bookings/manage" onClick={closeMenu} className="block px-2 py-2 rounded-lg text-zinc-700 dark:text-zinc-300 hover:bg-stone-200 dark:hover:bg-zinc-800">Host Dashboard</Link>
                <Link to="/listings/new" onClick={closeMenu} className="block px-2 py-2 rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 text-center font-medium">+ Create Listing</Link>
                <button onClick={handleLogout} className="w-full text-left px-2 py-2 rounded-lg text-zinc-700 dark:text-zinc-300 hover:bg-stone-200 dark:hover:bg-zinc-800">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={closeMenu} className="block px-2 py-2 rounded-lg text-zinc-700 dark:text-zinc-300 hover:bg-stone-200 dark:hover:bg-zinc-800">Login</Link>
                <Link to="/register" onClick={closeMenu} className="block px-2 py-2 rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 text-center font-medium">Register</Link>
              </>
            )}
        </div>
      </div>
    </nav>
  );
}
