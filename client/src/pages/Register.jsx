import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import API from "../api/axios";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/listings";

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    otp: ""
  });

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);

  const handleChange = (e) => {
    if (e.target.name === "email") {
      setOtpSent(false);
      setOtpVerified(false);
      setForm((prev) => ({
        ...prev,
        email: e.target.value,
        otp: ""
      }));
      return;
    }

    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSendOtp = async () => {
    setError(null);
    setOtpVerified(false);

    if (!form.email.trim()) {
      setError("Please enter your email first");
      return;
    }

    setSendingOtp(true);
    try {
      await API.post("/auth/send-otp", { email: form.email });
      setOtpSent(true);
      toast.success("OTP sent to your email");
    } catch (err) {
      setOtpSent(false);
      setError(err?.response?.data?.message || "Failed to send OTP");
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    setError(null);

    if (!form.otp.trim()) {
      setError("Please enter OTP");
      return;
    }

    setVerifyingOtp(true);
    try {
      await API.post("/auth/verify-otp", {
        email: form.email,
        otp: form.otp,
      });
      setOtpVerified(true);
      toast.success("OTP verified");
    } catch (err) {
      setOtpVerified(false);
      setError(err?.response?.data?.message || "OTP verification failed");
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!otpVerified) {
      setError("Please verify OTP first");
      return;
    }

    setLoading(true);

    try {
      await register(form);
      navigate(from, { replace: true });

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
            type="email"
            name="email"
            placeholder="Email address"
            required
            value={form.email}
            onChange={handleChange}
            disabled={otpVerified}
            className="w-full px-4 py-3 border border-stone-300 dark:border-zinc-700 bg-stone-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-300 transition"
          />

          {!otpVerified && (
            <>
              {!otpSent && (
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={sendingOtp}
                  className="w-full border border-stone-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 py-2.5 rounded-lg font-medium hover:bg-stone-100 dark:hover:bg-zinc-700 transition disabled:opacity-60"
                >
                  {sendingOtp ? "Sending OTP..." : "Send OTP"}
                </button>
              )}

              {otpSent && (
                <>
                  <input
                    type="text"
                    name="otp"
                    placeholder="Enter 6-digit OTP"
                    required
                    value={form.otp}
                    onChange={handleChange}
                    maxLength={6}
                    className="w-full px-4 py-3 border border-stone-300 dark:border-zinc-700 bg-stone-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-300 transition"
                  />

                  <div className="flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={handleVerifyOtp}
                      disabled={verifyingOtp}
                      className="flex-1 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 py-2.5 rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-60"
                    >
                      {verifyingOtp ? "Verifying..." : "Proceed"}
                    </button>

                    <button
                      type="button"
                      onClick={handleSendOtp}
                      disabled={sendingOtp}
                      className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 underline"
                    >
                      Resend OTP
                    </button>
                  </div>
                </>
              )}
            </>
          )}

          {otpVerified && (
            <>
              <div className="text-xs text-center text-green-600 dark:text-green-400 font-medium">
                OTP verified. Continue with your profile details.
              </div>

              <input
                type="text"
                name="firstName"
                placeholder="First name"
                required
                value={form.firstName}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-stone-300 dark:border-zinc-700 bg-stone-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-300 transition"
              />

              <input
                type="text"
                name="lastName"
                placeholder="Last name"
                required
                value={form.lastName}
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
            </>
          )}

          {otpVerified && (
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 py-3 rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-60"
            >
              {loading ? "Creating..." : "Register"}
            </button>
          )}

          <p className="text-center text-sm text-zinc-600 dark:text-zinc-400">
            Already have an account?{" "}
            <Link
              to="/login"
              state={location.state?.from ? { from: location.state.from } : undefined}
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