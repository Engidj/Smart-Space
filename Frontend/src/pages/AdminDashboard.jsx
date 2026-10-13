
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
                const endpoints = [
                    "http://localhost:5000/api/admin/users",
                    "http://localhost:5000/api/admin/organizations",
                    "http://localhost:5000/api/admin/spaces",
                    "http://localhost:5000/api/admin/bookings"
                ];

                const responses = await Promise.all(
                    endpoints.map((url) =>
                        fetch(url, {
                            credentials: "include"
                        })
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
                credentials: "include"
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
            color: "bg-blue-500",
            icon: "👥"
        },
        {
            title: "Organizations",
            count: organizations.length,
            color: "bg-purple-500",
            icon: "🏢"
        },
        {
            title: "Total Spaces",
            count: spaces.length,
            color: "bg-green-500",
            icon: "🏫"
        },
        {
            title: "Total Bookings",
            count: bookings.length,
            color: "bg-orange-500",
            icon: "📅"
        }
    ];

    const formatDate = (date) => {
        if (!date) return "-";

        if (typeof date === "string") {
            return date.split("T")[0];
        }

        const parsedDate = new Date(date);

        if (Number.isNaN(parsedDate.getTime())) {
            return String(date);
        }

        return parsedDate.toLocaleDateString();
    };

    return (
        <div className="min-h-screen bg-slate-100">
            <nav className="flex flex-wrap items-center justify-between gap-4 bg-slate-900 px-6 py-4 text-white shadow-lg">
                <h1 className="text-2xl font-bold">
                    Smart Space
                </h1>

                <div className="flex flex-wrap items-center gap-3">
                    <span className="rounded-lg bg-slate-700 px-4 py-2 font-semibold">
                        Admin
                    </span>

                    <button
                        onClick={handleLogout}
                        disabled={loggingOut}
                        className="rounded-lg bg-red-600 px-4 py-2 font-semibold hover:bg-red-700 disabled:opacity-60"
                    >
                        {loggingOut ? "Logging out..." : "Logout"}
                    </button>
                </div>
            </nav>

            <main className="mx-auto max-w-7xl p-6">
                <div className="mb-8">
                    <h2 className="text-3xl font-bold text-slate-800">
                        Admin Dashboard
                    </h2>

                    <p className="mt-2 text-slate-600">
                        Manage users, organizations, spaces and bookings.
                    </p>
                </div>

                {loading && (
                    <div className="rounded-lg bg-white p-6 text-center shadow-sm">
                        Loading dashboard...
                    </div>
                )}

                {error && (
                    <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
                        {error}
                    </div>
                )}

                {!loading && !error && (
                    <>
                        <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                            {stats.map((stat) => (
                                <div
                                    key={stat.title}
                                    className={`${stat.color} rounded-xl p-6 text-white shadow-md`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium opacity-90">
                                                {stat.title}
                                            </p>

                                            <h3 className="mt-2 text-3xl font-bold">
                                                {stat.count}
                                            </h3>
                                        </div>

                                        <span className="text-4xl">
                                            {stat.icon}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <section className="mb-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                            <h3 className="mb-5 text-xl font-bold text-slate-800">
                                Management
                            </h3>

                            <div className="flex flex-wrap gap-4">
                                <button
                                    onClick={() => navigate("/admin/spaces")}
                                    className="rounded-lg bg-blue-600 px-5 py-3 font-medium text-white transition hover:bg-blue-700"
                                >
                                    Manage Spaces
                                </button>

                                <button
                                    onClick={() => navigate("/admin/bookings")}
                                    className="rounded-lg bg-blue-600 px-5 py-3 font-medium text-white transition hover:bg-blue-700"
                                >
                                    Manage Bookings
                                </button>

                                <button
                                    onClick={() => navigate("/admin/users")}
                                    className="rounded-lg bg-blue-600 px-5 py-3 font-medium text-white transition hover:bg-blue-700"
                                >
                                    Manage Users
                                </button>

                                <button
                                    onClick={() => navigate("/admin/organizations")}
                                    className="rounded-lg bg-blue-600 px-5 py-3 font-medium text-white transition hover:bg-blue-700"
                                >
                                    Manage Organizations
                                </button>

                                <button
                                    onClick={() => navigate("/admin/analytics")}
                                    className="rounded-lg bg-blue-600 px-5 py-3 font-medium text-white transition hover:bg-blue-700"
                                >
                                    View Analytics
                                </button>

                                <button
                                    onClick={() => navigate("/admin/activity-logs")}
                                    className="rounded-lg bg-blue-600 px-5 py-3 font-medium text-white transition hover:bg-blue-700"
                                >
                                    View Activity Logs
                                </button>
                            </div>
                        </section>

                        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 p-6">
                                <h3 className="text-xl font-bold text-slate-800">
                                    Recent Bookings
                                </h3>

                                <button
                                    onClick={() => navigate("/admin/bookings")}
                                    className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition hover:bg-blue-700"
                                >
                                    View All
                                </button>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50 text-slate-600">
                                        <tr>
                                            <th className="px-6 py-4">No.</th>
                                            <th className="px-6 py-4">User</th>
                                            <th className="px-6 py-4">Space</th>
                                            <th className="px-6 py-4">Date</th>
                                            <th className="px-6 py-4">Purpose</th>
                                            <th className="px-6 py-4">Status</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {bookings.length === 0 ? (
                                            <tr>
                                                <td
                                                    colSpan="6"
                                                    className="px-6 py-8 text-center text-slate-500"
                                                >
                                                    No bookings found.
                                                </td>
                                            </tr>
                                        ) : (
                                            [...bookings]
                                                .sort((a, b) => {
                                                    const dateA = new Date(
                                                        a.created_at || a.date || 0
                                                    ).getTime();

                                                    const dateB = new Date(
                                                        b.created_at || b.date || 0
                                                    ).getTime();

                                                    return dateB - dateA;
                                                })
                                                .slice(0, 5)
                                                .map((booking, index) => (
                                                    <tr
                                                        key={booking.booking_id || index}
                                                        className="border-t border-slate-200 hover:bg-slate-50"
                                                    >
                                                        <td className="px-6 py-4">
                                                            {index + 1}
                                                        </td>

                                                        <td className="px-6 py-4">
                                                            <div className="font-medium text-slate-800">
                                                                {booking.user_name || "-"}
                                                            </div>

                                                            <div className="text-sm text-slate-500">
                                                                {booking.user_email || ""}
                                                            </div>
                                                        </td>

                                                        <td className="px-6 py-4">
                                                            {booking.space_name || "-"}
                                                        </td>

                                                        <td className="whitespace-nowrap px-6 py-4">
                                                            {formatDate(booking.date)}
                                                        </td>

                                                        <td className="px-6 py-4">
                                                            {booking.purpose || "-"}
                                                        </td>

                                                        <td className="px-6 py-4">
                                                            <span
                                                                className={`inline-block rounded-full px-3 py-1 text-sm font-medium ${
                                                                    String(booking.status || "").toLowerCase() === "approved"
                                                                        ? "bg-green-100 text-green-700"
                                                                        : String(booking.status || "").toLowerCase() === "rejected"
                                                                        ? "bg-red-100 text-red-700"
                                                                        : String(booking.status || "").toLowerCase() === "cancelled"
                                                                        ? "bg-slate-200 text-slate-700"
                                                                        : "bg-yellow-100 text-yellow-700"
                                                                }`}
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
