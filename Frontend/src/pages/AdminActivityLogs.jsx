import { useCallback, useEffect, useMemo, useState } from "react";

function AdminActivityLogs() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [actionFilter, setActionFilter] = useState("ALL");
    const [currentPage, setCurrentPage] = useState(1);

    const logsPerPage = 10;
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
    const fetchLogs = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const response = await fetch(
                "http://localhost:5000/api/admin/activity-logs",
                {
                    credentials: "include"
                }
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

    const actions = useMemo(() => {
        return [...new Set(logs.map((log) => log.action).filter(Boolean))].sort();
    }, [logs]);

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

    

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <div className="mx-auto max-w-7xl">
                <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">
                            Admin Activity Logs
                        </h1>
                        <p className="mt-2 text-gray-600">
                            Monitor activities performed in Smart Space.
                        </p>
                    </div>
<div className="flex flex-wrap gap-3">
    <button
        onClick={exportToCSV}
        disabled={loading || filteredLogs.length === 0}
        className="rounded-lg bg-green-600 px-5 py-3 font-medium text-white hover:bg-green-700 disabled:opacity-50"
    >
        Export CSV
    </button>

    <button
        onClick={fetchLogs}
        disabled={loading}
        className="rounded-lg bg-gray-800 px-5 py-3 font-medium text-white hover:bg-gray-700 disabled:opacity-50"
    >
        {loading ? "Refreshing..." : "Refresh Logs"}
    </button>
</div>
                </div>

                <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div className="rounded-lg bg-white p-4 shadow">
                        <p className="text-sm text-gray-500">Total Activities</p>
                        <p className="mt-1 text-2xl font-bold text-gray-800">
                            {logs.length}
                        </p>
                    </div>

                    <div className="rounded-lg bg-white p-4 shadow">
                        <p className="text-sm text-gray-500">Filtered Results</p>
                        <p className="mt-1 text-2xl font-bold text-blue-600">
                            {filteredLogs.length}
                        </p>
                    </div>

                    <div className="rounded-lg bg-white p-4 shadow">
                        <p className="text-sm text-gray-500">Action Types</p>
                        <p className="mt-1 text-2xl font-bold text-purple-600">
                            {actions.length}
                        </p>
                    </div>
                </div>

                <div className="mb-6 grid grid-cols-1 gap-4 rounded-lg bg-white p-4 shadow md:grid-cols-2">
                    <input
                        type="text"
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Search user, email, action or details..."
                        className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
                    />

                    <select
                        value={actionFilter}
                        onChange={(event) => setActionFilter(event.target.value)}
                        className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
                    >
                        <option value="ALL">All Actions</option>

                        {actions.map((action) => (
                            <option key={action} value={action}>
                                {action.replaceAll("_", " ")}
                            </option>
                        ))}
                    </select>
                </div>

                {error && (
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg bg-red-100 p-4 text-red-700">
                        <p>{error}</p>
                        <button
                            onClick={fetchLogs}
                            className="rounded bg-red-700 px-4 py-2 text-white hover:bg-red-800"
                        >
                            Try Again
                        </button>
                    </div>
                )}

                <div className="overflow-x-auto rounded-lg bg-white shadow">
                    <table className="w-full text-left">
                        <thead className="bg-gray-800 text-white">
                            <tr>
                                <th className="p-4">No.</th>
                                <th className="p-4">User</th>
                                <th className="p-4">Action</th>
                                <th className="p-4">Details</th>
                                <th className="p-4">Date &amp; Time</th>
                            </tr>
                        </thead>

                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="p-6 text-center text-gray-500">
                                        Loading activity logs...
                                    </td>
                                </tr>
                            ) : error ? (
                                <tr>
                                    <td colSpan="5" className="p-6 text-center text-gray-500">
                                        Unable to load activity logs.
                                    </td>
                                </tr>
                            ) : paginatedLogs.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="p-6 text-center text-gray-500">
                                        No matching activity logs found.
                                    </td>
                                </tr>
                            ) : (
                                paginatedLogs.map((log, index) => (
                                    <tr
                                        key={log.log_id}
                                        className="border-b hover:bg-gray-50"
                                    >
                                        <td className="p-4">
                                            {startIndex + index + 1}
                                        </td>

                                        <td className="p-4">
                                            <div className="font-medium text-gray-800">
                                                {log.user_name || "Deleted user"}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {log.user_email || ""}
                                            </div>
                                        </td>

                                        <td className="whitespace-nowrap p-4">
                                            {log.action}
                                        </td>

                                        <td className="p-4">
                                            {log.details || "-"}
                                        </td>

                                        <td className="whitespace-nowrap p-4">
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

                {!loading && !error && (
                    <div className="mt-5 flex flex-wrap items-center justify-between gap-4 rounded-lg bg-white p-4 shadow">
                        <p className="text-sm text-gray-600">
                            {filteredLogs.length === 0
                                ? "Showing 0 results"
                                : `Showing ${startIndex + 1}–${Math.min(
                                    startIndex + logsPerPage,
                                    filteredLogs.length
                                )} of ${filteredLogs.length} results`}
                        </p>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setCurrentPage((page) => page - 1)}
                                disabled={currentPage === 1}
                                className="rounded-lg border border-gray-300 px-4 py-2 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                Previous
                            </button>

                            <span className="text-sm font-medium text-gray-700">
                                Page {currentPage} of {totalPages}
                            </span>

                            <button
                                onClick={() => setCurrentPage((page) => page + 1)}
                                disabled={currentPage === totalPages}
                                className="rounded-lg border border-gray-300 px-4 py-2 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default AdminActivityLogs;