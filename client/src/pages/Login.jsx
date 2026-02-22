import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

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
    } catch (err) {
      alert("Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <form
          onSubmit={handleSubmit}
          className="bg-white/95 backdrop-blur-md p-8 rounded-2xl shadow-2xl space-y-5"
        >
          <h2 className="text-3xl font-bold text-center text-gray-800">
            Welcome Back 👋
          </h2>
          <p className="text-center text-gray-500 text-sm">
            Login to continue to TravelUp
          </p>

          <input
            type="email"
            placeholder="Email address"
            required
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            required
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            disabled={loading}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-60"
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          <p className="text-center text-sm text-gray-600">
            Don’t have an account?{" "}
            <Link
              to="/register"
              className="text-indigo-600 font-semibold hover:underline"
            >
              Register
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}