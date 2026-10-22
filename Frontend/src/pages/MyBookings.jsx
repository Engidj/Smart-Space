import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function MyBookings() {
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancellingId, setCancellingId] = useState(null);

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

      // Sort bookings by date and start time (latest first).
      setBookings(
        [...(data.bookings || [])].sort((a, b) => {
          const dateA = String(a.date).slice(0, 10);
          const dateB = String(b.date).slice(0, 10);

          const timeA = String(a.start_time).slice(0, 8);
          const timeB = String(b.start_time).slice(0, 8);

          const dateTimeA = `${dateA} ${timeA}`;
          const dateTimeB = `${dateB} ${timeB}`;

          return dateTimeB.localeCompare(dateTimeA);
        })
      );
    } catch (error) {
      setError(error.message || "Something went wrong while loading bookings.");
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
      setCancellingId(bookingId);
      setError("");

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

      await loadBookings();
    } catch (error) {
      setError(error.message || "Unable to cancel this booking.");
    } finally {
      setCancellingId(null);
    }
  };

  const navLink =
    "whitespace-nowrap rounded-lg px-3 py-2 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400";

  const primaryButton =
    "inline-flex items-center justify-center rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60";

  return (
    <div className="min-h-screen w-full bg-slate-100 text-slate-900">
      {/* Navbar */}
      <nav className="sticky top-0 z-20 flex w-full items-center justify-between border-b border-slate-800 bg-slate-900 px-5 py-3 text-white shadow-sm md:px-8">
        <button
          onClick={() => navigate("/home")}
          className="shrink-0 text-xl font-bold tracking-tight transition hover:text-blue-200"
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
            className={`${navLink} text-slate-300 hover:bg-slate-800 hover:text-white`}
          >
            Find Space
          </button>

          <span
            aria-current="page"
            className={`${navLink} bg-blue-600 text-white shadow-sm`}
          >
            My Bookings
          </span>
        </div>
      </nav>

      <main className="mx-auto w-full max-w-7xl px-5 py-8 md:px-8 md:py-10">
        {/* Page heading */}
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
              My Bookings
            </h1>
          </div>

          {!loading && !error && bookings.length > 0 && (
            <div className="flex items-center gap-3 self-start rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm sm:self-auto">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="h-5 w-5"
                  aria-hidden="true"
                >
                  <rect x="3" y="5" width="18" height="16" rx="2" />
                  <path d="M16 3v4M8 3v4M3 10h18" />
                </svg>
              </div>

              <div>
                <p className="text-xs font-medium text-slate-500">
                  Total bookings
                </p>
                <p className="text-xl font-bold text-slate-900">
                  {bookings.length}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Error message */}
        {error && (
          <div
            role="alert"
            className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="mt-0.5 h-5 w-5 shrink-0"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="9" />
              <path d="M12 8v4m0 4h.01" />
            </svg>

            <div className="flex-1">
              <p className="font-semibold">Something went wrong</p>
              <p className="mt-1">{error}</p>
            </div>

            <button
              onClick={loadBookings}
              disabled={loading}
              className="shrink-0 rounded-lg px-3 py-1.5 font-semibold hover:bg-red-100 disabled:opacity-60"
            >
              Retry
            </button>
          </div>
        )}

        {/* Loading state */}
        {loading ? (
          <div className="rounded-xl border border-slate-200 bg-white p-12 text-center shadow-sm">
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

            <h2 className="font-semibold text-slate-900">
              Loading your bookings
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Please wait while we retrieve your reservations.
            </p>
          </div>
        ) : error ? null : bookings.length === 0 ? (
          /* Empty state */
          <div className="rounded-xl border border-slate-200 bg-white px-6 py-14 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                className="h-8 w-8"
                aria-hidden="true"
              >
                <rect x="3" y="5" width="18" height="16" rx="2" />
                <path d="M16 3v4M8 3v4M3 10h18M8 14h3m-3 3h7" />
              </svg>
            </div>

            <h2 className="mt-5 text-xl font-bold text-slate-900">
              No bookings yet
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              You haven't booked a space yet. Explore available spaces and
              reserve one for your next activity.
            </p>

            <button
              onClick={() => navigate("/search")}
              className={`${primaryButton} mt-6 gap-2`}
            >
              Find a Space
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="h-4 w-4"
                aria-hidden="true"
              >
                <path d="M5 12h14m-6-6 6 6-6 6" />
              </svg>
            </button>
          </div>
        ) : (
          /* Booking cards */
          <>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              {bookings.map((booking) => {
                const isConfirmed = booking.status === "confirmed";
                const isCancelling = cancellingId === booking.booking_id;

                return (
                  <article
                    key={booking.booking_id}
                    className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
                  >
                    <div className="h-1.5 bg-blue-600" />

                    <div className="flex flex-1 flex-col p-5 sm:p-6">
                      {/* Card header */}
                      <div className="mb-5 flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="break-words text-lg font-bold text-slate-900">
                            {booking.space_name || "Unnamed Space"}
                          </h3>

                          <p className="mt-1 text-sm text-slate-500">
                            {booking.type || "Space"}
                          </p>
                        </div>

                        <span
                          className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                            isConfirmed
                              ? "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200"
                              : "bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-200"
                          }`}
                        >
                          {booking.status || "Unknown"}
                        </span>
                      </div>

                      {/* Date and time */}
                      <div className="mb-4 grid grid-cols-2 gap-3">
                        <div className="rounded-lg bg-slate-50 p-3">
                          <div className="mb-2 flex items-center gap-2 text-slate-500">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.8"
                              className="h-4 w-4"
                              aria-hidden="true"
                            >
                              <rect x="3" y="5" width="18" height="16" rx="2" />
                              <path d="M16 3v4M8 3v4M3 10h18" />
                            </svg>
                            <span className="text-xs font-medium">Date</span>
                          </div>

                          <p className="break-words text-sm font-semibold text-slate-900">
                            {booking.date || "Not specified"}
                          </p>
                        </div>

                        <div className="rounded-lg bg-slate-50 p-3">
                          <div className="mb-2 flex items-center gap-2 text-slate-500">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.8"
                              className="h-4 w-4"
                              aria-hidden="true"
                            >
                              <circle cx="12" cy="12" r="9" />
                              <path d="M12 7v5l3 2" />
                            </svg>
                            <span className="text-xs font-medium">Time</span>
                          </div>

                          <p className="break-words text-sm font-semibold text-slate-900">
                            {booking.start_time} - {booking.end_time}
                          </p>
                        </div>
                      </div>

                      {/* Booking information */}
                      <div className="flex-1 space-y-4">
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.8"
                              className="h-4 w-4"
                              aria-hidden="true"
                            >
                              <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
                              <circle cx="12" cy="10" r="2.5" />
                            </svg>
                          </div>

                          <div className="min-w-0">
                            <p className="text-xs font-medium text-slate-500">
                              Location
                            </p>
                            <p className="mt-1 break-words text-sm font-semibold text-slate-800">
                              {booking.location || "Not specified"}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.8"
                              className="h-4 w-4"
                              aria-hidden="true"
                            >
                              <path d="M12 3v18m9-9H3" />
                              <circle cx="12" cy="12" r="9" />
                            </svg>
                          </div>

                          <div className="min-w-0">
                            <p className="text-xs font-medium text-slate-500">
                              Purpose
                            </p>
                            <p className="mt-1 break-words text-sm font-semibold text-slate-800">
                              {booking.purpose || "General Booking"}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Cancel booking */}
                      {isConfirmed ? (
                        <button
                          onClick={() => cancelBooking(booking.booking_id)}
                          disabled={cancellingId !== null}
                          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-3 text-sm font-semibold text-red-600 transition hover:border-red-300 hover:bg-red-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {isCancelling ? (
                            <>
                              <span className="h-4 w-4 animate-spin rounded-full border-2 border-red-200 border-t-red-600" />
                              Cancelling...
                            </>
                          ) : (
                            "Cancel Booking"
                          )}
                        </button>
                      ) : (
                        <div className="mt-6 rounded-lg bg-slate-50 px-4 py-3 text-center text-sm text-slate-500">
                          This booking cannot be cancelled.
                        </div>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default MyBookings;