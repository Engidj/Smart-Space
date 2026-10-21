import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      const role = String(data.user?.role || data.role || "")
        .trim()
        .toLowerCase();

      if (role === "admin") {
        navigate("/admin", { replace: true });
      } else if (role === "manager") {
        navigate("/manager", { replace: true });
      } else if (role === "user") {
        navigate("/home", { replace: true });
      } else {
        throw new Error("User role was not found. Please contact support.");
      }
    } catch (error) {
      setError(error.message || "Something went wrong");
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
            <p className="text-lg font-bold tracking-tight">
              Smart Space
            </p>
            <p className="text-xs tracking-widest text-blue-100">
              SPACE MANAGEMENT PLATFORM
            </p>
          </div>
        </Link>

        <div className="relative z-10 max-w-xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm text-blue-50">
            <span className="h-2 w-2 rounded-full bg-emerald-300" />
            A smarter way to manage spaces
          </div>

          <h1 className="text-5xl font-bold leading-tight tracking-tight xl:text-6xl">
            Find your space.
            <br />
            Make it count.
          </h1>

          <p className="mt-6 max-w-md text-lg leading-8 text-blue-100">
            Discover available spaces, simplify reservations, and manage
            every booking from one convenient platform.
          </p>

          <div className="mt-10 grid grid-cols-2 gap-4">
            <div className="rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur-sm">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <rect x="3" y="4" width="18" height="17" rx="2" />
                  <path d="M16 2v4M8 2v4M3 10h18" />
                  <path d="m9 15 2 2 4-4" />
                </svg>
              </div>
              <p className="font-semibold">Easy booking</p>
              <p className="mt-1 text-sm text-blue-100">
                Reserve spaces with ease.
              </p>
            </div>

            <div className="rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur-sm">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path d="M3 21h18M5 21V7l7-4 7 4v14" />
                  <path d="M9 21v-6h6v6M9 10h.01M15 10h.01" />
                </svg>
              </div>
              <p className="font-semibold">Smart management</p>
              <p className="mt-1 text-sm text-blue-100">
                Keep your spaces organized.
              </p>
            </div>
          </div>
        </div>

        <p className="relative z-10 text-sm text-blue-100/80">
          Smart Space Platform · Simplifying space management
        </p>
      </div>

      {/* Right login section */}
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-5 py-10 sm:px-10 lg:bg-white xl:px-16">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <Link
            to="/"
            className="mb-10 flex items-center justify-center gap-3 lg:hidden"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-xl font-bold text-white shadow-lg shadow-blue-600/20">
              S
            </div>
            <div>
              <p className="text-lg font-bold text-slate-900">
                Smart Space
              </p>
              <p className="text-xs tracking-widest text-slate-500">
                SPACE MANAGEMENT
              </p>
            </div>
          </Link>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/40 sm:p-9 lg:rounded-none lg:border-0 lg:p-0 lg:shadow-none">
            <div className="mb-8">
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <svg
                  className="h-7 w-7"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path d="M12 15v2m-7 4h14a2 2 0 0 0 2-2v-9a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2Z" />
                  <path d="M8 8V6a4 4 0 1 1 8 0v2" />
                </svg>
              </div>

              <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-blue-600">
                Welcome back
              </p>

              <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                Sign in to your account
              </h2>

              <p className="mt-3 text-sm leading-6 text-slate-500">
                Enter your credentials to access your Smart Space dashboard.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
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
                    placeholder="you@example.com"
                    autoComplete="email"
                    className="w-full rounded-xl border border-slate-300 bg-white py-3.5 pl-12 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between gap-3">
                  <label
                    htmlFor="password"
                    className="block text-sm font-semibold text-slate-700"
                  >
                    Password
                  </label>
                </div>

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
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    className="w-full rounded-xl border border-slate-300 bg-white py-3.5 pl-12 pr-14 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                    required
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
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
              </div>

              {error && (
                <div
                  role="alert"
                  className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
                >
                  <svg
                    className="mt-0.5 h-5 w-5 shrink-0"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  >
                    <circle cx="12" cy="12" r="9" />
                    <path d="M12 8v5m0 3h.01" />
                  </svg>
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
                    Signing you in...
                  </>
                ) : (
                  <>
                    Sign in
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

            <div className="my-7 flex items-center gap-4">
              <div className="h-px flex-1 bg-slate-200" />
              <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
                New to Smart Space?
              </span>
              <div className="h-px flex-1 bg-slate-200" />
            </div>

            <Link
              to="/register"
              className="flex w-full items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-3.5 text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500/10"
            >
              Create an account
            </Link>

            <p className="mt-8 text-center text-xs leading-5 text-slate-400">
              By signing in, you agree to use Smart Space responsibly.
            </p>
          </div>

          <p className="mt-6 text-center text-xs text-slate-400 lg:hidden">
            © Smart Space Platform
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;