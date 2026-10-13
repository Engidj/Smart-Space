
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
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        loadBookings();
    }, []);

    const filteredBookings = bookings.filter((booking) => {
        const matchesSearch = [
            booking.user_name,
            booking.user_email,
            booking.space_name,
            booking.purpose
        ].some((value) =>
            String(value || "").toLowerCase().includes(search.toLowerCase())
        );

        const matchesStatus =
            statusFilter === "all" ||
            String(booking.status).toLowerCase() === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const formatDate = (date) => {
        if (!date) return "—";

        if (typeof date === "string") {
            const match = date.match(/^\d{4}-\d{2}-\d{2}/);
            if (match) return match[0];
        }

        return new Date(date).toLocaleDateString("en-CA");
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <nav className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-5 md:px-12">
                <h1 className="text-2xl font-bold text-slate-900">
                    Smart Space
                </h1>

                <button
                    onClick={() => navigate("/admin")}
                    className="rounded-lg bg-slate-800 px-5 py-3 font-semibold text-white hover:bg-slate-700"
                >
                    Back to Dashboard
                </button>
            </nav>

            <main className="mx-auto max-w-7xl px-6 py-10">
                <h2 className="text-3xl font-bold text-slate-900">
                    Booking Management
                </h2>

                <p className="mt-2 text-slate-500">
                    View and filter bookings across the platform.
                </p>

                <div className="my-8 grid grid-cols-1 gap-5 md:grid-cols-3">
                    <div className="rounded-xl border border-slate-200 bg-white p-5">
                        <p className="text-slate-500">Total Bookings</p>
                        <h3 className="mt-2 text-3xl font-bold">
                            {bookings.length}
                        </h3>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white p-5">
                        <p className="text-slate-500">Confirmed</p>
                        <h3 className="mt-2 text-3xl font-bold text-green-600">
                            {bookings.filter(
                                (b) => String(b.status).toLowerCase() === "confirmed"
                            ).length}
                        </h3>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white p-5">
                        <p className="text-slate-500">Cancelled</p>
                        <h3 className="mt-2 text-3xl font-bold text-red-600">
                            {bookings.filter(
                                (b) => String(b.status).toLowerCase() === "cancelled"
                            ).length}
                        </h3>
                    </div>
                </div>

                {error && (
                    <div className="mb-5 rounded-lg bg-red-50 p-4 text-red-700">
                        {error}
                    </div>
                )}

                <div className="mb-6 flex flex-col gap-4 md:flex-row">
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search user, email, space, or purpose"
                        className="flex-1 rounded-lg border border-slate-300 bg-white p-3"
                    />

                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="rounded-lg border border-slate-300 bg-white p-3"
                    >
                        <option value="all">All statuses</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div>

                <p className="mb-4 text-sm text-slate-500">
                    Showing {filteredBookings.length} of {bookings.length} bookings
                </p>

                {loading ? (
                    <div className="rounded-xl bg-white p-8 text-center">
                        Loading bookings...
                    </div>
                ) : (
                    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
                        <table className="w-full text-left">
                            <thead className="bg-slate-100">
                                <tr>
                                    <th className="px-5 py-4">No.</th>
                                    <th className="px-5 py-4">User</th>
                                    <th className="px-5 py-4">Space</th>
                                    <th className="px-5 py-4">Date</th>
                                    <th className="px-5 py-4">Time</th>
                                    <th className="px-5 py-4">Purpose</th>
                                    <th className="px-5 py-4">Status</th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredBookings.map((booking, index) => (
                                    <tr
                                        key={booking.booking_id}
                                        className="border-t border-slate-100 hover:bg-slate-50"
                                    >
                                        <td className="px-5 py-4">{index + 1}</td>

                                        <td className="px-5 py-4">
                                            <p className="font-semibold">
                                                {booking.user_name}
                                            </p>
                                            <p className="text-sm text-slate-500">
                                                {booking.user_email}
                                            </p>
                                        </td>

                                        <td className="px-5 py-4">
                                            {booking.space_name}
                                        </td>

                                        <td className="px-5 py-4">
                                            {formatDate(booking.date)}
                                        </td>

                                        <td className="whitespace-nowrap px-5 py-4">
                                            {booking.start_time} - {booking.end_time}
                                        </td>

                                        <td className="px-5 py-4">
                                            {booking.purpose || "—"}
                                        </td>

                                        <td className="px-5 py-4">
                                            <span
                                                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                                    String(booking.status).toLowerCase() === "confirmed"
                                                        ? "bg-green-100 text-green-700"
                                                        : "bg-red-100 text-red-700"
                                                }`}
                                            >
                                                {booking.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}

                                {filteredBookings.length === 0 && !loading && (
                                    <tr>
                                        <td
                                            colSpan="7"
                                            className="px-5 py-10 text-center text-slate-500"
                                        >
                                            No matching bookings found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </main>
        </div>
    );
}

export default AdminBookings;
