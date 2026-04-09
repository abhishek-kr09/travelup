import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/listings";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login({ email, password });

      navigate(from, { replace: true });

      // fire toast after navigation tick
      setTimeout(() => {
        toast.success("Welcome back! 🎉");
      }, 0);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <form
          onSubmit={handleSubmit}
          className="bg-stone-50 dark:bg-zinc-900 border border-stone-300 dark:border-zinc-800 backdrop-blur-md p-8 rounded-2xl shadow-[0_16px_36px_-24px_rgba(17,24,39,0.6)] space-y-5"
        >
          <h2 className="text-3xl font-bold text-center text-zinc-900 dark:text-zinc-100">
            Welcome Back 👋
          </h2>
          <p className="text-center text-zinc-600 dark:text-zinc-400 text-sm">
            Login to continue to TravelUp
          </p>

          <input
            type="email"
            placeholder="Email address"
            required
            className="w-full px-4 py-3 border border-stone-300 dark:border-zinc-700 bg-stone-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-300 transition"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            required
            className="w-full px-4 py-3 border border-stone-300 dark:border-zinc-700 bg-stone-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-300 transition"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            disabled={loading}
            className="w-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 py-3 rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-60"
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          <p className="text-center text-sm text-zinc-600 dark:text-zinc-400">
            Don’t have an account?{" "}
            <Link
              to="/register"
              className="text-zinc-900 dark:text-zinc-100 font-semibold hover:underline"
            >
              Register
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
