import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: ""
  });

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await register(form);
      navigate("/dashboard");

      setTimeout(() => {
        toast.success("Welcome ! 🎉");
      }, 0);
    } catch (err) {
      setError(err?.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <form className="bg-stone-50 dark:bg-zinc-900 border border-stone-300 dark:border-zinc-800 backdrop-blur-md p-8 rounded-2xl shadow-[0_16px_36px_-24px_rgba(17,24,39,0.6)] space-y-5" onSubmit={handleSubmit}>
          <h2 className="text-3xl font-bold text-center text-zinc-900 dark:text-zinc-100">
            Create Account 🚀
          </h2>

          {error && (
            <p className="text-red-500 text-sm text-center">{error}</p>
          )}

          <input
            type="text"
            name="username"
            placeholder="Username"
            required
            value={form.username}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-stone-300 dark:border-zinc-700 bg-stone-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-300 transition"
          />

          <input
            type="email"
            name="email"
            placeholder="Email address"
            required
            value={form.email}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-stone-300 dark:border-zinc-700 bg-stone-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-300 transition"
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            required
            value={form.password}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-stone-300 dark:border-zinc-700 bg-stone-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-300 transition"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 py-3 rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-60"
          >
            {loading ? "Creating..." : "Register"}
          </button>

          <p className="text-center text-sm text-zinc-600 dark:text-zinc-400">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-zinc-900 dark:text-zinc-100 font-semibold hover:underline"
            >
              Login
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}