import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

function Home() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    fetch("http://localhost:5000/api/auth/profile", {
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) throw new Error("Could not load profile");
        return res.json();
      })
      .then((data) => setUser(data.user))
      .catch((err) => console.error(err));
  }, []);

  const logout = async () => {
    setLoggingOut(true);

    try {
      await fetch("http://localhost:5000/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Logout failed:", error);
      setLoggingOut(false);
    }
  };

  const firstName = user?.name?.trim()?.split(/\s+/)[0] || "User";

  const cardStyle =
    "group flex flex-col rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 sm:p-7";

  const iconStyle =
    "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition-colors duration-200 group-hover:bg-blue-600 group-hover:text-white";

  const renderArrow = () => (
    <svg
      className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5 12h14m-6-6 6 6-6 6"
      />
    </svg>
  );

  return (
    <div className="min-h-screen w-full bg-slate-100 text-slate-900">
      {/* Navbar */}
      <nav className="sticky top-0 z-20 flex min-h-[64px] w-full items-center justify-between border-b border-slate-800 bg-slate-900 px-5 py-3 text-white shadow-sm md:px-8">
        <Link
          to="/home"
          className="shrink-0 text-xl font-bold tracking-tight transition hover:text-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 sm:text-2xl"
        >
          Smart Space
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex max-w-40 items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 sm:max-w-56 sm:px-4">
            <svg
              className="h-4 w-4 shrink-0 text-blue-300"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              aria-hidden="true"
            >
              <circle cx="12" cy="8" r="4" />
              <path d="M4 21v-2a8 8 0 0 1 16 0v2" />
            </svg>

            <span className="truncate text-sm font-semibold text-slate-100">
              {user?.name || "User"}
            </span>
          </div>
          <Link
  to="/about"
  className="rounded-lg px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
>
  About
</Link>
          <button
            onClick={logout}
            disabled={loggingOut}
            className="rounded-lg bg-red-600 px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 disabled:cursor-not-allowed disabled:opacity-60 sm:px-4"
          >
            {loggingOut ? "Logging out..." : "Logout"}
          </button>
        </div>
      </nav>

      <main className="mx-auto w-full max-w-7xl px-5 py-7 sm:py-9 md:px-8 md:py-10">
        {/* Welcome Section */}
        <section className="relative overflow-hidden rounded-xl border border-blue-700 bg-gradient-to-r from-blue-700 to-blue-600 shadow-sm">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-12 -top-20 h-56 w-56 rounded-full border border-white/10"
          />

          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-24 right-28 h-48 w-48 rounded-full bg-white/5"
          />

          <div className="relative px-6 py-8 sm:px-9 sm:py-10 lg:px-11 lg:py-11">
            <div className="inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white">
              <span className="h-2 w-2 rounded-full bg-emerald-300" />
              Smart Space Platform
            </div>

            <h1 className="mt-5 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Welcome back, {firstName}!
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-blue-100 sm:text-base sm:leading-7">
              Find the right room or workspace for your needs. Check available
              spaces, make reservations, and manage your bookings in one place.
            </p>

            <button
              onClick={() => navigate("/search")}
              className="mt-6 inline-flex items-center gap-3 rounded-lg bg-white px-5 py-3 text-sm font-semibold text-blue-700 transition hover:bg-blue-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-white/40"
            >
              Find a Space
              {renderArrow()}
            </button>
          </div>
        </section>

        {/* Dashboard */}
        <section className="mt-9 sm:mt-10">
          <div className="mb-5">
        
            <h2 className="mt-1.5 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Your Dashboard
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-600 sm:text-base">
              Manage your spaces and reservations from one place.
            </p>
          </div>

          <div className="grid grid-cols-1 items-stretch gap-5 md:grid-cols-2 xl:grid-cols-3">
            {/* Search Spaces */}
            <Link to="/search" className={cardStyle}>
              <div className="flex items-center justify-between">
                <div className={iconStyle}>
                  <svg
                    className="h-6 w-6"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    aria-hidden="true"
                  >
                    <circle cx="11" cy="11" r="7" />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m16 16 4 4"
                    />
                  </svg>
                </div>

                <span className="rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
                  Explore
                </span>
              </div>

              <h3 className="mt-5 text-lg font-bold text-slate-900">
                Search Spaces
              </h3>

              <p className="mt-2 flex-1 text-sm leading-6 text-slate-600">
                Find rooms based on location, capacity, facilities, and your
                schedule requirements.
              </p>

              <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
                <span className="text-sm font-semibold text-blue-700">
                  Open space search
                </span>
                <span className="text-blue-600">{renderArrow()}</span>
              </div>
            </Link>

            {/* My Bookings */}
            <Link to="/bookings" className={cardStyle}>
              <div className="flex items-center justify-between">
                <div className={iconStyle}>
                  <svg
                    className="h-6 w-6"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    aria-hidden="true"
                  >
                    <rect x="3" y="4" width="18" height="17" rx="2" />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M16 2v4M8 2v4M3 10h18"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m9 15 2 2 4-4"
                    />
                  </svg>
                </div>

                <span className="rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
                  Manage
                </span>
              </div>

              <h3 className="mt-5 text-lg font-bold text-slate-900">
                My Bookings
              </h3>

              <p className="mt-2 flex-1 text-sm leading-6 text-slate-600">
                Review your reservations, check booking dates, and keep track
                of your booking details.
              </p>

              <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
                <span className="text-sm font-semibold text-blue-700">
                  View my bookings
                </span>
                <span className="text-blue-600">{renderArrow()}</span>
              </div>
            </Link>

            {/* Account Information */}
            <div className="flex flex-col rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition duration-200 hover:border-blue-200 hover:shadow-md sm:p-7">
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <svg
                    className="h-6 w-6"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    aria-hidden="true"
                  >
                    <circle cx="12" cy="8" r="4" />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4 21v-2a8 8 0 0 1 16 0v2"
                    />
                  </svg>
                </div>

                <span className="rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                  Signed in
                </span>
              </div>

              <h3 className="mt-5 text-lg font-bold text-slate-900">
                Account Information
              </h3>

              <p className="mt-2 flex-1 text-sm leading-6 text-slate-600">
                Your currently signed-in Smart Space account.
              </p>

              <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Signed in as
                </p>

                <div className="mt-3 flex min-w-0 items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
                    {user?.name?.trim()?.charAt(0)?.toUpperCase() || "U"}
                  </div>

                  <p className="min-w-0 break-words text-sm font-semibold text-slate-800">
                    {user?.name || "Loading profile..."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Home;