import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

function ManagerDashboard() {
  const navigate = useNavigate();

  const [spaces, setSpaces] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");
  const [bookingError, setBookingError] = useState("");

  const loadSpaces = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("http://localhost:5000/api/spaces", {
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load spaces");
      }

      setSpaces(data.spaces || []);
    } catch (error) {
      console.error("Load spaces error:", error);
      setError(error.message || "Failed to load spaces");
    } finally {
      setLoading(false);
    }
  };

  const loadBookings = async () => {
    setBookingsLoading(true);
    setBookingError("");

    try {
      const response = await fetch(
        "http://localhost:5000/api/bookings/manager",
        {
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load bookings");
      }

      setBookings(data.bookings || []);
    } catch (error) {
      console.error("Load manager bookings error:", error);
      setBookingError(error.message || "Failed to load bookings");
    } finally {
      setBookingsLoading(false);
    }
  };

  useEffect(() => {
    loadSpaces();
    loadBookings();
  }, []);

  const handleLogout = async () => {
    setLoggingOut(true);

    try {
      await fetch("http://localhost:5000/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      navigate("/login", { replace: true });
      window.location.reload();
    }
  };

  const deleteSpace = async (spaceId) => {
    if (!window.confirm("Are you sure you want to delete this space?")) {
      return;
    }

    try {
      setDeletingId(spaceId);

      const response = await fetch(
        `http://localhost:5000/api/spaces/${spaceId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete space");
      }

      await loadSpaces();
    } catch (error) {
      window.alert(error.message || "Failed to delete space");
    } finally {
      setDeletingId(null);
    }
  };

  const formatTime = (time) => {
    if (!time) return "-";

    const value = String(time);
    const match = value.match(/^(\d{1,2}):(\d{2})/);

    if (!match) return value;

    const hours = Number(match[1]);
    const minutes = match[2];
    const suffix = hours >= 12 ? "PM" : "AM";
    const displayHours = hours % 12 || 12;

    return `${displayHours}:${minutes} ${suffix}`;
  };

  const formatDate = (date) => {
    if (!date) return "-";

    const value = String(date).slice(0, 10);
    const parts = value.split("-");

    if (parts.length !== 3) return value;

    return new Date(
      Number(parts[0]),
      Number(parts[1]) - 1,
      Number(parts[2])
    ).toLocaleDateString();
  };

  const statusStyle = (status) => {
    const value = String(status || "").toLowerCase();

    if (value === "confirmed" || value === "approved") {
      return "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200";
    }

    if (value === "cancelled" || value === "rejected") {
      return "bg-red-50 text-red-700 ring-1 ring-inset ring-red-200";
    }

    return "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200";
  };

  const primaryButton =
    "inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60";

  const secondaryButton =
    "inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 disabled:cursor-not-allowed disabled:opacity-60";

  const renderIcon = (icon, className = "h-6 w-6") => {
    const commonProps = {
      xmlns: "http://www.w3.org/2000/svg",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: 1.8,
      className,
      "aria-hidden": true,
    };

    switch (icon) {
      case "spaces":
        return (
          <svg {...commonProps}>
            <rect x="3" y="3" width="7" height="7" rx="1.5" />
            <rect x="14" y="3" width="7" height="7" rx="1.5" />
            <rect x="3" y="14" width="7" height="7" rx="1.5" />
            <rect x="14" y="14" width="7" height="7" rx="1.5" />
          </svg>
        );

      case "calendar":
        return (
          <svg {...commonProps}>
            <rect x="3" y="5" width="18" height="16" rx="2" />
            <path d="M16 3v4M8 3v4M3 11h18" />
          </svg>
        );

      case "building":
        return (
          <svg {...commonProps}>
            <rect x="4" y="3" width="16" height="18" rx="2" />
            <path d="M9 7h2m2 0h2M9 11h2m2 0h2M9 15h2m2 0h2M10 21v-3h4v3" />
          </svg>
        );

      default:
        return null;
    }
  };

  const statistics = [
    {
      title: "Total Spaces",
      count: loading ? "—" : spaces.length,
      description: "Spaces available to manage",
      color: "bg-blue-500",
      icon: "spaces",
    },
    {
      title: "Total Bookings",
      count: bookingsLoading ? "—" : bookings.length,
      description: "Reservations for your spaces",
      color: "bg-emerald-500",
      icon: "calendar",
    },
  ];

  return (
    <div className="min-h-screen w-full bg-slate-100 text-slate-900">
      {/* Navbar */}
      <nav className="sticky top-0 z-20 flex min-h-[64px] w-full items-center justify-between border-b border-slate-800 bg-slate-900 px-5 py-3 text-white shadow-sm md:px-8">
        <button
          onClick={() => navigate("/manager")}
          className="shrink-0 text-xl font-bold tracking-tight transition hover:text-blue-200 sm:text-2xl"
        >
          Smart Space
        </button>

        <div className="flex items-center gap-2 sm:gap-3">
          <span className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white">
            Manager
          </span>

          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loggingOut ? "Logging out..." : "Logout"}
          </button>
        </div>
      </nav>

      <main className="mx-auto w-full max-w-[1600px] px-5 py-8 md:px-8 md:py-10">
        {/* Page Heading */}
        <section className="mb-8 flex flex-col justify-between gap-5 xl:flex-row xl:items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Manager Dashboard
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
              Manage your spaces, review reservations, and keep track of
              activity across your organization.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => navigate("/manager/schedules")}
              className={secondaryButton}
            >
              Manage Schedules
            </button>

            <button
              onClick={() => navigate("/manager/facilities")}
              className={secondaryButton}
            >
              Manage Facilities
            </button>

            <button
              onClick={() => navigate("/manager/spaces/add")}
              className={primaryButton}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="h-4 w-4"
                aria-hidden="true"
              >
                <path d="M12 5v14M5 12h14" />
              </svg>
              Add Space
            </button>
          </div>
        </section>

        {/* Statistics */}
        <section className="mb-9">
          <div className="mb-4 rounded-xl border border-blue-100 bg-blue-50 px-5 py-4">
            <h2 className="text-lg font-bold text-blue-900">
              Platform Overview
            </h2>
            <p className="mt-1 text-sm text-blue-700">
              A quick summary of your managed spaces and bookings.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {statistics.map((stat) => (
              <div
                key={stat.title}
                className={`${stat.color} flex items-center justify-between gap-4 rounded-xl border border-white/30 p-6 text-white shadow-sm transition-shadow hover:shadow-md`}
              >
                <div>
                  <p className="text-sm font-medium opacity-95">
                    {stat.title}
                  </p>

                  <p className="mt-2 text-3xl font-bold tracking-tight">
                    {stat.count}
                  </p>

                  <p className="mt-2 text-sm opacity-90">
                    {stat.description}
                  </p>
                </div>

                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-white/15">
                  {renderIcon(stat.icon, "h-7 w-7")}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Manager Bookings */}
        <section className="mb-10">
          <div className="mb-5 rounded-xl border border-violet-100 bg-violet-50 px-5 py-4">
            <h2 className="text-xl font-bold text-violet-900">
              Bookings for Your Spaces
            </h2>
            <p className="mt-1 text-sm text-violet-700">
              Review reservations, booking times, and their current status.
            </p>
          </div>

          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-slate-500">
              {bookingsLoading
                ? "Loading reservation details..."
                : `${bookings.length} ${
                    bookings.length === 1 ? "booking" : "bookings"
                  } found`}
            </p>

            <button
              onClick={loadBookings}
              disabled={bookingsLoading}
              className={secondaryButton}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className={`h-4 w-4 ${bookingsLoading ? "animate-spin" : ""}`}
                aria-hidden="true"
              >
                <path d="M20 7v5h-5M4 17v-5h5" />
                <path d="M5.5 9A7 7 0 0 1 18 6l2 6M4 12l2 6a7 7 0 0 0 12.5-3" />
              </svg>
              {bookingsLoading ? "Refreshing..." : "Refresh Bookings"}
            </button>
          </div>

          {bookingsLoading ? (
            <div className="rounded-xl border border-slate-200 bg-white p-12 text-center shadow-sm">
              <div className="mx-auto mb-4 h-9 w-9 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />
              <p className="font-semibold text-slate-800">
                Loading bookings
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Retrieving reservation details...
              </p>
            </div>
          ) : bookingError ? (
            <div
              role="alert"
              className="rounded-xl border border-red-200 bg-white p-6 shadow-sm"
            >
              <p className="font-semibold text-red-700">
                Could not load bookings
              </p>
              <p className="mt-1 text-sm text-slate-600">{bookingError}</p>

              <button
                onClick={loadBookings}
                className={`${primaryButton} mt-4`}
              >
                Retry Bookings
              </button>
            </div>
          ) : bookings.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-white px-5 py-12 text-center shadow-sm">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                {renderIcon("calendar", "h-7 w-7")}
              </div>

              <h3 className="mt-4 text-lg font-bold text-slate-900">
                No bookings yet
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                Reservations for your organization's spaces will appear here
                when users make bookings.
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] text-left text-sm">
                  <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-5 py-4">User</th>
                      <th className="px-5 py-4">Space</th>
                      <th className="whitespace-nowrap px-5 py-4">Date</th>
                      <th className="whitespace-nowrap px-5 py-4">Time</th>
                      <th className="px-5 py-4">Purpose</th>
                      <th className="px-5 py-4">Status</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {bookings.map((booking) => (
                      <tr
                        key={booking.booking_id}
                        className="transition-colors hover:bg-blue-50/40"
                      >
                        <td className="px-5 py-4">
                          <p className="font-semibold text-slate-800">
                            {booking.user_name || "Unknown user"}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {booking.user_email || "—"}
                          </p>
                        </td>

                        <td className="px-5 py-4">
                          <p className="font-semibold text-slate-800">
                            {booking.space_name || "Unnamed space"}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {booking.location || "—"}
                          </p>
                        </td>

                        <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                          {formatDate(booking.date)}
                        </td>

                        <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                          {formatTime(booking.start_time)} –{" "}
                          {formatTime(booking.end_time)}
                        </td>

                        <td className="max-w-56 px-5 py-4 text-slate-600">
                          <span className="line-clamp-2">
                            {booking.purpose || "—"}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusStyle(
                              booking.status
                            )}`}
                          >
                            {booking.status || "Unknown"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="border-t border-slate-200 bg-slate-50 px-5 py-3">
                <p className="text-xs text-slate-500">
                  Showing {bookings.length}{" "}
                  {bookings.length === 1 ? "booking" : "bookings"}
                </p>
              </div>
            </div>
          )}
        </section>

        {/* Manager Spaces */}
        <section>
          <div className="mb-5 rounded-xl border border-violet-100 bg-violet-50 px-5 py-4">
            <h2 className="text-xl font-bold text-violet-900">
              Your Spaces
            </h2>
            <p className="mt-1 text-sm text-violet-700">
              View and manage the spaces under your organization.
            </p>
          </div>

          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-slate-500">
              {loading
                ? "Loading your spaces..."
                : `${spaces.length} ${
                    spaces.length === 1 ? "space" : "spaces"
                  } found`}
            </p>

            <button
              onClick={loadSpaces}
              disabled={loading}
              className={secondaryButton}
            >
              {loading ? "Refreshing..." : "Refresh Spaces"}
            </button>
          </div>

          {loading ? (
            <div className="rounded-xl border border-slate-200 bg-white p-12 text-center shadow-sm">
              <div className="mx-auto mb-4 h-9 w-9 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />
              <p className="font-semibold text-slate-800">Loading spaces</p>
              <p className="mt-1 text-sm text-slate-500">
                Retrieving your managed spaces...
              </p>
            </div>
          ) : error ? (
            <div
              role="alert"
              className="rounded-xl border border-red-200 bg-white p-6 shadow-sm"
            >
              <p className="font-semibold text-red-700">
                Could not load spaces
              </p>
              <p className="mt-1 text-sm text-slate-600">{error}</p>

              <button
                onClick={loadSpaces}
                className={`${primaryButton} mt-4`}
              >
                Retry
              </button>
            </div>
          ) : spaces.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-white px-5 py-12 text-center shadow-sm">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                {renderIcon("spaces", "h-7 w-7")}
              </div>

              <h3 className="mt-4 text-lg font-bold text-slate-900">
                No spaces found
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                Add your first space to start managing your organization's
                resources.
              </p>

              <button
                onClick={() => navigate("/manager/spaces/add")}
                className={`${primaryButton} mt-5`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="h-4 w-4"
                  aria-hidden="true"
                >
                  <path d="M12 5v14M5 12h14" />
                </svg>
                Add Your First Space
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              {spaces.map((space) => {
                const isDeleting = deletingId === space.space_id;

                return (
                  <article
                    key={space.space_id}
                    className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
                  >
                    <div className="h-1.5 bg-blue-600" />

                    <div className="p-5 sm:p-6">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="break-words text-lg font-bold text-slate-900">
                            {space.name || "Unnamed Space"}
                          </h3>

                          <p className="mt-1 text-sm text-slate-500">
                            {space.type || "Space"}
                          </p>
                        </div>

                        <span className="shrink-0 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
                          Space
                        </span>
                      </div>

                      <div className="mt-5 space-y-4 border-t border-slate-100 pt-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-center gap-2 text-sm text-slate-500">
                            {renderIcon("users", "h-4 w-4")}
                            Capacity
                          </div>

                          <span className="text-right text-sm font-semibold text-slate-800">
                            {space.capacity ?? "—"} people
                          </span>
                        </div>

                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-center gap-2 text-sm text-slate-500">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.8"
                              className="h-4 w-4 shrink-0"
                              aria-hidden="true"
                            >
                              <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
                              <circle cx="12" cy="10" r="2.5" />
                            </svg>
                            Location
                          </div>

                          <span className="max-w-[60%] break-words text-right text-sm font-semibold text-slate-800">
                            {space.location || "Not specified"}
                          </span>
                        </div>
                      </div>

                      <div className="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-3">
                        <button
                          onClick={() =>
                            navigate(
                              `/manager/spaces/edit/${space.space_id}`,
                              { state: { space } }
                            )
                          }
                          disabled={isDeleting}
                          className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2.5 text-sm font-semibold text-blue-700 transition hover:border-blue-300 hover:bg-blue-100 disabled:opacity-50"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() =>
                            navigate(
                              `/manager/spaces/${space.space_id}/facilities`,
                              { state: { space } }
                            )
                          }
                          disabled={isDeleting}
                          className="rounded-lg border border-violet-200 bg-violet-50 px-3 py-2.5 text-sm font-semibold text-violet-700 transition hover:border-violet-300 hover:bg-violet-100 disabled:opacity-50"
                        >
                          Facilities
                        </button>

                        <button
                          onClick={() => deleteSpace(space.space_id)}
                          disabled={deletingId !== null}
                          className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm font-semibold text-red-600 transition hover:border-red-300 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {isDeleting ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default ManagerDashboard;