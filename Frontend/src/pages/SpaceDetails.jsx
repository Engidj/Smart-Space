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
      <div className="flex min-h-screen items-center justify-center bg-slate-100 px-5">
        <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
            <svg
              className="h-7 w-7"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="9" />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 8v5m0 3h.01"
              />
            </svg>
          </div>

          <h1 className="mt-5 text-2xl font-bold text-slate-900">
            Space not found
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            The space details are unavailable. Please search for a space again.
          </p>

          <button
            onClick={() => navigate("/search")}
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2"
          >
            Back to Search
            <span aria-hidden="true">→</span>
          </button>
        </div>
      </div>
    );
  }

  const handleBooking = async () => {
    if (loading) return;

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
      setError(error.message || "Booking failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const navLink =
    "rounded-lg px-3 py-2 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400";

  const detailBox =
    "rounded-lg border border-slate-200 bg-slate-50 p-4";

  const inputClass =
    "w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 hover:border-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100";

  const primaryButton =
    "inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60";

  return (
    <div className="min-h-screen w-full bg-slate-100 text-slate-900">
      <nav className="sticky top-0 z-20 flex w-full items-center justify-between border-b border-slate-800 bg-slate-900 px-5 py-3 text-white shadow-sm md:px-8">
        <button
          onClick={() => navigate("/home")}
          className="shrink-0 text-xl font-bold tracking-tight transition hover:text-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
        >
          Smart Space
        </button>

        <div className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => navigate("/home")}
            className={`${navLink} text-slate-300 hover:bg-slate-800 hover:text-white`}
          >
            Home
          </button>

          <button
            onClick={() => navigate("/search")}
            className={`${navLink} bg-blue-600 text-white shadow-sm hover:bg-blue-700`}
          >
            Find Space
          </button>

          <button
            onClick={() => navigate("/bookings")}
            className={`${navLink} text-slate-300 hover:bg-slate-800 hover:text-white`}
          >
            <span className="hidden sm:inline">My Bookings</span>
            <span className="sm:hidden">Bookings</span>
          </button>
        </div>
      </nav>

      <main className="mx-auto w-full max-w-7xl px-5 py-7 md:px-8 md:py-10">
        <button
          onClick={() => navigate("/search")}
          className="mb-6 inline-flex items-center gap-2 rounded-lg text-sm font-semibold text-blue-700 transition hover:text-blue-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2"
        >
          <span aria-hidden="true">←</span>
          Back to Search
        </button>

        <section className="mb-8">
          <p className="text-xs font-bold uppercase tracking-widest text-blue-700">
            Review and reserve
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Space Details
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
            Review your selected space and booking schedule before confirming
            your reservation.
          </p>
        </section>

        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
          <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-6 py-5 sm:px-7">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                  <svg
                    className="h-6 w-6"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 21h18M5 21V7l7-4 7 4v14M9 10h.01M15 10h.01M9 14h.01M15 14h.01M10 21v-4h4v4"
                    />
                  </svg>
                </div>

                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Space Information
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Details of your selected space
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 sm:p-7">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="inline-flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  Available
                </span>

                <span className="text-sm font-medium text-slate-500">
                  ID: {space.space_id}
                </span>
              </div>

              <h3 className="mt-5 break-words text-2xl font-bold tracking-tight text-slate-900">
                {space.name}
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                {space.type || "Space"}
              </p>

              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className={detailBox}>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Space Type
                  </p>
                  <p className="mt-2 break-words font-semibold text-slate-900">
                    {space.type || "Not specified"}
                  </p>
                </div>

                <div className={detailBox}>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Capacity
                  </p>
                  <p className="mt-2 font-semibold text-slate-900">
                    {space.capacity} people
                  </p>
                </div>

                <div className={`${detailBox} sm:col-span-2`}>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Location
                  </p>
                  <p className="mt-2 break-words font-semibold text-slate-900">
                    {space.location || "Not specified"}
                  </p>
                </div>
              </div>

              <div className="mt-6 rounded-lg border border-blue-100 bg-blue-50 p-4">
                <p className="text-sm font-semibold text-blue-900">
                  Before you book
                </p>
                <p className="mt-1 text-sm leading-6 text-blue-800">
                  Check the selected date and time on the booking panel before
                  confirming your reservation.
                </p>
              </div>
            </div>
          </section>

          <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-6 py-5 sm:px-7">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                  <svg
                    className="h-6 w-6"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
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

                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Booking Details
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Confirm your reservation information
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 sm:p-7">
              <div className="space-y-4">
                <div className={detailBox}>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Booking Date
                  </p>
                  <p className="mt-2 font-semibold text-slate-900">
                    {booking.date}
                  </p>
                </div>

                <div className={detailBox}>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Selected Time Slot
                  </p>
                  <p className="mt-2 font-semibold text-slate-900">
                    {booking.start_time} – {booking.end_time}
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="purpose"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Purpose of Booking
                  </label>

                  <input
                    id="purpose"
                    type="text"
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    placeholder="e.g. Group Discussion"
                    className={inputClass}
                  />

                  <p className="mt-2 text-xs leading-5 text-slate-500">
                    Leave this blank to use the default purpose, General
                    Booking.
                  </p>
                </div>
              </div>

              {error && (
                <div
                  role="alert"
                  className="mt-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-700"
                >
                  {error}
                </div>
              )}

              {message && (
                <div
                  role="status"
                  className="mt-5 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-700"
                >
                  {message}
                  <p className="mt-1 text-xs font-normal">
                    Redirecting you to My Bookings...
                  </p>
                </div>
              )}

              <button
                onClick={handleBooking}
                disabled={loading || Boolean(message)}
                className={`${primaryButton} mt-6`}
              >
                {loading ? (
                  <>
                    <svg
                      className="h-4 w-4 animate-spin"
                      viewBox="0 0 24 24"
                      fill="none"
                      aria-hidden="true"
                    >
                      <circle
                        cx="12"
                        cy="12"
                        r="9"
                        stroke="currentColor"
                        strokeWidth="3"
                        opacity="0.25"
                      />
                      <path
                        d="M21 12a9 9 0 0 0-9-9"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                      />
                    </svg>
                    Confirming Booking...
                  </>
                ) : message ? (
                  "Booking Confirmed"
                ) : (
                  <>
                    Confirm Booking
                    <span aria-hidden="true">→</span>
                  </>
                )}
              </button>

              <p className="mt-4 text-center text-xs leading-5 text-slate-500">
                Please verify your booking details before confirming.
              </p>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default SpaceDetails;