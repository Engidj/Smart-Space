
import { useCallback, useEffect, useState } from "react";

function formatDate(value) {
    if (!value) return "";
    if (value instanceof Date) {
        return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-${String(value.getDate()).padStart(2, "0")}`;
    }
    return String(value).slice(0, 10);
}

function ScheduleManagement() {
    const [spaces, setSpaces] = useState([]);
    const [selectedSpace, setSelectedSpace] = useState("");
    const [schedules, setSchedules] = useState([]);
    const [date, setDate] = useState("");
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [purpose, setPurpose] = useState("");
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const requestOptions = {
        credentials: "include",
        headers: {
            "Content-Type": "application/json"
        }
    };

    const loadSpaces = useCallback(async () => {
        try {
            const response = await fetch("http://localhost:5000/api/spaces", {
                credentials: "include"
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to load spaces");
            }

            const list = data.spaces || [];
            setSpaces(list);

            setSelectedSpace((current) => {
                if (list.some((space) => String(space.space_id) === current)) {
                    return current;
                }
                return list.length ? String(list[0].space_id) : "";
            });
        } catch (err) {
            setError(err.message);
        }
    }, []);

    const loadSchedules = useCallback(async () => {
        if (!selectedSpace) {
            setSchedules([]);
            return;
        }

        try {
            setLoading(true);

            const response = await fetch(
                `http://localhost:5000/api/schedules/space/${selectedSpace}`,
                { credentials: "include" }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to load schedules");
            }

            setSchedules(data.schedules || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [selectedSpace]);

    useEffect(() => {
        loadSpaces();
    }, [loadSpaces]);

    useEffect(() => {
        loadSchedules();
    }, [loadSchedules]);

    const resetForm = () => {
        setDate("");
        setStartTime("");
        setEndTime("");
        setPurpose("");
        setEditingId(null);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError("");
        setMessage("");

        if (!selectedSpace || !date || !startTime || !endTime) {
            setError("Please fill in the space, date and both times.");
            return;
        }

        if (startTime >= endTime) {
            setError("Start time must be before end time.");
            return;
        }

        try {
            const isEditing = editingId !== null;
            const url = isEditing
                ? `http://localhost:5000/api/schedules/${editingId}`
                : "http://localhost:5000/api/schedules";

            const payload = isEditing
                ? { date, start_time: startTime, end_time: endTime, purpose }
                : {
                    space_id: selectedSpace,
                    date,
                    start_time: startTime,
                    end_time: endTime,
                    purpose
                };

            const response = await fetch(url, {
                ...requestOptions,
                method: isEditing ? "PUT" : "POST",
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to save schedule");
            }

            setMessage(data.message || "Schedule saved successfully.");
            resetForm();
            await loadSchedules();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleEdit = (schedule) => {
        setEditingId(schedule.schedule_id);
        setDate(formatDate(schedule.date));
        setStartTime(String(schedule.start_time).slice(0, 5));
        setEndTime(String(schedule.end_time).slice(0, 5));
        setPurpose(schedule.purpose || "");
        setMessage("");
        setError("");
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleDelete = async (scheduleId) => {
        if (!window.confirm("Are you sure you want to delete this schedule?")) {
            return;
        }

        setError("");
        setMessage("");

        try {
            const response = await fetch(
                `http://localhost:5000/api/schedules/${scheduleId}`,
                {
                    credentials: "include",
                    method: "DELETE"
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to delete schedule");
            }

            if (editingId === scheduleId) {
                resetForm();
            }

            setMessage(data.message || "Schedule deleted successfully.");
            await loadSchedules();
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <div className="mx-auto max-w-7xl">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-800">
                        Schedule Management
                    </h1>
                    <p className="mt-2 text-gray-600">
                        Create, view, update and delete space schedules.
                    </p>
                </div>

                {message && (
                    <div className="mb-4 rounded-lg bg-green-100 p-4 text-green-800">
                        {message}
                    </div>
                )}

                {error && (
                    <div className="mb-4 rounded-lg bg-red-100 p-4 text-red-700">
                        {error}
                    </div>
                )}

                <section className="mb-6 rounded-xl bg-white p-6 shadow">
                    <h2 className="mb-4 text-xl font-bold text-gray-800">
                        {editingId !== null ? "Edit Schedule" : "Add Schedule"}
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="mb-2 block font-medium text-gray-700">
                                Select Space
                            </label>
                            <select
                                value={selectedSpace}
                                onChange={(event) => {
                                    setSelectedSpace(event.target.value);
                                    resetForm();
                                }}
                                className="w-full rounded-lg border border-gray-300 px-4 py-3"
                                required
                            >
                                <option value="">Choose a space</option>
                                {spaces.map((space) => (
                                    <option key={space.space_id} value={space.space_id}>
                                        {space.name} (ID: {space.space_id})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                            <div>
                                <label className="mb-2 block font-medium text-gray-700">
                                    Date
                                </label>
                                <input
                                    type="date"
                                    value={date}
                                    onChange={(event) => setDate(event.target.value)}
                                    className="w-full rounded-lg border border-gray-300 px-4 py-3"
                                    required
                                />
                            </div>

                            <div>
                                <label className="mb-2 block font-medium text-gray-700">
                                    Start Time
                                </label>
                                <input
                                    type="time"
                                    value={startTime}
                                    onChange={(event) => setStartTime(event.target.value)}
                                    className="w-full rounded-lg border border-gray-300 px-4 py-3"
                                    required
                                />
                            </div>

                            <div>
                                <label className="mb-2 block font-medium text-gray-700">
                                    End Time
                                </label>
                                <input
                                    type="time"
                                    value={endTime}
                                    onChange={(event) => setEndTime(event.target.value)}
                                    className="w-full rounded-lg border border-gray-300 px-4 py-3"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="mb-2 block font-medium text-gray-700">
                                Purpose
                            </label>
                            <input
                                type="text"
                                value={purpose}
                                onChange={(event) => setPurpose(event.target.value)}
                                placeholder="Lecture, meeting, lab session..."
                                className="w-full rounded-lg border border-gray-300 px-4 py-3"
                            />
                        </div>

                        <div className="flex flex-wrap gap-3">
                            <button
                                type="submit"
                                disabled={!selectedSpace}
                                className="rounded-lg bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                            >
                                {editingId !== null ? "Update Schedule" : "Add Schedule"}
                            </button>

                            {editingId !== null && (
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="rounded-lg bg-gray-200 px-5 py-3 font-medium text-gray-800 hover:bg-gray-300"
                                >
                                    Cancel Edit
                                </button>
                            )}
                        </div>
                    </form>
                </section>

                <section className="overflow-hidden rounded-xl bg-white shadow">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b p-6">
                        <h2 className="text-xl font-bold text-gray-800">
                            Existing Schedules
                        </h2>
                        <button
                            type="button"
                            onClick={loadSchedules}
                            disabled={loading || !selectedSpace}
                            className="rounded-lg bg-gray-800 px-4 py-2 text-white hover:bg-gray-700 disabled:opacity-50"
                        >
                            Refresh
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-800 text-white">
                                <tr>
                                    <th className="p-4">No.</th>
                                    <th className="p-4">Date</th>
                                    <th className="p-4">Start</th>
                                    <th className="p-4">End</th>
                                    <th className="p-4">Purpose</th>
                                    <th className="p-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="6" className="p-6 text-center">
                                            Loading schedules...
                                        </td>
                                    </tr>
                                ) : schedules.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="p-6 text-center text-gray-500">
                                            {selectedSpace
                                                ? "No schedules found for this space."
                                                : "Select a space to view its schedules."}
                                        </td>
                                    </tr>
                                ) : (
                                    schedules.map((schedule, index) => (
                                        <tr
                                            key={schedule.schedule_id}
                                            className="border-b hover:bg-gray-50"
                                        >
                                            <td className="p-4">{index + 1}</td>
                                            <td className="whitespace-nowrap p-4">
                                                {formatDate(schedule.date)}
                                            </td>
                                            <td className="whitespace-nowrap p-4">
                                                {String(schedule.start_time).slice(0, 5)}
                                            </td>
                                            <td className="whitespace-nowrap p-4">
                                                {String(schedule.end_time).slice(0, 5)}
                                            </td>
                                            <td className="p-4">{schedule.purpose || "-"}</td>
                                            <td className="p-4">
                                                <div className="flex gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleEdit(schedule)}
                                                        className="rounded bg-amber-500 px-3 py-2 text-white hover:bg-amber-600"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDelete(schedule.schedule_id)}
                                                        className="rounded bg-red-600 px-3 py-2 text-white hover:bg-red-700"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>
        </div>
    );
}

export default ScheduleManagement;
