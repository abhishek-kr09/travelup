import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import { getUserDisplayName } from "../utils/userDisplay";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const userDisplayName = getUserDisplayName(user);

  return (
    <div className="max-w-4xl mx-auto py-4 sm:py-8 space-y-6">
      <div className="surface-card p-6 sm:p-8">
        <p className="text-sm text-zinc-600 dark:text-zinc-400">Welcome back</p>
        <h2 className="text-2xl sm:text-3xl font-semibold mt-1">{userDisplayName}</h2>
        <p className="text-zinc-600 dark:text-zinc-400 mt-2">Manage your listings, bookings, and profile from one place.</p>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Link to="/listings/new" className="text-center bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 py-2.5 rounded-lg font-medium">Become a host</Link>
          <Link to="/bookings/my" className="text-center border border-zinc-300 dark:border-zinc-700 py-2.5 rounded-lg font-medium">My Bookings</Link>
          <Link to="/profile" className="text-center border border-zinc-300 dark:border-zinc-700 py-2.5 rounded-lg font-medium">Profile</Link>
        </div>

        <button
          onClick={logout}
          className="mt-4 w-full sm:w-auto bg-red-600 text-white px-4 py-2 rounded-lg hover:opacity-90 transition"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
