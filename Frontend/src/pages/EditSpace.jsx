import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useState } from "react";

function EditSpace() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();

  const space = location.state?.space;

  const [form, setForm] = useState({
    organization_id: space?.organization_id || 1,
    name: space?.name || "",
    type: space?.type || "",
    capacity: space?.capacity || "",
    location: space?.location || "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  if (!space) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 px-5 text-slate-900">
        <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <h2 className="text-xl font-bold text-slate-900">
            Space not found
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Please return to the Manager Dashboard and select a space to edit.
          </p>

          <button
            onClick={() => navigate("/manager")}
            className="mt-6 rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Back to Manager
          </button>
        </div>
      </div>
    );
  }

  const handleChange = (event) => {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });

    setError("");
    setSuccess("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (
      !form.name.trim() ||
      !form.type ||
      !form.capacity ||
      !form.location.trim()
    ) {
      setError("Please complete all required fields.");
      return;
    }

    if (
      Number(form.capacity) < 1 ||
      !Number.isInteger(Number(form.capacity))
    ) {
      setError("Capacity must be a whole number greater than zero.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `http://localhost:5000/api/spaces/${id}`,
        {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            organization_id: Number(form.organization_id),
            name: form.name.trim(),
            type: form.type,
            capacity: Number(form.capacity),
            location: form.location.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update space");
      }

      setSuccess("Space updated successfully.");

      setTimeout(() => {
        navigate("/manager");
      }, 1000);
    } catch (error) {
      setError(error.message || "Failed to update space");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 hover:border-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100";

  const primaryButton =
    "inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60";

  const secondaryButton =
    "inline-flex flex-1 items-center justify-center rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60";

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

        <button
          onClick={() => navigate("/manager")}
          className="rounded-lg border border-slate-700 bg-blue-700 px-3 py-2 text-sm font-semibold text-white transition  focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 sm:px-4"
        >
          <span className="hidden sm:inline">Manager Dashboard</span>
          <span className="sm:hidden">Dashboard</span>
        </button>
      </nav>

      <main className="w-full px-5 py-8 md:px-8 md:py-10 lg:px-12">
        {/* Page heading */}
        <div className="mb-7">
          

          

          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Edit Space
          </h1>

        </div>

        {/* Form card */}
        <section className="w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center gap-3 border-b border-slate-200 px-5 py-5 sm:px-8">
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
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L8 18l-4 1 1-4Z" />
              </svg>
            </div>

            <div>
              <h2 className="text-lg font-bold text-slate-900 sm:text-xl">
                Space Details
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Fields marked with * are required.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 p-5 sm:p-8">
            {error && (
              <div
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
              >
                {error}
              </div>
            )}

            {success && (
              <div
                role="status"
                className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"
              >
                {success} Redirecting to the dashboard...
              </div>
            )}

            <div>
              <label
                htmlFor="space-name"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Space Name <span className="text-red-500">*</span>
              </label>

              <input
                id="space-name"
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                maxLength={100}
                placeholder="e.g. Computer Lab 101"
                required
                disabled={loading || Boolean(success)}
                className={inputClass}
              />
            </div>

            <div>
              <label
                htmlFor="space-type"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Space Type <span className="text-red-500">*</span>
              </label>

              <select
                id="space-type"
                name="type"
                value={form.type}
                onChange={handleChange}
                required
                disabled={loading || Boolean(success)}
                className={inputClass}
              >
                <option value="">Select a space type</option>
                <option value="Classroom">Classroom</option>
                <option value="Laboratory">Laboratory</option>
                <option value="Seminar Hall">Seminar Hall</option>
                <option value="Conference Room">Conference Room</option>
                <option value="Meeting Room">Meeting Room</option>
                <option value="Auditorium">Auditorium</option>
              </select>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="space-capacity"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Capacity <span className="text-red-500">*</span>
                </label>

                <input
                  id="space-capacity"
                  type="number"
                  name="capacity"
                  value={form.capacity}
                  onChange={handleChange}
                  min="1"
                  step="1"
                  placeholder="e.g. 60"
                  required
                  disabled={loading || Boolean(success)}
                  className={inputClass}
                />

                <p className="mt-2 text-xs text-slate-500">
                  Maximum number of people the space can accommodate.
                </p>
              </div>

              <div>
                <label
                  htmlFor="space-location"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Location <span className="text-red-500">*</span>
                </label>

                <input
                  id="space-location"
                  type="text"
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  maxLength={150}
                  placeholder="e.g. Building A, Floor 2"
                  required
                  disabled={loading || Boolean(success)}
                  className={inputClass}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row">
              <button
                type="button"
                onClick={() => navigate("/manager")}
                disabled={loading}
                className={secondaryButton}
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading || Boolean(success)}
                className={primaryButton}
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    Updating Space...
                  </>
                ) : success ? (
                  "Updated Successfully"
                ) : (
                  "Update Space"
                )}
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}

export default EditSpace;