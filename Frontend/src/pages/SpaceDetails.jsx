
import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";

function SpaceDetails() {
  const location = useLocation();
  const navigate = useNavigate();

  const { space, booking } = location.state || {};

  const [purpose, setPurpose] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  if (!space || !booking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <div className="rounded-xl border bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-bold text-slate-900">
            Space not found
          </h1>
          <button
            onClick={() => navigate("/search")}
            className="mt-5 rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
          >
            Back to Search
          </button>
        </div>
      </div>
    );
  }

  const handleBooking = async () => {
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch("http://localhost:5000/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          space_id: space.space_id,
          date: booking.date,
          start_time: booking.start_time,
          end_time: booking.end_time,
          purpose: purpose || "General Booking",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Booking failed");
      }

      setMessage("Space booked successfully!");

      setTimeout(() => {
        navigate("/bookings");
      }, 1000);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-100 text-slate-900">
      {/* Navbar */}
      <nav className="flex w-full items-center justify-between bg-slate-900 px-5 py-3 text-white md:px-8">
        <button
          onClick={() => navigate("/home")}
          className="text-xl font-bold"
        >
          Smart Space
        </button>

        <div className="flex items-center gap-3 md:gap-6">
          <button
            onClick={() => navigate("/home")}
            className="hidden text-sm text-slate-200 hover:text-white sm:block"
          >
            Home
          </button>
          <button
            onClick={() => navigate("/search")}
            className="text-sm font-semibold text-blue-300"
          >
            Find Space
          </button>
          <button
            onClick={() => navigate("/bookings")}
            className="hidden text-sm text-slate-200 hover:text-white sm:block"
          >
            My Bookings
          </button>
        </div>
      </nav>

      <main className="w-full px-5 py-7 md:px-10">
        <button
          onClick={() => navigate("/search")}
          className="mb-5 font-semibold text-blue-600 hover:text-blue-800"
        >
          ← Back to Search
        </button>

        <div className="mb-7">
          <h1 className="text-3xl font-bold text-slate-900">
            Space Details
          </h1>
          <p className="mt-2 text-slate-600">
            Review the space and confirm your booking.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Space information */}
          <section className="rounded-xl border border-slate-200 border-t-4 border-t-blue-600 bg-white p-6 shadow-sm md:p-8">
            <span className="inline-block rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-700">
              Available
            </span>

            <h2 className="mt-4 text-2xl font-bold text-slate-900">
              {space.name}
            </h2>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Space Type</p>
                <p className="mt-1 font-semibold">{space.type}</p>
              </div>

              <div className="rounded-lg bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Capacity</p>
                <p className="mt-1 font-semibold">
                  {space.capacity} people
                </p>
              </div>

              <div className="rounded-lg bg-slate-50 p-4 sm:col-span-2">
                <p className="text-sm text-slate-500">Location</p>
                <p className="mt-1 font-semibold">{space.location}</p>
              </div>
            </div>
          </section>

          {/* Booking form */}
          <section className="rounded-xl border border-slate-200 border-t-4 border-t-purple-500 bg-white p-6 shadow-sm md:p-8">
            <h2 className="text-2xl font-bold text-slate-900">
              Booking Details
            </h2>

            <div className="mt-6 space-y-4">
              <div className="rounded-lg bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Booking Date</p>
                <p className="mt-1 font-semibold text-slate-900">
                  {booking.date}
                </p>
              </div>

              <div className="rounded-lg bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Time Slot</p>
                <p className="mt-1 font-semibold text-slate-900">
                  {booking.start_time} - {booking.end_time}
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Purpose of Booking
                </label>
                <input
                  type="text"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  placeholder="e.g. Group Discussion"
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              {message && (
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
                  {message}
                </div>
              )}

              <button
                onClick={handleBooking}
                disabled={loading}
                className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
              >
                {loading ? "Booking..." : "Confirm Booking"}
              </button>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default SpaceDetails;
