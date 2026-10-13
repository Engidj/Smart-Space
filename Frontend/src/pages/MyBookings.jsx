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
      "Are you sure you want to cancel this booking?",
    );

    if (!confirmCancel) {
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/bookings/${bookingId}`,
        {
          method: "DELETE",
          credentials: "include",
        },
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
    <div className="min-h-screen bg-slate-50">
      <nav className="h-18 bg-white border-b border-slate-200 flex items-center justify-between px-8 md:px-16">
        <button
          onClick={() => navigate("/home")}
          className="text-2xl font-bold text-slate-900"
        >
          Smart Space
        </button>

        <div className="flex items-center gap-6">
          <button
            onClick={() => navigate("/home")}
            className="text-slate-700 hover:text-blue-600"
          >
            Home
          </button>

          <button
            onClick={() => navigate("/search")}
            className="text-slate-700 hover:text-blue-600"
          >
            Find Space
          </button>

          <button className="text-blue-600 font-semibold">My Bookings</button>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900">My Bookings</h1>

          <p className="text-slate-500 mt-2">
            View and manage your space bookings.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <div className="bg-white rounded-xl border border-slate-200 p-10 text-center">
            <p className="text-slate-500">Loading bookings...</p>
          </div>
        ) : bookings.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <h2 className="text-xl font-bold text-slate-900">
              No bookings yet
            </h2>

            <p className="text-slate-500 mt-2">
              Find an available space and make your first booking.
            </p>

            <button
              onClick={() => navigate("/search")}
              className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold"
            >
              Find a Space
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {bookings.map((booking) => (
              <div
                key={booking.booking_id}
                className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm"
              >
                <div className="flex justify-between items-start mb-5">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">
                      {booking.space_name}
                    </h2>

                    <p className="text-slate-500 mt-1">{booking.type}</p>
                  </div>

                  <span
                    className={`text-xs font-semibold px-3 py-1 rounded-full ${
                      booking.status === "confirmed"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {booking.status}
                  </span>
                </div>

                <div className="space-y-3 text-slate-600">
                  <p>
                    <span className="font-semibold text-slate-900">Date:</span>{" "}
                    {booking.date}
                  </p>

                  <p>
                    <span className="font-semibold text-slate-900">Time:</span>{" "}
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
                    className="w-full mt-6 border border-red-300 text-red-600 hover:bg-red-50 py-3 rounded-lg font-semibold"
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
