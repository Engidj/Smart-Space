
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    const email = form.email.trim().toLowerCase();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (
      form.password.length < 8 ||
      !/[a-z]/.test(form.password) ||
      !/[A-Z]/.test(form.password) ||
      !/\d/.test(form.password)
    ) {
      setError(
        "Password needs at least 8 characters, uppercase, lowercase and a number."
      );
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/register",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...form,
            name: form.name.trim(),
            email,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      setForm((current) => ({ ...current, email }));
      setOtpSent(true);
      setMessage(data.message || "OTP sent. Check your email.");
    } catch (err) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!/^\d{6}$/.test(otp)) {
      setError("Enter the 6-digit OTP.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/verify-email",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: form.email.trim().toLowerCase(),
            otp,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Verification failed");
      }

      navigate("/login", {
        replace: true,
        state: { message: "Email verified! You can now log in." },
      });
    } catch (err) {
      setError(err.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-5 py-8">
      <div className="w-full max-w-md rounded-xl border border-slate-200  bg-white p-7 shadow-sm sm:p-9">
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-xl font-bold text-white">
            S
          </div>

          <h1 className="mt-4 text-3xl font-bold text-slate-900">
            {otpSent ? "Verify Your Email" : "Create Account"}
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            {otpSent
              ? `Enter the 6-digit code sent to ${form.email}`
              : "Join Smart Space Platform"}
          </p>
        </div>

        {!otpSent ? (
          <form onSubmit={handleRegister} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Name
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                maxLength={100}
                autoComplete="name"
                placeholder="Enter your name"
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
                placeholder="Enter your email"
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                minLength={8}
                autoComplete="new-password"
                placeholder="At least 8 characters"
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                required
              />
              <p className="mt-2 text-xs text-slate-500">
                Include uppercase, lowercase and a number.
              </p>
            </div>

            {error && (
              <p
                role="alert"
                className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Sending OTP..." : "Create Account"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerify} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Email OTP
              </label>
              <input
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                value={otp}
                onChange={(e) =>
                  setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                placeholder="Enter 6-digit OTP"
                maxLength={6}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-center tracking-[0.4em] outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                required
              />
            </div>

            {message && (
              <p
                role="status"
                className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700"
              >
                {message}
              </p>
            )}

            {error && (
              <p
                role="alert"
                className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Verifying..." : "Verify Email"}
            </button>

            <button
              type="button"
              onClick={() => {
                setOtpSent(false);
                setOtp("");
                setError("");
                setMessage("");
              }}
              className="w-full py-2 text-sm font-medium text-slate-600 hover:text-slate-900"
            >
              Back to registration
            </button>
          </form>
        )}

        {!otpSent && (
          <p className="mt-6 text-center text-sm text-slate-600">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-semibold text-blue-600 hover:underline"
            >
              Login
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}

export default Register;
