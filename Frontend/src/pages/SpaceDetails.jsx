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
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900">
            Space not found
          </h1>

          <button
            onClick={() => navigate("/search")}
            className="mt-5 bg-blue-600 text-white px-5 py-3 rounded-lg"
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

          <button
            onClick={() => navigate("/bookings")}
            className="text-slate-700 hover:text-blue-600"
          >
            My Bookings
          </button>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-12">
        <button
          onClick={() => navigate("/search")}
          className="text-blue-600 font-semibold mb-6"
        >
          ← Back to Search
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
            <span className="inline-block bg-green-100 text-green-700 text-sm font-semibold px-3 py-1 rounded-full mb-5">
              Available
            </span>

            <h1 className="text-3xl font-bold text-slate-900">
              {space.name}
            </h1>

            <div className="mt-7 space-y-4 text-slate-600">
              <p>
                <span className="font-semibold text-slate-900">
                  Type:
                </span>{" "}
                {space.type}
              </p>

              <p>
                <span className="font-semibold text-slate-900">
                  Capacity:
                </span>{" "}
                {space.capacity} people
              </p>

              <p>
                <span className="font-semibold text-slate-900">
                  Location:
                </span>{" "}
                {space.location}
              </p>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-900">
              Booking Details
            </h2>

            <div className="mt-6 space-y-4">
              <div className="bg-slate-50 rounded-lg p-4">
                <p className="text-sm text-slate-500">Date</p>
                <p className="font-semibold text-slate-900">
                  {booking.date}
                </p>
              </div>

              <div className="bg-slate-50 rounded-lg p-4">
                <p className="text-sm text-slate-500">Time</p>
                <p className="font-semibold text-slate-900">
                  {booking.start_time} - {booking.end_time}
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Purpose
                </label>

                <input
                  type="text"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  placeholder="e.g. Group Discussion"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg">
                  {error}
                </div>
              )}

              {message && (
                <div className="bg-green-50 text-green-600 p-3 rounded-lg">
                  {message}
                </div>
              )}

              <button
                onClick={handleBooking}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold disabled:opacity-60"
              >
                {loading ? "Booking..." : "Confirm Booking"}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default SpaceDetails;