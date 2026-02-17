import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ThemeToggle from "../components/ThemeToggle";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/listings");
  };

  return (
    <nav className="sticky top-0 z-50 bg-white dark:bg-zinc-900 border-b dark:border-zinc-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link to="/listings" className="text-xl font-semibold tracking-tight">
          TravelUp
        </Link>

        {/* Right Section */}
        <div className="flex items-center gap-6 text-sm font-medium">
          {user && (
            <>
              <span className="text-gray-600 dark:text-gray-300">
                Hi, <span className="font-semibold">{user?.username}</span>
              </span>

              <Link
                to="/profile"
                className="hover:text-black dark:hover:text-white"
              >
                Profile
              </Link>

              <Link to="/bookings/my">My Bookings</Link>

              <Link to="/bookings/manage">Host Dashboard</Link>

              <Link
                to="/listings/new"
                className="bg-black text-white px-4 py-2 rounded-full"
              >
                + Create Listing
              </Link>

              <button onClick={handleLogout}>Logout</button>

              <ThemeToggle />
            </>
          )}

          {!user && (
            <>
              <Link to="/login">Login</Link>
              <Link
                to="/register"
                className="bg-black text-white px-4 py-2 rounded-full"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
