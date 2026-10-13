
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function MyBookings() {
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadBookings = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("http://localhost:5000/api/bookings/my", {
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load bookings");
      }

      setBookings(data.bookings || []);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const cancelBooking = async (bookingId) => {
    const confirmCancel = window.confirm(
      "Are you sure you want to cancel this booking?"
    );

    if (!confirmCancel) return;

    try {
      const response = await fetch(
        `http://localhost:5000/api/bookings/${bookingId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to cancel booking");
      }

      loadBookings();
    } catch (error) {
      setError(error.message);
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
            className="text-sm text-slate-200 hover:text-white"
          >
            Find Space
          </button>

          <span className="text-sm font-semibold text-blue-300">
            My Bookings
          </span>
        </div>
      </nav>

      <main className="w-full px-5 py-7 md:px-10">
        <div className="mb-7">
          <h1 className="text-3xl font-bold text-slate-900">
            My Bookings
          </h1>
          <p className="mt-2 text-slate-600">
            View and manage your space bookings.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">
            <p className="text-slate-500">Loading bookings...</p>
          </div>
        ) : bookings.length === 0 ? (
          <div className="rounded-xl border border-slate-200 border-t-4 border-t-blue-600 bg-white p-10 text-center">
            <h2 className="text-xl font-bold text-slate-900">
              No bookings yet
            </h2>

            <p className="mt-2 text-slate-500">
              Find an available space and make your first booking.
            </p>

            <button
              onClick={() => navigate("/search")}
              className="mt-6 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
            >
              Find a Space
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {bookings.map((booking) => (
              <div
                key={booking.booking_id}
                className="rounded-xl border border-slate-200 border-t-4 border-t-blue-600 bg-white p-6 shadow-sm"
              >
                <div className="mb-5 flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">
                      {booking.space_name}
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      {booking.type}
                    </p>
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      booking.status === "confirmed"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {booking.status}
                  </span>
                </div>

                <div className="space-y-3 text-sm text-slate-600">
                  <p>
                    <span className="font-semibold text-slate-900">
                      Date:
                    </span>{" "}
                    {booking.date}
                  </p>

                  <p>
                    <span className="font-semibold text-slate-900">
                      Time:
                    </span>{" "}
                    {booking.start_time} - {booking.end_time}
                  </p>

                  <p>
                    <span className="font-semibold text-slate-900">
                      Location:
                    </span>{" "}
                    {booking.location}
                  </p>

                  <p>
                    <span className="font-semibold text-slate-900">
                      Purpose:
                    </span>{" "}
                    {booking.purpose || "General Booking"}
                  </p>
                </div>

                {booking.status === "confirmed" && (
                  <button
                    onClick={() => cancelBooking(booking.booking_id)}
                    className="mt-6 w-full rounded-lg border border-red-300 py-3 font-semibold text-red-600 hover:bg-red-50"
                  >
                    Cancel Booking
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default MyBookings;
