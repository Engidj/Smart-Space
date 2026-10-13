
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

function Home() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

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
    try {
      await fetch("http://localhost:5000/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-100 text-slate-900">
      {/* Navbar */}
      <nav className="flex w-full items-center justify-between bg-slate-900 px-5 py-3 text-white md:px-8">
        <Link to="/home" className="text-xl font-bold">
          Smart Space
        </Link>

        <div className="flex items-center gap-3">
          <span className="max-w-40 truncate rounded-lg bg-slate-700 px-4 py-2 text-sm font-semibold">
            {user?.name || "User"}
          </span>

          <button
            onClick={logout}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </nav>

      <main className="w-full px-5 py-7 md:px-10">
        {/* Welcome section */}
        <section className="rounded-xl bg-blue-600 px-6 py-8 text-white md:px-9">
          <p className="text-sm font-semibold tracking-wide text-blue-100">
            SMART SPACE PLATFORM
          </p>

          <h1 className="mt-3 text-3xl font-bold md:text-4xl">
            Welcome back, {user?.name?.trim()?.split(" ")[0] || "User"}!
          </h1>

          <p className="mt-3 max-w-2xl leading-7 text-blue-100">
            Find available rooms, halls and workspaces based on your
            requirements. Check availability and book a suitable space.
          </p>

          <button
            onClick={() => navigate("/search")}
            className="mt-5 rounded-lg bg-white px-5 py-3 font-semibold text-blue-700 hover:bg-blue-50"
          >
            Find Available Space
          </button>
        </section>

        {/* Quick actions */}
        <section className="mt-8">
          <h2 className="mb-5 text-2xl font-bold text-slate-800">
            Explore Smart Space
          </h2>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            <Link
              to="/search"
              className="rounded-xl border border-slate-200 border-t-4 border-t-blue-500 bg-white p-6 shadow-sm transition hover:shadow-md"
            >
              <h3 className="text-lg font-bold text-slate-800">
                Find a Space
              </h3>
              <p className="mt-2 leading-6 text-slate-600">
                Search rooms by location, capacity, facilities and schedule.
              </p>
              <p className="mt-4 font-semibold text-blue-600">
                Explore spaces →
              </p>
            </Link>

            <Link
              to="/bookings"
              className="rounded-xl border border-slate-200 border-t-4 border-t-purple-500 bg-white p-6 shadow-sm transition hover:shadow-md"
            >
              <h3 className="text-lg font-bold text-slate-800">
                My Bookings
              </h3>
              <p className="mt-2 leading-6 text-slate-600">
                View your reservations and check your booking details.
              </p>
              <p className="mt-4 font-semibold text-purple-600">
                View bookings →
              </p>
            </Link>

            <div className="rounded-xl border border-slate-200 border-t-4 border-t-emerald-500 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-bold text-slate-800">
                Check Availability
              </h3>
              <p className="mt-2 leading-6 text-slate-600">
                Check schedules and existing bookings before selecting a space.
              </p>
              <p className="mt-4 font-semibold text-emerald-600">
                Smart availability
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Home;
