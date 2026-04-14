import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import ThemeToggle from "../components/ThemeToggle";
import API from "../api/axios";
import { getUserDisplayName, getUserInitial } from "../utils/userDisplay";

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [isHost, setIsHost] = useState(false);
  const accountMenuRef = useRef(null);

  const userInitial = getUserInitial(user);
  const userDisplayName = getUserDisplayName(user);
  const safeDisplayName = typeof userDisplayName === "string" && userDisplayName.trim() ? userDisplayName.trim() : "User";
  const userFirstName = typeof user?.firstName === "string" && user.firstName.trim()
    ? user.firstName.trim()
    : safeDisplayName;

  const handleLogout = async () => {
    await logout();
    setMenuOpen(false);
    setAccountMenuOpen(false);
    navigate("/listings");
  };

  const closeMenu = () => setMenuOpen(false);
  const closeAccountMenu = () => setAccountMenuOpen(false);

  useEffect(() => {
    let isMounted = true;

    const checkHostStatus = async () => {
      if (!user) {
        setIsHost(false);
        return;
      }

      try {
        const res = await API.get("/listings/my");
        const hostListings = Array.isArray(res?.data?.data) ? res.data.data : [];
        if (isMounted) {
          setIsHost(hostListings.length > 0);
        }
      } catch {
        if (isMounted) {
          setIsHost(false);
        }
      }
    };

    checkHostStatus();

    return () => {
      isMounted = false;
    };
  }, [user, location.pathname]);

  useEffect(() => {
    setMenuOpen(false);
    setAccountMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const onEscape = (event) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        setAccountMenuOpen(false);
      }
    };

    window.addEventListener("keydown", onEscape);
    return () => window.removeEventListener("keydown", onEscape);
  }, []);

  useEffect(() => {
    const onClickOutside = (event) => {
      if (
        accountMenuRef.current &&
        !accountMenuRef.current.contains(event.target)
      ) {
        setAccountMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  return (
    <nav className="sticky top-0 z-50 bg-stone-50/90 dark:bg-zinc-900/90 border-b border-stone-200 dark:border-zinc-800 backdrop-blur shadow-sm">
      <div className="max-w-[1500px] mx-auto px-4 sm:px-5 lg:px-6 py-3">
        {/* Logo */}
        <div className="flex items-center justify-between gap-3">
          <Link to="/" className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100" onClick={closeMenu}>
            TravelUp
          </Link>

          {/* Desktop Right Section */}
          <div className="hidden md:flex items-center gap-5 text-sm font-medium">
          <ThemeToggle />
            {user && (
              <>
                
                <Link
                  to={isHost ? "/bookings/manage" : "/listings/new"}
                  className="bg-zinc-900 text-white dark:bg-zinc-800 dark:text-white px-4 py-2 rounded-full"
                >
                  {isHost ? "Host Dashboard" : "Become a host"}
                </Link>

                {isHost && (
                  <Link
                    to="/listings/new"
                    className="bg-green-700 text-white dark:bg-green-600 dark:text-white px-4 py-2 rounded-full hover:opacity-90 transition"
                  >
                    Create Listing
                  </Link>
                )}

                <div className="relative" ref={accountMenuRef}>
                  <button
                    type="button"
                    onClick={() => setAccountMenuOpen((prev) => !prev)}
                    className="flex items-center gap-2 px-2 py-1 rounded-full bg-stone-200 dark:bg-zinc-800 border border-stone-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300"
                    aria-label="Account menu"
                    aria-expanded={accountMenuOpen}
                  >
                    <div className="w-7 h-7 rounded-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 flex items-center justify-center text-xs font-semibold">
                      {userInitial}
                    </div>
                    <span className="font-semibold max-w-24 truncate">{userFirstName}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className={`w-4 h-4 transition-transform ${accountMenuOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  <div
                    className={`absolute right-0 mt-2 w-52 rounded-xl border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-lg p-1.5 transition-all duration-150 ${accountMenuOpen ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 -translate-y-1 pointer-events-none"}`}
                  >
                    <Link
                      to="/profile"
                      onClick={closeAccountMenu}
                      className="block px-3 py-2 rounded-lg text-zinc-700 dark:text-zinc-300 hover:bg-stone-100 dark:hover:bg-zinc-800"
                    >
                      Profile
                    </Link>
                    <Link
                      to="/bookings/my"
                      onClick={closeAccountMenu}
                      className="block px-3 py-2 rounded-lg text-zinc-700 dark:text-zinc-300 hover:bg-stone-100 dark:hover:bg-zinc-800"
                    >
                      My Bookings
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-3 py-2 rounded-lg text-zinc-700 dark:text-zinc-300 hover:bg-stone-100 dark:hover:bg-zinc-800"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </>
            )}

            {!user && (
              <Link
                to="/login"
                className="px-4 py-2 rounded-full bg-zinc-900 dark:bg-zinc-800 text-white hover:opacity-90 transition"
              >
                Log in or sign up
              </Link>
            )}

            
          </div>

          {/* Mobile Controls */}
          <div className="md:hidden flex items-center gap-2">
            {user && <ThemeToggle />}
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
                <span className="text-zinc-700 dark:text-zinc-300 font-semibold">{userDisplayName}</span>
              </div>
            )}

            {user ? (
              <>
                <Link to="/profile" onClick={closeMenu} className="block px-2 py-2 rounded-lg text-zinc-700 dark:text-zinc-300 hover:bg-stone-200 dark:hover:bg-zinc-800">Profile</Link>
                <Link to="/bookings/my" onClick={closeMenu} className="block px-2 py-2 rounded-lg text-zinc-700 dark:text-zinc-300 hover:bg-stone-200 dark:hover:bg-zinc-800">My Bookings</Link>
                {isHost ? (
                  <>
                    <Link to="/bookings/manage" onClick={closeMenu} className="block px-2 py-2 rounded-lg text-zinc-700 dark:text-zinc-300 hover:bg-stone-200 dark:hover:bg-zinc-800">Host Dashboard</Link>
                    <Link to="/listings/new" onClick={closeMenu} className="block px-2 py-2 rounded-lg bg-green-600 text-white dark:bg-green-700 dark:text-white text-center font-medium hover:opacity-90 transition">Create Listing</Link>
                  </>
                ) : (
                  <Link to="/listings/new" onClick={closeMenu} className="block px-2 py-2 rounded-lg bg-zinc-900 text-white dark:bg-zinc-800 dark:text-white text-center font-medium">Become a host</Link>
                )}
                <button onClick={handleLogout} className="w-full text-left px-2 py-2 rounded-lg text-zinc-700 dark:text-zinc-300 hover:bg-stone-200 dark:hover:bg-zinc-800">Logout</button>
              </>
            ) : (
              <Link
                to="/login"
                onClick={closeMenu}
                className="block px-2 py-2 rounded-lg bg-zinc-900 dark:bg-zinc-800 text-white text-center font-medium"
              >
                Log in or sign up
              </Link>
            )}
        </div>
      </div>
    </nav>
  );
}
