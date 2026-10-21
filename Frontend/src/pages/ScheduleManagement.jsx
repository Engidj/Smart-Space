import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function formatDate(value) {
  if (!value) return "";

  if (value instanceof Date) {
    return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(value.getDate()).padStart(2, "0")}`;
  }

  return String(value).slice(0, 10);
}

function ScheduleManagement() {
  const navigate = useNavigate();

  const [spaces, setSpaces] = useState([]);
  const [selectedSpace, setSelectedSpace] = useState("");
  const [schedules, setSchedules] = useState([]);
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [purpose, setPurpose] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [spacesLoading, setSpacesLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const requestOptions = {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  };

  const loadSpaces = useCallback(async () => {
    setSpacesLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/spaces", {
        credentials: "include",
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
      setError(err.message || "Failed to load spaces");
    } finally {
      setSpacesLoading(false);
    }
  }, []);

  const loadSchedules = useCallback(async () => {
    if (!selectedSpace) {
      setSchedules([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
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
      setError(err.message || "Failed to load schedules");
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

    setSaving(true);

    try {
      const isEditing = editingId !== null;

      const url = isEditing
        ? `http://localhost:5000/api/schedules/${editingId}`
        : "http://localhost:5000/api/schedules";

      const payload = isEditing
        ? {
            date,
            start_time: startTime,
            end_time: endTime,
            purpose,
          }
        : {
            space_id: selectedSpace,
            date,
            start_time: startTime,
            end_time: endTime,
            purpose,
          };

      const response = await fetch(url, {
        ...requestOptions,
        method: isEditing ? "PUT" : "POST",
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to save schedule");
      }

      setMessage(
        data.message ||
          (isEditing
            ? "Schedule updated successfully."
            : "Schedule added successfully.")
      );

      resetForm();
      await loadSchedules();
    } catch (err) {
      setError(err.message || "Failed to save schedule");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (schedule) => {
    setEditingId(schedule.schedule_id);
    setDate(formatDate(schedule.date));
    setStartTime(String(schedule.start_time || "").slice(0, 5));
    setEndTime(String(schedule.end_time || "").slice(0, 5));
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
    setDeletingId(scheduleId);

    try {
      const response = await fetch(
        `http://localhost:5000/api/schedules/${scheduleId}`,
        {
          credentials: "include",
          method: "DELETE",
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
      setError(err.message || "Failed to delete schedule");
    } finally {
      setDeletingId(null);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 hover:border-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100";

  const primaryButton =
    "inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60";

  const secondaryButton =
    "inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 disabled:cursor-not-allowed disabled:opacity-60";

  return (
    <div className="min-h-screen w-full bg-slate-100 text-slate-900">
      {/* Navbar */}
      <nav className="sticky top-0 z-20 flex min-h-[64px] w-full items-center justify-between border-b border-slate-800 bg-slate-900 px-5 py-3 text-white shadow-sm md:px-8">
        <button
          onClick={() => navigate("/manager")}
          className="shrink-0 text-xl font-bold tracking-tight transition hover:text-blue-200"
        >
          Smart Space
        </button>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => navigate("/manager")}
            className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-300 transition hover:bg-slate-800 hover:text-white"
          >
            Dashboard
          </button>

          <span className="hidden rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white sm:inline-flex">
            Schedules
          </span>
        </div>
      </nav>

      <main className="mx-auto w-full max-w-7xl px-5 py-8 md:px-8 md:py-10">
        {/* Page heading */}
        <div className="mb-8">
          

          
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Schedule Management
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
            Create and manage time slots for your spaces. Select a space to
            view its schedules or update an existing reservation slot.
          </p>
        </div>

        {/* Feedback messages */}
        {message && (
          <div
            role="status"
            className="mb-5 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="mt-0.5 h-5 w-5 shrink-0"
              aria-hidden="true"
            >
              <path d="m5 12 4 4L19 6" />
              <circle cx="12" cy="12" r="9" />
            </svg>
            <p>{message}</p>
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="mb-5 flex items-start justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            <div className="flex items-start gap-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="mt-0.5 h-5 w-5 shrink-0"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="9" />
                <path d="M12 8v4m0 4h.01" />
              </svg>
              <p>{error}</p>
            </div>

            <button
              onClick={() => setError("")}
              className="rounded px-2 font-semibold hover:bg-red-100"
              aria-label="Dismiss error"
            >
              ✕
            </button>
          </div>
        )}

        {/* Schedule form */}
        <section className="mb-8 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-5 sm:px-7">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="h-6 w-6"
                  aria-hidden="true"
                >
                  <rect x="3" y="5" width="18" height="16" rx="2" />
                  <path d="M16 3v4M8 3v4M3 10h18" />
                </svg>
              </div>

              <div>
                <h2 className="text-lg font-bold text-slate-900 sm:text-xl">
                  {editingId !== null ? "Edit Schedule" : "Add Schedule"}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {editingId !== null
                    ? "Update the selected schedule details."
                    : "Set up a date and time slot for a space."}
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 p-5 sm:p-7">
            <div>
              <label
                htmlFor="space"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Select Space <span className="text-red-500">*</span>
              </label>

              <select
                id="space"
                value={selectedSpace}
                onChange={(event) => {
                  setSelectedSpace(event.target.value);
                  resetForm();
                  setMessage("");
                  setError("");
                }}
                className={inputClass}
                required
                disabled={spacesLoading || saving || editingId !== null}
              >
                <option value="">
                  {spacesLoading ? "Loading spaces..." : "Choose a space"}
                </option>

                {spaces.map((space) => (
                  <option key={space.space_id} value={space.space_id}>
                    {space.name} (ID: {space.space_id})
                  </option>
                ))}
              </select>

              {!spacesLoading && spaces.length === 0 && (
                <p className="mt-2 text-sm text-amber-700">
                  No spaces are available. Add a space before creating a
                  schedule.
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
              <div>
                <label
                  htmlFor="schedule-date"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Date <span className="text-red-500">*</span>
                </label>

                <input
                  id="schedule-date"
                  type="date"
                  value={date}
                  onChange={(event) => setDate(event.target.value)}
                  className={inputClass}
                  required
                  disabled={saving}
                />
              </div>

              <div>
                <label
                  htmlFor="start-time"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Start Time <span className="text-red-500">*</span>
                </label>

                <input
                  id="start-time"
                  type="time"
                  value={startTime}
                  onChange={(event) => setStartTime(event.target.value)}
                  className={inputClass}
                  required
                  disabled={saving}
                />
              </div>

              <div>
                <label
                  htmlFor="end-time"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  End Time <span className="text-red-500">*</span>
                </label>

                <input
                  id="end-time"
                  type="time"
                  value={endTime}
                  onChange={(event) => setEndTime(event.target.value)}
                  className={inputClass}
                  required
                  disabled={saving}
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="purpose"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Purpose
              </label>

              <input
                id="purpose"
                type="text"
                value={purpose}
                onChange={(event) => setPurpose(event.target.value)}
                placeholder="Lecture, meeting, lab session..."
                className={inputClass}
                disabled={saving}
              />

              <p className="mt-2 text-xs text-slate-500">
                Optional: describe the activity planned for this time slot.
              </p>
            </div>

            <div className="flex flex-wrap gap-3 border-t border-slate-100 pt-5">
              <button
                type="submit"
                disabled={!selectedSpace || saving || spacesLoading}
                className={primaryButton}
              >
                {saving ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    Saving...
                  </>
                ) : editingId !== null ? (
                  "Update Schedule"
                ) : (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="h-4 w-4"
                      aria-hidden="true"
                    >
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                    Add Schedule
                  </>
                )}
              </button>

              {editingId !== null && (
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    setMessage("");
                    setError("");
                  }}
                  disabled={saving}
                  className={secondaryButton}
                >
                  Cancel Edit
                </button>
              )}
            </div>
          </form>
        </section>

        {/* Existing schedules */}
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col justify-between gap-4 border-b border-slate-200 px-5 py-5 sm:flex-row sm:items-center sm:px-7">
            <div>
              <h2 className="text-lg font-bold text-slate-900 sm:text-xl">
                Existing Schedules
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {selectedSpace
                  ? "View and manage time slots for the selected space."
                  : "Choose a space to view its schedules."}
              </p>
            </div>

            <div className="flex items-center gap-3">
              {!loading && selectedSpace && (
                <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
                  {schedules.length}{" "}
                  {schedules.length === 1 ? "schedule" : "schedules"}
                </span>
              )}

              <button
                type="button"
                onClick={loadSchedules}
                disabled={loading || !selectedSpace}
                className={secondaryButton}
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600" />
                    Loading
                  </>
                ) : (
                  "Refresh"
                )}
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500 sm:px-6">
                    No.
                  </th>
                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Date
                  </th>
                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Start Time
                  </th>
                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    End Time
                  </th>
                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Purpose
                  </th>
                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-14 text-center">
                      <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />
                      <p className="text-sm font-medium text-slate-700">
                        Loading schedules...
                      </p>
                    </td>
                  </tr>
                ) : schedules.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-14 text-center">
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          className="h-6 w-6"
                          aria-hidden="true"
                        >
                          <rect
                            x="3"
                            y="5"
                            width="18"
                            height="16"
                            rx="2"
                          />
                          <path d="M16 3v4M8 3v4M3 10h18" />
                        </svg>
                      </div>

                      <p className="mt-4 font-semibold text-slate-800">
                        {selectedSpace
                          ? "No schedules found"
                          : "No space selected"}
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        {selectedSpace
                          ? "Create a schedule using the form above."
                          : "Select a space above to view its schedules."}
                      </p>
                    </td>
                  </tr>
                ) : (
                  schedules.map((schedule, index) => (
                    <tr
                      key={schedule.schedule_id}
                      className="transition-colors hover:bg-slate-50"
                    >
                      <td className="px-5 py-4 text-sm font-medium text-slate-500 sm:px-6">
                        {index + 1}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-sm font-medium text-slate-800">
                        {formatDate(schedule.date)}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600">
                        {String(schedule.start_time || "").slice(0, 5) || "-"}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600">
                        {String(schedule.end_time || "").slice(0, 5) || "-"}
                      </td>

                      <td className="max-w-xs px-5 py-4 text-sm text-slate-600">
                        {schedule.purpose || "—"}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleEdit(schedule)}
                            disabled={deletingId !== null || saving}
                            className="rounded-lg border border-blue-200 px-3 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-50 disabled:opacity-50"
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleDelete(schedule.schedule_id)
                            }
                            disabled={deletingId !== null || saving}
                            className="rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                          >
                            {deletingId === schedule.schedule_id
                              ? "Deleting..."
                              : "Delete"}
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
      </main>
    </div>
  );
}

export default ScheduleManagement;