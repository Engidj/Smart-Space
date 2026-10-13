import { Link, useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  const logout = async () => {
  try {
    await fetch("http://localhost:5000/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });

    navigate("/login");
  } catch (error) {
    console.error(error);
  }
};

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="h-18 bg-white border-b border-slate-200 flex items-center justify-between px-8 md:px-16">
        <Link
          to="/home"
          className="text-2xl font-bold text-slate-900"
        >
          Smart Space
        </Link>

        <div className="flex items-center gap-6">
          <Link
            to="/home"
            className="text-slate-700 hover:text-blue-600"
          >
            Home
          </Link>

          <Link
            to="/search"
            className="text-slate-700 hover:text-blue-600"
          >
            Find Space
          </Link>

          <Link
            to="/bookings"
            className="text-slate-700 hover:text-blue-600"
          >
            My Bookings
          </Link>

          <button
            onClick={logout}
            className="bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-700"
          >
            Logout
          </button>
        </div>
      </nav>

      <section className="min-h-125 flex items-center px-8 md:px-16 bg-linear-to-br from-blue-50 to-white">
        <div className="max-w-3xl">
          <p className="text-sm font-bold tracking-widest text-blue-600 mb-5">
            SMART SPACE & RESOURCE AVAILABILITY
          </p>

          <h1 className="text-5xl md:text-6xl font-bold leading-tight text-slate-900">
            Find the right space for your needs.
          </h1>

          <p className="text-lg text-slate-500 leading-8 mt-6 max-w-2xl">
            Find available rooms, halls and other spaces based on your
            time, capacity, location and facilities.
          </p>

          <button
            onClick={() => navigate("/search")}
            className="mt-8 bg-blue-600 hover:bg-blue-700 text-white px-7 py-4 rounded-lg font-semibold"
          >
            Find Available Space
          </button>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 px-8 md:px-16 py-16">
        <div className="bg-white border border-slate-200 rounded-xl p-8">
          <h2 className="text-xl font-bold text-slate-900">
            Search by Requirements
          </h2>

          <p className="text-slate-500 mt-3 leading-7">
            Enter your date, time, capacity, location and required
            facilities.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-8">
          <h2 className="text-xl font-bold text-slate-900">
            Check Availability
          </h2>

          <p className="text-slate-500 mt-3 leading-7">
            The system checks schedules and existing bookings before
            showing spaces.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-8">
          <h2 className="text-xl font-bold text-slate-900">
            Book Your Space
          </h2>

          <p className="text-slate-500 mt-3 leading-7">
            Select a suitable space and create your booking directly
            through the platform.
          </p>
        </div>
      </section>
    </div>
  );
}

export default Home;