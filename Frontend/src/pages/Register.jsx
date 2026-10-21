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
  const [showPassword, setShowPassword] = useState(false);
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
    const name = form.name.trim();

    if (!name) {
      setError("Please enter your name.");
      return;
    }

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
            name,
            email,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      setForm((current) => ({ ...current, name, email }));
      setOtp("");
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
    <div className="min-h-screen bg-white lg:grid lg:grid-cols-2">
      {/* Left branding panel */}
      <div className="relative hidden min-h-screen overflow-hidden bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-800 p-12 text-white lg:flex lg:flex-col lg:justify-between xl:p-16">
        <div className="absolute -right-24 top-20 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-24 -left-20 h-80 w-80 rounded-full bg-indigo-400/20 blur-3xl" />

        <Link to="/" className="relative z-10 flex w-fit items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/20 bg-white/15 text-2xl font-bold shadow-lg">
            S
          </div>
          <div>
            <p className="text-lg font-bold tracking-tight">Smart Space</p>
            <p className="text-xs tracking-widest text-blue-100">
              SPACE MANAGEMENT PLATFORM
            </p>
          </div>
        </Link>

        <div className="relative z-10 max-w-xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm text-blue-50">
            <span className="h-2 w-2 rounded-full bg-emerald-300" />
            Your space, your way
          </div>

          <h1 className="text-5xl font-bold leading-tight tracking-tight xl:text-6xl">
            Get started.
            <br />
            Find your space.
          </h1>

          <p className="mt-6 max-w-md text-lg leading-8 text-blue-100">
            Create your account to discover available spaces, manage
            reservations, and make your space-booking experience simpler.
          </p>

          <div className="mt-10 space-y-5">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15">
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path d="M5 12.5 9.5 17 19 7.5" />
                  <circle cx="12" cy="12" r="9" />
                </svg>
              </div>
              <div>
                <p className="font-semibold">Simple space reservations</p>
                <p className="mt-1 text-sm text-blue-100">
                  Find and reserve spaces in a few steps.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15">
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <rect x="3" y="4" width="18" height="17" rx="2" />
                  <path d="M16 2v4M8 2v4M3 10h18" />
                </svg>
              </div>
              <div>
                <p className="font-semibold">Bookings in one place</p>
                <p className="mt-1 text-sm text-blue-100">
                  Keep track of your reservations with ease.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15">
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <rect x="3" y="10" width="18" height="11" rx="2" />
                  <path d="M7 10V7a5 5 0 0 1 10 0v3" />
                </svg>
              </div>
              <div>
                <p className="font-semibold">Email verification</p>
                <p className="mt-1 text-sm text-blue-100">
                  Verify your email to complete registration.
                </p>
              </div>
            </div>
          </div>
        </div>

        <p className="relative z-10 text-sm text-blue-100/80">
          Smart Space Platform · Simplifying space management
        </p>
      </div>

      {/* Registration and OTP section */}
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-5 py-10 sm:px-10 lg:bg-white xl:px-16">
        <div className="w-full max-w-md">
          {/* Mobile branding */}
          <Link
            to="/"
            className="mb-8 flex items-center justify-center gap-3 lg:hidden"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-xl font-bold text-white shadow-lg shadow-blue-600/20">
              S
            </div>
            <div>
              <p className="text-lg font-bold text-slate-900">Smart Space</p>
              <p className="text-xs tracking-widest text-slate-500">
                SPACE MANAGEMENT
              </p>
            </div>
          </Link>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/40 sm:p-9 lg:rounded-none lg:border-0 lg:p-0 lg:shadow-none">
            <div className="mb-8">
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                {otpSent ? (
                  <svg
                    className="h-7 w-7"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  >
                    <rect x="3" y="5" width="18" height="14" rx="2" />
                    <path d="m3 7 9 6 9-6" />
                    <path d="m9 15 2 2 4-4" />
                  </svg>
                ) : (
                  <svg
                    className="h-7 w-7"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  >
                    <circle cx="9" cy="8" r="4" />
                    <path d="M3 21v-2a6 6 0 0 1 12 0v2" />
                    <path d="M19 8v6m-3-3h6" />
                  </svg>
                )}
              </div>

              <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-blue-600">
                {otpSent ? "One last step" : "Create your account"}
              </p>

              <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                {otpSent ? "Verify your email" : "Join Smart Space"}
              </h2>

              <p className="mt-3 text-sm leading-6 text-slate-500">
                {otpSent
                  ? `Enter the 6-digit verification code sent to ${form.email}.`
                  : "Fill in your details to get started with smarter space management."}
              </p>
            </div>

            {/* Registration form */}
            {!otpSent ? (
              <form onSubmit={handleRegister} className="space-y-5">
                <div>
                  <label
                    htmlFor="name"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Full name
                  </label>

                  <div className="relative">
                    <svg
                      className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    >
                      <circle cx="12" cy="8" r="4" />
                      <path d="M4 21v-2a8 8 0 0 1 16 0v2" />
                    </svg>

                    <input
                      id="name"
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      maxLength={100}
                      autoComplete="name"
                      placeholder="Enter your full name"
                      className="w-full rounded-xl border border-slate-300 bg-white py-3.5 pl-12 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Email address
                  </label>

                  <div className="relative">
                    <svg
                      className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    >
                      <rect x="3" y="5" width="18" height="14" rx="2" />
                      <path d="m3 7 9 6 9-6" />
                    </svg>

                    <input
                      id="email"
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      autoComplete="email"
                      placeholder="you@example.com"
                      className="w-full rounded-xl border border-slate-300 bg-white py-3.5 pl-12 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Password
                  </label>

                  <div className="relative">
                    <svg
                      className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    >
                      <rect x="3" y="10" width="18" height="11" rx="2" />
                      <path d="M7 10V7a5 5 0 0 1 10 0v3" />
                    </svg>

                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                      minLength={8}
                      autoComplete="new-password"
                      placeholder="Create a strong password"
                      className="w-full rounded-xl border border-slate-300 bg-white py-3.5 pl-12 pr-14 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                      required
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                    >
                      {showPassword ? (
                        <svg
                          className="h-5 w-5"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                        >
                          <path d="M3 3l18 18" />
                          <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
                          <path d="M9.9 5.2A11 11 0 0 1 12 5c5.5 0 9 7 9 7a16 16 0 0 1-3.1 3.9M6.2 6.2C3.8 7.8 3 12 3 12s3.5 7 9 7c1.2 0 2.3-.3 3.3-.7" />
                        </svg>
                      ) : (
                        <svg
                          className="h-5 w-5"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                        >
                          <path d="M2.5 12s3.5-7 9.5-7 9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7Z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      )}
                    </button>
                  </div>

                  <p className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                    <svg
                      className="h-4 w-4 shrink-0"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    >
                      <circle cx="12" cy="12" r="9" />
                      <path d="M12 11v5m0-8h.01" />
                    </svg>
                    At least 8 characters, with uppercase, lowercase and a number.
                  </p>
                </div>

                {error && (
                  <div
                    role="alert"
                    className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
                  >
                    <span className="font-bold">!</span>
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3.5 font-semibold text-white shadow-lg shadow-blue-600/20 transition duration-200 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-600/25 focus:outline-none focus:ring-4 focus:ring-blue-500/25 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                >
                  {loading ? (
                    <>
                      <svg
                        className="h-5 w-5 animate-spin"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-90"
                          fill="currentColor"
                          d="M4 12a8 8 0 0 1 8-8V0C5.4 0 0 5.4 0 12h4z"
                        />
                      </svg>
                      Sending verification code...
                    </>
                  ) : (
                    <>
                      Create account
                      <svg
                        className="h-5 w-5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                      >
                        <path d="M5 12h14m-6-6 6 6-6 6" />
                      </svg>
                    </>
                  )}
                </button>
              </form>
            ) : (
              /* Email OTP verification form */
              <form onSubmit={handleVerify} className="space-y-5">
                <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
                  <p className="text-sm font-medium text-blue-900">
                    Verification code sent
                  </p>
                  <p className="mt-1 break-all text-sm text-blue-700">
                    {form.email}
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="otp"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Six-digit verification code
                  </label>

                  <input
                    id="otp"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    value={otp}
                    onChange={(e) =>
                      setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                    }
                    placeholder="000000"
                    maxLength={6}
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-4 text-center text-2xl font-bold tracking-[0.5em] text-slate-900 outline-none transition placeholder:text-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                    required
                  />

                  <p className="mt-2 text-xs text-slate-500">
                    Check your inbox and enter the code to verify your email.
                  </p>
                </div>

                {message && (
                  <div
                    role="status"
                    className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700"
                  >
                    <span className="font-bold">✓</span>
                    <span>{message}</span>
                  </div>
                )}

                {error && (
                  <div
                    role="alert"
                    className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
                  >
                    <span className="font-bold">!</span>
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || otp.length !== 6}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3.5 font-semibold text-white shadow-lg shadow-blue-600/20 transition duration-200 hover:-translate-y-0.5 hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500/25 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                >
                  {loading ? (
                    <>
                      <svg
                        className="h-5 w-5 animate-spin"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-90"
                          fill="currentColor"
                          d="M4 12a8 8 0 0 1 8-8V0C5.4 0 0 5.4 0 12h4z"
                        />
                      </svg>
                      Verifying email...
                    </>
                  ) : (
                    <>
                      Verify email
                      <svg
                        className="h-5 w-5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                      >
                        <path d="m5 12 4 4L19 6" />
                      </svg>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  disabled={loading}
                  onClick={() => {
                    setOtpSent(false);
                    setOtp("");
                    setError("");
                    setMessage("");
                  }}
                  className="w-full rounded-xl py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-blue-700 disabled:opacity-50"
                >
                  ← Back to registration
                </button>
              </form>
            )}

            {!otpSent && (
              <>
                <div className="my-7 flex items-center gap-4">
                  <div className="h-px flex-1 bg-slate-200" />
                  <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
                    Already registered?
                  </span>
                  <div className="h-px flex-1 bg-slate-200" />
                </div>

                <Link
                  to="/login"
                  className="flex w-full items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-3.5 text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500/10"
                >
                  Sign in to your account
                </Link>
              </>
            )}
          </div>

          <p className="mt-6 text-center text-xs text-slate-400 lg:hidden">
            © Smart Space Platform
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;