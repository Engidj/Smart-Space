
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

function ManagerDashboard() {
  const navigate = useNavigate();

  const [spaces, setSpaces] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
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
        { credentials: "include" }
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
      alert(error.message);
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

    if (value === "confirmed") {
      return "bg-green-50 text-green-700";
    }

    if (value === "cancelled") {
      return "bg-red-50 text-red-700";
    }

    return "bg-amber-50 text-amber-700";
  };

  return (
    <div className="min-h-screen w-full bg-slate-100 text-slate-900">
      <nav className="flex min-h-[72px] items-center justify-between border-b border-slate-700 bg-slate-900 px-5 py-4 sm:px-8 lg:px-12">
        <button
          onClick={() => navigate("/manager")}
          className="text-xl font-bold text-white sm:text-2xl"
        >
          Smart Space
        </button>

        <div className="flex items-center gap-3 sm:gap-5">
          <span className="text-sm font-semibold text-slate-200 sm:text-base">
            Manager
          </span>

          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="rounded-lg bg-red-600 px-4 py-2.5 font-semibold text-white transition hover:bg-red-700 disabled:opacity-60 sm:px-5"
          >
            {loggingOut ? "Logging out..." : "Logout"}
          </button>
        </div>
      </nav>

      <main className="w-full px-5 py-8 sm:px-8 sm:py-10 lg:px-12">
        <div className="mb-8 flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Manager Dashboard
            </h1>
            <p className="mt-2 text-slate-500">
              Manage your spaces and monitor user bookings.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => navigate("/manager/schedules")}
              className="rounded-lg border border-slate-300 bg-white px-4 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Manage Schedules
            </button>

            <button
              onClick={() => navigate("/manager/facilities")}
              className="rounded-lg border border-slate-300 bg-white px-4 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Manage Facilities
            </button>

            <button
              onClick={() => navigate("/manager/spaces/add")}
              className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
            >
              + Add Space
            </button>
          </div>
        </div>

        <div className="mb-10 grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Total Spaces</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">
              {loading ? "..." : spaces.length}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Total Bookings
            </p>
            <p className="mt-2 text-3xl font-bold text-blue-600">
              {bookingsLoading ? "..." : bookings.length}
            </p>
          </div>
        </div>

        <section className="mb-12">
          <div className="mb-5">
            <h2 className="text-2xl font-bold">Bookings for Your Spaces</h2>
            <p className="mt-1 text-sm text-slate-500">
              See who booked your organization's spaces and when.
            </p>
          </div>

          {bookingsLoading ? (
            <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-slate-500">
              Loading bookings...
            </div>
          ) : bookingError ? (
            <div className="rounded-xl border border-red-200 bg-white p-6">
              <p className="text-red-700">{bookingError}</p>
              <button
                onClick={loadBookings}
                className="mt-4 rounded-lg bg-blue-600 px-5 py-2.5 font-semibold text-white hover:bg-blue-700"
              >
                Retry Bookings
              </button>
            </div>
          ) : bookings.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-white px-5 py-12 text-center">
              <h3 className="text-xl font-bold">No bookings yet</h3>
              <p className="mt-2 text-slate-500">
                User bookings for your organization's spaces will appear here.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="whitespace-nowrap px-5 py-4">User</th>
                    <th className="px-5 py-4">Space</th>
                    <th className="whitespace-nowrap px-5 py-4">Date</th>
                    <th className="whitespace-nowrap px-5 py-4">Time</th>
                    <th className="px-5 py-4">Purpose</th>
                    <th className="px-5 py-4">Status</th>
                  </tr>
                </thead>

                <tbody>
                  {bookings.map((booking) => (
                    <tr
                      key={booking.booking_id}
                      className="border-t border-slate-200 hover:bg-slate-50"
                    >
                      <td className="px-5 py-4">
                        <p className="font-semibold text-slate-800">
                          {booking.user_name || "Unknown user"}
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          {booking.user_email || ""}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <p className="font-semibold text-slate-800">
                          {booking.space_name}
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          {booking.location || ""}
                        </p>
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                        {formatDate(booking.date)}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                        {formatTime(booking.start_time)} –{" "}
                        {formatTime(booking.end_time)}
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        {booking.purpose || "-"}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${statusStyle(
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
          )}
        </section>

        <section>
          <div className="mb-5">
            <h2 className="text-2xl font-bold">Your Spaces</h2>
            <p className="mt-1 text-sm text-slate-500">
              View and manage your organization's spaces.
            </p>
          </div>

          {loading ? (
            <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">
              <p className="text-slate-500">Loading spaces...</p>
            </div>
          ) : error ? (
            <div className="rounded-xl border border-red-200 bg-white p-6">
              <p className="text-red-700">{error}</p>
              <button
                onClick={loadSpaces}
                className="mt-4 rounded-lg bg-blue-600 px-5 py-2.5 font-semibold text-white hover:bg-blue-700"
              >
                Retry
              </button>
            </div>
          ) : spaces.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-white px-5 py-12 text-center">
              <h2 className="text-xl font-bold">No spaces found</h2>
              <p className="mt-2 text-slate-500">
                Add your first space to start managing resources.
              </p>
              <button
                onClick={() => navigate("/manager/spaces/add")}
                className="mt-5 rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
              >
                + Add Your First Space
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              {spaces.map((space) => (
                <div
                  key={space.space_id}
                  className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-xl font-bold">{space.name}</h3>
                      <p className="mt-1 text-sm text-slate-500">
                        {space.type}
                      </p>
                    </div>

                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                      Space
                    </span>
                  </div>

                  <div className="mt-5 space-y-3 border-t border-slate-100 pt-4 text-sm">
                    <p className="flex justify-between gap-3">
                      <span className="text-slate-500">Capacity</span>
                      <span className="font-semibold">{space.capacity}</span>
                    </p>
                    <p className="flex justify-between gap-3">
                      <span className="text-slate-500">Location</span>
                      <span className="text-right font-semibold">
                        {space.location}
                      </span>
                    </p>
                  </div>

                  <div className="mt-6 grid grid-cols-3 gap-2">
                    <button
                      onClick={() =>
                        navigate(`/manager/spaces/edit/${space.space_id}`, {
                          state: { space },
                        })
                      }
                      className="rounded-lg border border-blue-200 py-2.5 text-sm font-semibold text-blue-700 transition hover:bg-blue-50"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() =>
                        navigate(`/manager/spaces/${space.space_id}/facilities`, {
                          state: { space },
                        })
                      }
                      className="rounded-lg border border-slate-200 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      Facilities
                    </button>

                    <button
                      onClick={() => deleteSpace(space.space_id)}
                      className="rounded-lg border border-red-200 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default ManagerDashboard;
