
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function AdminAnalytics() {
    const navigate = useNavigate();

    const [summary, setSummary] = useState({
        total_bookings: 0,
        confirmed_bookings: 0,
        cancelled_bookings: 0
    });

    const [popularSpaces, setPopularSpaces] = useState([]);
    const [monthlyBookings, setMonthlyBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadAnalytics = async () => {
            try {
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
            } catch (error) {
                setError(error.message);
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
                item.booking_count
            ])
        ];

        const csv = rows
            .map((row) =>
                row
                    .map((value) =>
                        `"${String(value ?? "").replace(/"/g, '""')}"`
                    )
                    .join(",")
            )
            .join("\r\n");

        const blob = new Blob(["\uFEFF" + csv], {
            type: "text/csv;charset=utf-8;"
        });

        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = url;
        link.download = "smart-space-analytics.csv";
        link.click();

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

    return (
        <div className="min-h-screen bg-slate-100">
            <nav className="flex flex-wrap items-center justify-between gap-4 bg-slate-900 px-6 py-4 text-white shadow-lg md:px-12">
                <h1 className="text-2xl font-bold">
                    Smart Space
                </h1>

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
                            Reports & Analytics
                        </h2>

                        <p className="mt-2 text-slate-600">
                            Understand bookings and space usage across the platform.
                        </p>
                    </div>

                    <button
                        onClick={exportCSV}
                        disabled={monthlyBookings.length === 0}
                        className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Export Monthly CSV
                    </button>
                </div>

                {error && (
                    <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
                        {error}
                    </div>
                )}

                {loading ? (
                    <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-slate-600 shadow-sm">
                        Loading analytics...
                    </div>
                ) : (
                    <>
                        <div className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-3">
                            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                                <p className="text-slate-500">Total Bookings</p>
                                <h3 className="mt-2 text-3xl font-bold text-slate-800">
                                    {Number(summary.total_bookings || 0)}
                                </h3>
                            </div>

                            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                                <p className="text-slate-500">Confirmed Bookings</p>
                                <h3 className="mt-2 text-3xl font-bold text-green-600">
                                    {Number(summary.confirmed_bookings || 0)}
                                </h3>
                            </div>

                            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                                <p className="text-slate-500">Cancelled Bookings</p>
                                <h3 className="mt-2 text-3xl font-bold text-red-600">
                                    {Number(summary.cancelled_bookings || 0)}
                                </h3>
                            </div>
                        </div>

                        <div className="mb-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
                            <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                                <h3 className="mb-6 text-xl font-bold text-slate-800">
                                    Monthly Booking Trends
                                </h3>

                                {monthlyBookings.length === 0 ? (
                                    <p className="text-slate-500">
                                        No monthly booking data available.
                                    </p>
                                ) : (
                                    <div className="space-y-5">
                                        {monthlyBookings.map((item) => (
                                            <div key={item.month}>
                                                <div className="mb-2 flex justify-between gap-4 text-sm">
                                                    <span className="font-medium text-slate-700">
                                                        {item.month}
                                                    </span>
                                                    <span className="font-semibold text-slate-800">
                                                        {item.booking_count}
                                                    </span>
                                                </div>

                                                <div className="h-4 overflow-hidden rounded-full bg-slate-100">
                                                    <div
                                                        className="h-full rounded-full bg-blue-600 transition-all"
                                                        style={{
                                                            width: `${Math.max(
                                                                0,
                                                                (Number(item.booking_count) /
                                                                    maxMonthlyBookings) * 100
                                                            )}%`
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </section>

                            <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                                <h3 className="mb-6 text-xl font-bold text-slate-800">
                                    Most-Booked Spaces
                                </h3>

                                {popularSpaces.length === 0 ? (
                                    <p className="text-slate-500">
                                        No spaces available.
                                    </p>
                                ) : (
                                    <div className="space-y-5">
                                        {popularSpaces.map((space) => (
                                            <div key={space.space_id}>
                                                <div className="mb-2 flex justify-between gap-4 text-sm">
                                                    <span className="font-medium text-slate-700">
                                                        {space.space_name}
                                                    </span>
                                                    <span className="font-semibold text-slate-800">
                                                        {space.booking_count}
                                                    </span>
                                                </div>

                                                <div className="h-4 overflow-hidden rounded-full bg-slate-100">
                                                    <div
                                                        className="h-full rounded-full bg-blue-600 transition-all"
                                                        style={{
                                                            width: `${Math.max(
                                                                0,
                                                                (Number(space.booking_count) /
                                                                    maxSpaceBookings) * 100
                                                            )}%`
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </section>
                        </div>

                        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                            <div className="border-b border-slate-200 p-6">
                                <h3 className="text-xl font-bold text-slate-800">
                                    Monthly Report
                                </h3>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50 text-slate-600">
                                        <tr>
                                            <th className="px-6 py-4">No.</th>
                                            <th className="px-6 py-4">Month</th>
                                            <th className="px-6 py-4">Bookings</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {monthlyBookings.map((item, index) => (
                                            <tr
                                                key={item.month}
                                                className="border-t border-slate-200 hover:bg-slate-50"
                                            >
                                                <td className="px-6 py-4">
                                                    {index + 1}
                                                </td>
                                                <td className="px-6 py-4 text-slate-700">
                                                    {item.month}
                                                </td>
                                                <td className="px-6 py-4 font-semibold text-slate-800">
                                                    {item.booking_count}
                                                </td>
                                            </tr>
                                        ))}

                                        {monthlyBookings.length === 0 && (
                                            <tr>
                                                <td
                                                    colSpan="3"
                                                    className="px-6 py-8 text-center text-slate-500"
                                                >
                                                    No report data available.
                                                </td>
                                            </tr>
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
