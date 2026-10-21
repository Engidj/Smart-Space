import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

function AdminActivityLogs() {
  const navigate = useNavigate();

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);

  const logsPerPage = 10;

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        "http://localhost:5000/api/admin/activity-logs",
        { credentials: "include" }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load activity logs");
      }

      setLogs(data.logs || []);
    } catch (err) {
      setError(err.message || "Failed to load activity logs");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, actionFilter]);

  const actions = useMemo(
    () =>
      [...new Set(logs.map((log) => log.action).filter(Boolean))].sort(),
    [logs]
  );

  const filteredLogs = useMemo(() => {
    const searchText = search.trim().toLowerCase();

    return logs.filter((log) => {
      const matchesAction =
        actionFilter === "ALL" || log.action === actionFilter;

      const searchableText = [
        log.user_name,
        log.user_email,
        log.action,
        log.details,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return matchesAction && searchableText.includes(searchText);
    });
  }, [logs, search, actionFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredLogs.length / logsPerPage)
  );

  const startIndex = (currentPage - 1) * logsPerPage;

  const paginatedLogs = filteredLogs.slice(
    startIndex,
    startIndex + logsPerPage
  );

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const exportToCSV = () => {
    const headers = [
      "Log ID",
      "User",
      "Email",
      "Action",
      "Details",
      "Date & Time",
    ];

    const rows = filteredLogs.map((log) => [
      log.log_id,
      log.user_name || "Deleted user",
      log.user_email || "",
      log.action || "",
      log.details || "",
      log.created_at
        ? new Date(log.created_at).toLocaleString()
        : "",
    ]);

    const escapeCSV = (value) =>
      `"${String(value ?? "").replace(/"/g, '""')}"`;

    const csvContent = [
      headers.map(escapeCSV).join(","),
      ...rows.map((row) => row.map(escapeCSV).join(",")),
    ].join("\r\n");

    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "activity_logs.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
  };

  const stats = [
    {
      title: "Total Activities",
      count: logs.length,
      color: "bg-blue-500",
      icon: "activity",
    },
    {
      title: "Filtered Results",
      count: filteredLogs.length,
      color: "bg-purple-500",
      icon: "filter",
    },
    {
      title: "Action Types",
      count: actions.length,
      color: "bg-emerald-500",
      icon: "chart",
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
      case "activity":
        return (
          <svg {...commonProps}>
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
          </svg>
        );

      case "filter":
        return (
          <svg {...commonProps}>
            <path d="M4 5h16M7 12h10m-7 7h4" />
          </svg>
        );

      case "chart":
        return (
          <svg {...commonProps}>
            <path d="M3 3v18h18" />
            <path d="m7 14 4-4 4 3 5-7" />
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

  const inputClass =
    "w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 hover:border-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

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
              Activity Logs
            </h1>

            <p className="mt-2 text-sm leading-6 text-slate-600 sm:text-base">
              Monitor activities performed across Smart Space.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={exportToCSV}
              disabled={loading || filteredLogs.length === 0}
              className={secondaryButton}
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
              Export CSV
            </button>

            <button
              onClick={fetchLogs}
              disabled={loading}
              className={primaryButton}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
                aria-hidden="true"
              >
                <path d="M20 7v5h-5M4 17v-5h5" />
                <path d="M5.5 9A7 7 0 0 1 18 6l2 6M4 12l2 6a7 7 0 0 0 12.5-3" />
              </svg>
              {loading ? "Refreshing..." : "Refresh Logs"}
            </button>
          </div>
        </div>

        {/* Statistics */}
        <section className="mb-8">
          <div className="mb-4 rounded-xl border border-blue-100 bg-blue-50 px-5 py-4">
            <h2 className="text-lg font-bold text-blue-900">
              Activity Overview
            </h2>
            <p className="mt-1 text-sm text-blue-700">
              A quick summary of recorded platform activity.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
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

        {/* Search and Filters */}
        <section className="mb-6 overflow-hidden rounded-xl border border-violet-100 bg-white shadow-sm">
          <div className="border-b border-violet-100 bg-violet-50 px-5 py-4">
            <h2 className="font-bold text-violet-900">
              Search and Filter
            </h2>
            <p className="mt-1 text-sm text-violet-700">
              Find activity by user, email, action, or details.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-2">
            <div>
              <label
                htmlFor="activity-search"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Search activity
              </label>
              <input
                id="activity-search"
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search user, email, action or details..."
                className={inputClass}
              />
            </div>

            <div>
              <label
                htmlFor="action-filter"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Filter by action
              </label>
              <select
                id="action-filter"
                value={actionFilter}
                onChange={(event) => setActionFilter(event.target.value)}
                className={inputClass}
              >
                <option value="ALL">All Actions</option>
                {actions.map((action) => (
                  <option key={action} value={action}>
                    {action.replaceAll("_", " ")}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* Error State */}
        {error && (
          <div
            role="alert"
            className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700"
          >
            <div>
              <p className="font-semibold">Could not load activity logs</p>
              <p className="mt-1 text-sm">{error}</p>
            </div>

            <button
              onClick={fetchLogs}
              className={primaryButton}
            >
              Try Again
            </button>
          </div>
        )}

        {/* Activity Table */}
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-5 sm:px-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Recorded Activities
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Review user actions and their timestamps.
              </p>
            </div>

            <span className="rounded-lg bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700">
              {filteredLogs.length}{" "}
              {filteredLogs.length === 1 ? "record" : "records"}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="whitespace-nowrap px-5 py-4 sm:px-6">
                    No.
                  </th>
                  <th className="px-5 py-4 sm:px-6">User</th>
                  <th className="px-5 py-4 sm:px-6">Action</th>
                  <th className="px-5 py-4 sm:px-6">Details</th>
                  <th className="whitespace-nowrap px-5 py-4 sm:px-6">
                    Date &amp; Time
                  </th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <div className="mx-auto mb-3 h-7 w-7 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />
                      <p className="text-slate-500">
                        Loading activity logs...
                      </p>
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-12 text-center text-slate-500"
                    >
                      Unable to display activity logs.
                    </td>
                  </tr>
                ) : paginatedLogs.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-12 text-center"
                    >
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                        {renderIcon("activity", "h-6 w-6")}
                      </div>
                      <p className="mt-3 font-semibold text-slate-800">
                        No activity found
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        Try changing your search or filter.
                      </p>
                    </td>
                  </tr>
                ) : (
                  paginatedLogs.map((log, index) => (
                    <tr
                      key={log.log_id ?? `${log.created_at}-${index}`}
                      className="border-t border-slate-100 transition hover:bg-blue-50/40"
                    >
                      <td className="px-5 py-4 text-slate-500 sm:px-6">
                        {startIndex + index + 1}
                      </td>

                      <td className="min-w-48 px-5 py-4 sm:px-6">
                        <p className="font-semibold text-slate-800">
                          {log.user_name || "Deleted user"}
                        </p>
                        {log.user_email && (
                          <p className="mt-1 text-xs text-slate-500">
                            {log.user_email}
                          </p>
                        )}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 sm:px-6">
                        <span className="inline-flex rounded-lg border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
                          {log.action
                            ? log.action.replaceAll("_", " ")
                            : "-"}
                        </span>
                      </td>

                      <td className="min-w-56 max-w-md px-5 py-4 text-slate-600">
                        <p className="whitespace-normal break-words">
                          {log.details || "-"}
                        </p>
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-slate-600 sm:px-6">
                        {log.created_at
                          ? new Date(log.created_at).toLocaleString()
                          : "-"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Pagination */}
        {!loading && !error && (
          <div className="mt-5 flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-600">
              {filteredLogs.length === 0
                ? "Showing 0 results"
                : `Showing ${startIndex + 1}–${Math.min(
                    startIndex + logsPerPage,
                    filteredLogs.length
                  )} of ${filteredLogs.length} results`}
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() =>
                  setCurrentPage((page) => Math.max(1, page - 1))
                }
                disabled={currentPage === 1}
                className={secondaryButton}
              >
                Previous
              </button>

              <span className="whitespace-nowrap rounded-lg bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700">
                Page {currentPage} of {totalPages}
              </span>

              <button
                onClick={() =>
                  setCurrentPage((page) =>
                    Math.min(totalPages, page + 1)
                  )
                }
                disabled={currentPage === totalPages}
                className={primaryButton}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default AdminActivityLogs;