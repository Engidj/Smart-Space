import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function AdminAnalytics() {
  const navigate = useNavigate();

  const [summary, setSummary] = useState({
    total_bookings: 0,
    confirmed_bookings: 0,
    cancelled_bookings: 0,
  });

  const [popularSpaces, setPopularSpaces] = useState([]);
  const [monthlyBookings, setMonthlyBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        setError("");

        const response = await fetch(
          "http://localhost:5000/api/admin/analytics",
          { credentials: "include" }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to load analytics");
        }

        setSummary(data.summary || {});
        setPopularSpaces(data.popularSpaces || []);
        setMonthlyBookings(data.monthlyBookings || []);
      } catch (err) {
        setError(err.message || "Failed to load analytics");
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, []);

  const exportCSV = () => {
    const rows = [
      ["Month", "Booking Count"],
      ...monthlyBookings.map((item) => [
        item.month,
        item.booking_count,
      ]),
    ];

    const csv = rows
      .map((row) =>
        row
          .map((value) => `"${String(value ?? "").replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\r\n");

    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "smart-space-analytics.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
  };

  const maxMonthlyBookings = Math.max(
    1,
    ...monthlyBookings.map((item) => Number(item.booking_count) || 0)
  );

  const maxSpaceBookings = Math.max(
    1,
    ...popularSpaces.map((item) => Number(item.booking_count) || 0)
  );

  const stats = [
    {
      title: "Total Bookings",
      count: Number(summary.total_bookings || 0),
      color: "bg-blue-500",
      icon: "calendar",
    },
    {
      title: "Confirmed Bookings",
      count: Number(summary.confirmed_bookings || 0),
      color: "bg-emerald-500",
      icon: "check",
    },
    {
      title: "Cancelled Bookings",
      count: Number(summary.cancelled_bookings || 0),
      color: "bg-rose-500",
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

  const primaryButton =
    "inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

  const secondaryButton =
    "inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 disabled:cursor-not-allowed disabled:opacity-50";

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

        <div className="flex items-center gap-2">
          <span className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white">
            Admin
          </span>

          <button
            onClick={() => navigate("/admin")}
            className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-300 transition hover:bg-slate-800 hover:text-white sm:px-4"
          >
            <span className="hidden sm:inline">Dashboard</span>
            <span className="sm:hidden">Back</span>
          </button>
        </div>
      </nav>

      <main className="mx-auto w-full max-w-7xl px-5 py-8 md:px-8 md:py-10">
        {/* Page Heading */}
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Reports & Analytics
            </h1>

            <p className="mt-2 text-sm leading-6 text-slate-600 sm:text-base">
              Understand bookings and space usage across the platform.
            </p>
          </div>

          <button
            onClick={exportCSV}
            disabled={loading || monthlyBookings.length === 0}
            className={primaryButton}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="h-4 w-4"
              aria-hidden="true"
            >
              <path d="M12 3v12m-5-5 5 5 5-5" />
              <path d="M5 17v4h14v-4" />
            </svg>
            Export Monthly CSV
          </button>
        </div>

        {/* Error */}
        {error && (
          <div
            role="alert"
            className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            <p className="font-semibold">Could not load analytics</p>
            <p className="mt-1">{error}</p>
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="rounded-xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />
            <p className="text-sm font-medium text-slate-600">
              Loading analytics...
            </p>
          </div>
        ) : (
          <>
            {/* Statistics */}
            <section className="mb-8">
              <div className="mb-4 rounded-xl border border-blue-100 bg-blue-50 px-5 py-4">
                <h2 className="text-lg font-bold text-blue-900">
                  Booking Overview
                </h2>
                <p className="mt-1 text-sm text-blue-700">
                  A quick summary of booking activity across Smart Space.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
                        {stat.count}
                      </p>
                    </div>

                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-white/15">
                      {renderIcon(stat.icon, "h-7 w-7")}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Booking Charts */}
            <section className="mb-8">
              <div className="mb-4 rounded-xl border border-violet-100 bg-violet-50 px-5 py-4">
                <h2 className="text-lg font-bold text-violet-900">
                  Booking Insights
                </h2>
                <p className="mt-1 text-sm text-violet-700">
                  Compare monthly trends and the most-booked spaces.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                {/* Monthly Trends */}
                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                  <div className="mb-6 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                      {renderIcon("calendar", "h-5 w-5")}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900">
                        Monthly Booking Trends
                      </h3>
                      <p className="mt-1 text-sm text-slate-500">
                        Bookings by month
                      </p>
                    </div>
                  </div>

                  {monthlyBookings.length === 0 ? (
                    <p className="rounded-lg bg-slate-50 p-6 text-center text-sm text-slate-500">
                      No monthly booking data available.
                    </p>
                  ) : (
                    <div className="space-y-5">
                      {monthlyBookings.map((item) => {
                        const count = Number(item.booking_count) || 0;
                        const width = Math.max(
                          0,
                          (count / maxMonthlyBookings) * 100
                        );

                        return (
                          <div key={item.month}>
                            <div className="mb-2 flex justify-between gap-4 text-sm">
                              <span className="font-medium text-slate-700">
                                {item.month}
                              </span>
                              <span className="font-bold text-slate-900">
                                {count}
                              </span>
                            </div>

                            <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                              <div
                                className="h-full rounded-full bg-blue-600 transition-all duration-500"
                                style={{ width: `${width}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Popular Spaces */}
                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                  <div className="mb-6 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        className="h-5 w-5"
                        aria-hidden="true"
                      >
                        <rect x="3" y="3" width="7" height="7" rx="1.5" />
                        <rect x="14" y="3" width="7" height="7" rx="1.5" />
                        <rect x="3" y="14" width="7" height="7" rx="1.5" />
                        <rect x="14" y="14" width="7" height="7" rx="1.5" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900">
                        Most-Booked Spaces
                      </h3>
                      <p className="mt-1 text-sm text-slate-500">
                        Popular spaces by booking count
                      </p>
                    </div>
                  </div>

                  {popularSpaces.length === 0 ? (
                    <p className="rounded-lg bg-slate-50 p-6 text-center text-sm text-slate-500">
                      No spaces available.
                    </p>
                  ) : (
                    <div className="space-y-5">
                      {popularSpaces.map((space) => {
                        const count = Number(space.booking_count) || 0;
                        const width = Math.max(
                          0,
                          (count / maxSpaceBookings) * 100
                        );

                        return (
                          <div key={space.space_id}>
                            <div className="mb-2 flex justify-between gap-4 text-sm">
                              <span className="min-w-0 truncate font-medium text-slate-700">
                                {space.space_name}
                              </span>
                              <span className="shrink-0 font-bold text-slate-900">
                                {count}
                              </span>
                            </div>

                            <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                              <div
                                className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                                style={{ width: `${width}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* Monthly Report Table */}
            <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-5 sm:px-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    Monthly Report
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    A detailed breakdown of bookings by month.
                  </p>
                </div>

                <span className="rounded-lg bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700">
                  {monthlyBookings.length}{" "}
                  {monthlyBookings.length === 1 ? "month" : "months"}
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="whitespace-nowrap px-5 py-4 sm:px-6">
                        No.
                      </th>
                      <th className="px-5 py-4 sm:px-6">Month</th>
                      <th className="px-5 py-4 sm:px-6">Bookings</th>
                    </tr>
                  </thead>

                  <tbody>
                    {monthlyBookings.length === 0 ? (
                      <tr>
                        <td
                          colSpan={3}
                          className="px-6 py-12 text-center text-slate-500"
                        >
                          No report data available.
                        </td>
                      </tr>
                    ) : (
                      monthlyBookings.map((item, index) => (
                        <tr
                          key={item.month}
                          className="border-t border-slate-100 transition hover:bg-blue-50/40"
                        >
                          <td className="px-5 py-4 text-slate-500 sm:px-6">
                            {index + 1}
                          </td>
                          <td className="px-5 py-4 font-medium text-slate-700 sm:px-6">
                            {item.month}
                          </td>
                          <td className="px-5 py-4 sm:px-6">
                            <span className="inline-flex rounded-lg bg-blue-50 px-3 py-1.5 font-semibold text-blue-700">
                              {item.booking_count}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}

export default AdminAnalytics;