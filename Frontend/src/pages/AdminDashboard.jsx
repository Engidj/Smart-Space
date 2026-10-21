import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function AdminDashboard() {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [spaces, setSpaces] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setError("");

        const endpoints = [
          "http://localhost:5000/api/admin/users",
          "http://localhost:5000/api/admin/organizations",
          "http://localhost:5000/api/admin/spaces",
          "http://localhost:5000/api/admin/bookings",
        ];

        const responses = await Promise.all(
          endpoints.map((url) =>
            fetch(url, { credentials: "include" })
          )
        );

        const results = await Promise.all(
          responses.map(async (response) => {
            const data = await response.json();

            if (!response.ok) {
              throw new Error(
                data.message || "Failed to load dashboard data"
              );
            }

            return data;
          })
        );

        setUsers(results[0].users || []);
        setOrganizations(results[1].organizations || []);
        setSpaces(results[2].spaces || []);
        setBookings(results[3].bookings || []);
      } catch (err) {
        setError(err.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleLogout = async () => {
    setLoggingOut(true);

    try {
      await fetch("http://localhost:5000/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      navigate("/login", { replace: true });
      window.location.reload();
    }
  };

  const stats = [
    {
      title: "Total Users",
      count: users.length,
      color: "bg-blue-500 text-white",
      icon: "users",
    },
    {
      title: "Organizations",
      count: organizations.length,
      color: "bg-purple-500 text-white",
      icon: "building",
    },
    {
      title: "Total Spaces",
      count: spaces.length,
      color: "bg-green-500 text-white",
      icon: "spaces",
    },
    {
      title: "Total Bookings",
      count: bookings.length,
      color: "bg-orange-500 text-white",
      icon: "calendar",
    },
  ];

  const managementItems = [
    {
      title: "Manage Spaces",
      description: "View and manage available spaces.",
      path: "/admin/spaces",
      icon: "spaces",
      cardColor:
        "bg-blue-50/70 border-blue-100 hover:bg-blue-100/70",
      iconColor:
        "bg-blue-100 text-blue-700 group-hover:bg-blue-200",
    },
    {
      title: "Manage Bookings",
      description: "Review and manage space bookings.",
      path: "/admin/bookings",
      icon: "calendar",
      cardColor:
        "bg-emerald-50/70 border-emerald-100 hover:bg-emerald-100/70",
      iconColor:
        "bg-emerald-100 text-emerald-700 group-hover:bg-emerald-200",
    },
    {
      title: "Manage Users",
      description: "View registered users.",
      path: "/admin/users",
      icon: "users",
      cardColor:
        "bg-violet-50/70 border-violet-100 hover:bg-violet-100/70",
      iconColor:
        "bg-violet-100 text-violet-700 group-hover:bg-violet-200",
    },
    {
      title: "Manage Organizations",
      description: "Manage registered organizations.",
      path: "/admin/organizations",
      icon: "building",
      cardColor:
        "bg-amber-50/70 border-amber-100 hover:bg-amber-100/70",
      iconColor:
        "bg-amber-100 text-amber-700 group-hover:bg-amber-200",
    },
    {
      title: "View Analytics",
      description: "Explore platform statistics.",
      path: "/admin/analytics",
      icon: "chart",
      cardColor:
        "bg-cyan-50/70 border-cyan-100 hover:bg-cyan-100/70",
      iconColor:
        "bg-cyan-100 text-cyan-700 group-hover:bg-cyan-200",
    },
    {
      title: "Activity Logs",
      description: "Review recorded platform activity.",
      path: "/admin/activity-logs",
      icon: "activity",
      cardColor:
        "bg-rose-50/70 border-rose-100 hover:bg-rose-100/70",
      iconColor:
        "bg-rose-100 text-rose-700 group-hover:bg-rose-200",
    },
  ];

  const formatDate = (date) => {
    if (!date) return "-";

    if (typeof date === "string") {
      const value = date.split("T")[0];
      const parts = value.split("-");

      if (parts.length === 3) {
        return new Date(
          Number(parts[0]),
          Number(parts[1]) - 1,
          Number(parts[2])
        ).toLocaleDateString();
      }

      return value;
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return String(date);
    }

    return parsedDate.toLocaleDateString();
  };

  const getStatusClass = (status) => {
    const value = String(status || "").toLowerCase();

    if (value === "approved" || value === "confirmed") {
      return "bg-emerald-50 text-emerald-700";
    }

    if (value === "rejected") {
      return "bg-red-50 text-red-700";
    }

    if (value === "cancelled") {
      return "bg-slate-100 text-slate-600";
    }

    return "bg-amber-50 text-amber-700";
  };

  const renderIcon = (icon, className = "h-5 w-5") => {
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
      case "users":
        return (
          <svg {...commonProps}>
            <path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="10" cy="7" r="4" />
            <path d="M20 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        );

      case "building":
        return (
          <svg {...commonProps}>
            <rect x="4" y="3" width="16" height="18" rx="2" />
            <path d="M9 7h2m2 0h2M9 11h2m2 0h2M9 15h2m2 0h2M10 21v-3h4v3" />
          </svg>
        );

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

      case "chart":
        return (
          <svg {...commonProps}>
            <path d="M3 3v18h18" />
            <path d="m7 14 4-4 4 3 5-7" />
          </svg>
        );

      case "activity":
        return (
          <svg {...commonProps}>
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
          </svg>
        );

      default:
        return null;
    }
  };

  const primaryButton =
    "inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60";

  const sortedBookings = [...bookings]
    .sort(
      (a, b) =>
        new Date(b.created_at || b.date || 0).getTime() -
        new Date(a.created_at || a.date || 0).getTime()
    )
    .slice(0, 5);

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
            onClick={handleLogout}
            disabled={loggingOut}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loggingOut ? "Logging out..." : "Logout"}
          </button>
        </div>
      </nav>

      <main className="mx-auto w-full max-w-7xl px-5 py-8 md:px-8 md:py-10">
        {/* Page Heading */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Admin Dashboard
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-600 sm:text-base">
            Manage users, organizations, spaces and bookings.
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="rounded-xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />
            <p className="text-sm font-medium text-slate-600">
              Loading dashboard...
            </p>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div
            role="alert"
            className="rounded-xl border border-red-200 bg-white p-6"
          >
            <h2 className="font-semibold text-red-700">
              Could not load dashboard
            </h2>

            <p className="mt-1 text-sm text-slate-600">{error}</p>

            <button
              onClick={() => window.location.reload()}
              className={`${primaryButton} mt-4`}
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !error && (
          <>
            {/* Platform Overview */}
            <section className="mb-9">
              <div className="mb-4">
                <h2 className="text-lg font-bold text-slate-900">
                  Platform Overview
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  A quick summary of your platform.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {stats.map((stat) => (
                  <div
                    key={stat.title}
                    className={`${stat.color} flex items-center justify-between gap-4 rounded-xl border border-white/30 p-6 shadow-sm transition-shadow hover:shadow-md`}
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

            {/* Management */}
            <section className="mb-9">
              <div className="mb-4 rounded-xl    px-5 py-4">
                <h2 className="text-xl font-bold ">
                  Management
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Access administrative tools and platform records.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {managementItems.map((item) => (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className={`group flex w-full items-center gap-4 rounded-xl border p-5 text-left shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 ${item.cardColor}`}
                  >
                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg transition ${item.iconColor}`}
                    >
                      {renderIcon(item.icon, "h-5 w-5")}
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-slate-900">
                        {item.title}
                      </h3>
                      <p className="mt-1 text-sm leading-5 text-slate-600">
                        {item.description}
                      </p>
                    </div>

                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="h-4 w-4 shrink-0 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-slate-700"
                      aria-hidden="true"
                    >
                      <path d="m9 18 6-6-6-6" />
                    </svg>
                  </button>
                ))}
              </div>
            </section>

            {/* Recent Bookings */}
            <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-5 sm:px-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    Recent Bookings
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    The five most recent bookings available in the response.
                  </p>
                </div>

                <button
                  onClick={() => navigate("/admin/bookings")}
                  className={primaryButton}
                >
                  View All
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

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="whitespace-nowrap px-5 py-4 sm:px-6">
                        No.
                      </th>
                      <th className="px-5 py-4 sm:px-6">User</th>
                      <th className="px-5 py-4 sm:px-6">Space</th>
                      <th className="whitespace-nowrap px-5 py-4 sm:px-6">
                        Date
                      </th>
                      <th className="px-5 py-4 sm:px-6">Purpose</th>
                      <th className="px-5 py-4 sm:px-6">Status</th>
                    </tr>
                  </thead>

                  <tbody>
                    {sortedBookings.length === 0 ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-6 py-12 text-center text-slate-500"
                        >
                          No bookings found.
                        </td>
                      </tr>
                    ) : (
                      sortedBookings.map((booking, index) => (
                        <tr
                          key={booking.booking_id || index}
                          className="border-t border-slate-100 transition hover:bg-slate-50"
                        >
                          <td className="px-5 py-4 text-slate-500 sm:px-6">
                            {index + 1}
                          </td>

                          <td className="min-w-48 px-5 py-4 sm:px-6">
                            <p className="font-semibold text-slate-800">
                              {booking.user_name || "-"}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              {booking.user_email || ""}
                            </p>
                          </td>

                          <td className="min-w-36 px-5 py-4 font-medium text-slate-700 sm:px-6">
                            {booking.space_name || "-"}
                          </td>

                          <td className="whitespace-nowrap px-5 py-4 text-slate-600 sm:px-6">
                            {formatDate(booking.date)}
                          </td>

                          <td className="min-w-36 px-5 py-4 text-slate-600 sm:px-6">
                            {booking.purpose || "-"}
                          </td>

                          <td className="px-5 py-4 sm:px-6">
                            <span
                              className={`inline-flex whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(
                                booking.status
                              )}`}
                            >
                              {booking.status || "Pending"}
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

export default AdminDashboard;