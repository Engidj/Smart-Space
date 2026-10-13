
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
                throw new Error(
                    data.message || "Failed to load activity logs"
                );
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
                log.details
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
            "Date & Time"
        ];

        const rows = filteredLogs.map((log) => [
            log.log_id,
            log.user_name || "Deleted user",
            log.user_email || "",
            log.action || "",
            log.details || "",
            log.created_at
                ? new Date(log.created_at).toLocaleString()
                : ""
        ]);

        const escapeCSV = (value) =>
            `"${String(value ?? "").replace(/"/g, '""')}"`;

        const csvContent = [
            headers.map(escapeCSV).join(","),
            ...rows.map((row) => row.map(escapeCSV).join(","))
        ].join("\r\n");

        const blob = new Blob(["\uFEFF" + csvContent], {
            type: "text/csv;charset=utf-8;"
        });

        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = url;
        link.download = "activity_logs.csv";
        link.click();

        URL.revokeObjectURL(url);
    };

    return (
        <div className="min-h-screen bg-slate-100">
            <nav className="flex flex-wrap items-center justify-between gap-4 bg-slate-900 px-6 py-4 text-white shadow-lg md:px-12">
                <h1 className="text-2xl font-bold">Smart Space</h1>

                <button
                    onClick={() => navigate("/admin")}
                    className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
                >
                    Back to Dashboard
                </button>
            </nav>

            <main className="mx-auto max-w-7xl px-6 py-10">
                <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h2 className="text-3xl font-bold text-slate-800">
                            Admin Activity Logs
                        </h2>
                        <p className="mt-2 text-slate-600">
                            Monitor activities performed in Smart Space.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <button
                            onClick={exportToCSV}
                            disabled={loading || filteredLogs.length === 0}
                            className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Export CSV
                        </button>

                        <button
                            onClick={fetchLogs}
                            disabled={loading}
                            className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {loading ? "Refreshing..." : "Refresh Logs"}
                        </button>
                    </div>
                </div>

                <div className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-3">
                    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                        <p className="text-sm text-slate-500">
                            Total Activities
                        </p>
                        <p className="mt-2 text-3xl font-bold text-slate-800">
                            {logs.length}
                        </p>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                        <p className="text-sm text-slate-500">
                            Filtered Results
                        </p>
                        <p className="mt-2 text-3xl font-bold text-blue-600">
                            {filteredLogs.length}
                        </p>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                        <p className="text-sm text-slate-500">Action Types</p>
                        <p className="mt-2 text-3xl font-bold text-indigo-600">
                            {actions.length}
                        </p>
                    </div>
                </div>

                <section className="mb-6 grid grid-cols-1 gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:grid-cols-2">
                    <input
                        type="text"
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Search user, email, action or details..."
                        className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />

                    <select
                        value={actionFilter}
                        onChange={(event) => setActionFilter(event.target.value)}
                        className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    >
                        <option value="ALL">All Actions</option>

                        {actions.map((action) => (
                            <option key={action} value={action}>
                                {action.replaceAll("_", " ")}
                            </option>
                        ))}
                    </select>
                </section>

                {error && (
                    <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
                        <p>{error}</p>
                        <button
                            onClick={fetchLogs}
                            className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white transition hover:bg-blue-700"
                        >
                            Try Again
                        </button>
                    </div>
                )}

                <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 text-slate-600">
                                <tr>
                                    <th className="whitespace-nowrap px-6 py-4">
                                        No.
                                    </th>
                                    <th className="px-6 py-4">User</th>
                                    <th className="px-6 py-4">Action</th>
                                    <th className="px-6 py-4">Details</th>
                                    <th className="whitespace-nowrap px-6 py-4">
                                        Date &amp; Time
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td
                                            colSpan="5"
                                            className="px-6 py-10 text-center text-slate-500"
                                        >
                                            Loading activity logs...
                                        </td>
                                    </tr>
                                ) : error ? (
                                    <tr>
                                        <td
                                            colSpan="5"
                                            className="px-6 py-10 text-center text-slate-500"
                                        >
                                            Unable to load activity logs.
                                        </td>
                                    </tr>
                                ) : paginatedLogs.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan="5"
                                            className="px-6 py-10 text-center text-slate-500"
                                        >
                                            No matching activity logs found.
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedLogs.map((log, index) => (
                                        <tr
                                            key={log.log_id}
                                            className="border-t border-slate-200 transition hover:bg-slate-50"
                                        >
                                            <td className="px-6 py-4 text-slate-600">
                                                {startIndex + index + 1}
                                            </td>

                                            <td className="px-6 py-4">
                                                <div className="font-semibold text-slate-800">
                                                    {log.user_name || "Deleted user"}
                                                </div>
                                                <div className="mt-1 text-sm text-slate-500">
                                                    {log.user_email || ""}
                                                </div>
                                            </td>

                                            <td className="whitespace-nowrap px-6 py-4">
                                                <span className="inline-block rounded-md bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
                                                    {log.action || "-"}
                                                </span>
                                            </td>

                                            <td className="min-w-48 px-6 py-4 text-slate-600">
                                                {log.details || "-"}
                                            </td>

                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">
                                                {log.created_at
                                                    ? new Date(
                                                          log.created_at
                                                      ).toLocaleString()
                                                    : "-"}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>

                {!loading && !error && (
                    <div className="mt-5 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                        <p className="text-sm text-slate-600">
                            {filteredLogs.length === 0
                                ? "Showing 0 results"
                                : `Showing ${startIndex + 1}–${Math.min(
                                      startIndex + logsPerPage,
                                      filteredLogs.length
                                  )} of ${filteredLogs.length} results`}
                        </p>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={() =>
                                    setCurrentPage((page) => page - 1)
                                }
                                disabled={currentPage === 1}
                                className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                Previous
                            </button>

                            <span className="whitespace-nowrap text-sm font-medium text-slate-700">
                                Page {currentPage} of {totalPages}
                            </span>

                            <button
                                onClick={() =>
                                    setCurrentPage((page) => page + 1)
                                }
                                disabled={currentPage === totalPages}
                                className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
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
