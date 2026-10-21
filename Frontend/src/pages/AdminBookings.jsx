import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function AdminBookings() {
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadBookings = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(
          "http://localhost:5000/api/admin/bookings",
          { credentials: "include" }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to load bookings");
        }

        setBookings(data.bookings || []);
      } catch (err) {
        setError(err.message || "Failed to load bookings");
      } finally {
        setLoading(false);
      }
    };

    loadBookings();
  }, []);

  const filteredBookings = bookings.filter((booking) => {
    const searchText = search.trim().toLowerCase();

    const matchesSearch = [
      booking.user_name,
      booking.user_email,
      booking.space_name,
      booking.purpose,
    ].some((value) =>
      String(value || "").toLowerCase().includes(searchText)
    );

    const matchesStatus =
      statusFilter === "all" ||
      String(booking.status || "").toLowerCase() === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const formatDate = (date) => {
    if (!date) return "—";

    if (typeof date === "string") {
      const match = date.match(/^\d{4}-\d{2}-\d{2}/);

      if (match) {
        const [year, month, day] = match[0].split("-").map(Number);

        return new Date(year, month - 1, day).toLocaleDateString();
      }
    }

    const parsedDate = new Date(date);

    return Number.isNaN(parsedDate.getTime())
      ? String(date)
      : parsedDate.toLocaleDateString();
  };

  const getStatusClass = (status) => {
    const value = String(status || "").toLowerCase();

    if (value === "confirmed" || value === "approved") {
      return "border border-emerald-200 bg-emerald-50 text-emerald-700";
    }

    if (value === "cancelled") {
      return "border border-slate-200 bg-slate-100 text-slate-600";
    }

    if (value === "rejected") {
      return "border border-red-200 bg-red-50 text-red-700";
    }

    return "border border-amber-200 bg-amber-50 text-amber-700";
  };

  const navLink =
    "rounded-lg px-3 py-2 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400";

  const inputClass =
    "w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 hover:border-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100";

  const primaryButton =
    "inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

  const totalBookings = bookings.length;

  const confirmedBookings = bookings.filter((booking) =>
    ["confirmed", "approved"].includes(
      String(booking.status || "").toLowerCase()
    )
  ).length;

  const cancelledBookings = bookings.filter(
    (booking) =>
      String(booking.status || "").toLowerCase() === "cancelled"
  ).length;

  const stats = [
    {
      title: "Total Bookings",
      count: totalBookings,
      color: "bg-blue-500",
      icon: "calendar",
    },
    {
      title: "Confirmed Bookings",
      count: confirmedBookings,
      color: "bg-emerald-500",
      icon: "check",
    },
    {
      title: "Cancelled Bookings",
      count: cancelledBookings,
      color: "bg-red-500",
      icon: "cancel",
    },
  ];

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
      case "calendar":
        return (
          <svg {...commonProps}>
            <rect x="3" y="5" width="18" height="16" rx="2" />
            <path d="M16 3v4M8 3v4M3 11h18" />
          </svg>
        );

      case "check":
        return (
          <svg {...commonProps}>
            <circle cx="12" cy="12" r="9" />
            <path d="m8 12 3 3 5-6" />
          </svg>
        );

      case "cancel":
        return (
          <svg {...commonProps}>
            <circle cx="12" cy="12" r="9" />
            <path d="m9 9 6 6m0-6-6 6" />
          </svg>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-100 text-slate-900">
      {/* Navbar */}
      <nav className="sticky top-0 z-20 flex min-h-[64px] w-full items-center justify-between border-b border-slate-800 bg-slate-900 px-5 py-3 text-white shadow-sm md:px-8">
        <button
          onClick={() => navigate("/admin")}
          className="shrink-0 text-xl font-bold tracking-tight transition hover:text-blue-200 sm:text-2xl"
        >
          Smart Space
        </button>

        <div className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => navigate("/admin")}
            className={`${navLink} border border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white`}
          >
            Dashboard
          </button>

          <span
            aria-current="page"
            className={`${navLink} bg-blue-600 text-white shadow-sm`}
          >
            <span className="hidden sm:inline">Booking Management</span>
            <span className="sm:hidden">Bookings</span>
          </span>
        </div>
      </nav>

      <main className="mx-auto w-full max-w-7xl px-5 py-8 md:px-8 md:py-10">
        {/* Page Heading */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Booking Management
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-600 sm:text-base">
            Monitor and manage all space bookings across Smart Space.
          </p>
        </div>

        {/* Booking Statistics */}
        <section className="mb-8">
          <div className="mb-4 rounded-xl border border-blue-100 bg-blue-50 px-5 py-4">
            <h2 className="text-lg font-bold text-blue-900">
              Booking Overview
            </h2>
            <p className="mt-1 text-sm text-blue-700">
              A quick summary of booking activity and status.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {stats.map((stat) => (
              <div
                key={stat.title}
                className={`${stat.color} flex items-center justify-between gap-4 rounded-xl border border-white/30 p-6 text-white shadow-sm transition-shadow hover:shadow-md`}
              >
                <div>
                  <p className="text-sm font-medium opacity-95">
                    {stat.title}
                  </p>
                  <p className="mt-2 text-3xl font-bold tracking-tight">
                    {loading ? "..." : stat.count}
                  </p>
                </div>

                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-white/15">
                  {renderIcon(stat.icon, "h-7 w-7")}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Error Message */}
        {error && (
          <div
            role="alert"
            className="mb-6 flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 p-5 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="font-semibold text-red-800">
                Could not load bookings
              </p>
              <p className="mt-1 text-sm text-red-700">{error}</p>
            </div>

            <button
              onClick={() => window.location.reload()}
              className={primaryButton}
            >
              Try Again
            </button>
          </div>
        )}

        {/* Search and Filters */}
        <section className="mb-6 overflow-hidden rounded-xl border border-violet-100 bg-white shadow-sm">
          <div className="border-b border-violet-100 bg-violet-50 px-5 py-4">
            <h2 className="text-lg font-bold text-violet-900">
              Find Bookings
            </h2>
            <p className="mt-1 text-sm text-violet-700">
              Search by user, email, space, or booking purpose.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 p-5 lg:grid-cols-[minmax(0,1fr)_240px]">
            <div>
              <label
                htmlFor="booking-search"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Search bookings
              </label>

              <div className="relative">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
                  aria-hidden="true"
                >
                  <circle cx="11" cy="11" r="7" />
                  <path d="m20 20-4-4" />
                </svg>

                <input
                  id="booking-search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search user, email, space, or purpose..."
                  className={`${inputClass} pl-11`}
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="booking-status"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Filter by status
              </label>

              <select
                id="booking-status"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className={inputClass}
              >
                <option value="all">All statuses</option>
                <option value="confirmed">Confirmed</option>
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
                <option value="cancelled">Cancelled</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </section>

        {/* Results Summary */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-slate-600">
            Showing{" "}
            <span className="font-bold text-slate-900">
              {filteredBookings.length}
            </span>{" "}
            of{" "}
            <span className="font-bold text-slate-900">
              {bookings.length}
            </span>{" "}
            bookings
          </p>

          {(search || statusFilter !== "all") && (
            <button
              onClick={() => {
                setSearch("");
                setStatusFilter("all");
              }}
              className="text-sm font-semibold text-blue-700 transition hover:text-blue-900"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Bookings Table */}
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-5 sm:px-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                All Bookings
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Booking details, scheduled times, and current status.
              </p>
            </div>

            <span className="rounded-lg bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700">
              {filteredBookings.length}{" "}
              {filteredBookings.length === 1 ? "result" : "results"}
            </span>
          </div>

          {loading ? (
            <div className="p-10 text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />
              <p className="mt-4 text-sm font-medium text-slate-500">
                Loading bookings...
              </p>
            </div>
          ) : error ? (
            <div className="p-10 text-center text-sm text-slate-500">
              Booking records could not be displayed.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="whitespace-nowrap px-5 py-4 font-semibold sm:px-6">
                      No.
                    </th>
                    <th className="whitespace-nowrap px-5 py-4 font-semibold sm:px-6">
                      User
                    </th>
                    <th className="whitespace-nowrap px-5 py-4 font-semibold sm:px-6">
                      Space
                    </th>
                    <th className="whitespace-nowrap px-5 py-4 font-semibold sm:px-6">
                      Date
                    </th>
                    <th className="whitespace-nowrap px-5 py-4 font-semibold sm:px-6">
                      Time
                    </th>
                    <th className="px-5 py-4 font-semibold sm:px-6">
                      Purpose
                    </th>
                    <th className="whitespace-nowrap px-5 py-4 font-semibold sm:px-6">
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredBookings.map((booking, index) => (
                    <tr
                      key={booking.booking_id || index}
                      className="border-t border-slate-100 transition hover:bg-blue-50/40"
                    >
                      <td className="whitespace-nowrap px-5 py-4 text-slate-500 sm:px-6">
                        {index + 1}
                      </td>

                      <td className="min-w-52 px-5 py-4 sm:px-6">
                        <p className="font-semibold text-slate-900">
                          {booking.user_name || "—"}
                        </p>
                        {booking.user_email && (
                          <p className="mt-1 text-xs text-slate-500">
                            {booking.user_email}
                          </p>
                        )}
                      </td>

                      <td className="min-w-40 px-5 py-4 font-medium text-slate-700 sm:px-6">
                        {booking.space_name || "—"}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-slate-600 sm:px-6">
                        {formatDate(booking.date)}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-slate-600 sm:px-6">
                        {booking.start_time || "—"} -{" "}
                        {booking.end_time || "—"}
                      </td>

                      <td className="min-w-40 px-5 py-4 text-slate-600 sm:px-6">
                        {booking.purpose || "—"}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 sm:px-6">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(
                            booking.status
                          )}`}
                        >
                          {booking.status || "Pending"}
                        </span>
                      </td>
                    </tr>
                  ))}

                  {filteredBookings.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-5 py-14 text-center">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                          {renderIcon("calendar", "h-6 w-6")}
                        </div>

                        <p className="mt-3 font-semibold text-slate-800">
                          No matching bookings found
                        </p>

                        <p className="mt-1 text-sm text-slate-500">
                          Try changing your search term or status filter.
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default AdminBookings;