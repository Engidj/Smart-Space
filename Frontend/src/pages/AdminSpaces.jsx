import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API = "http://localhost:5000/api";

function AdminSpaces() {
  const navigate = useNavigate();

  const [spaces, setSpaces] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [editingId, setEditingId] = useState(null);

  const emptyForm = {
    organization_id: "",
    name: "",
    type: "",
    capacity: "",
    location: "",
  };

  const [form, setForm] = useState(emptyForm);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [spacesResponse, organizationsResponse] = await Promise.all([
        fetch(`${API}/admin/spaces`, {
          credentials: "include",
        }),
        fetch(`${API}/admin/organizations`, {
          credentials: "include",
        }),
      ]);

      const spacesData = await spacesResponse.json();
      const organizationsData = await organizationsResponse.json();

      if (!spacesResponse.ok || !organizationsResponse.ok) {
        throw new Error(
          spacesData.message ||
            organizationsData.message ||
            "Failed to load spaces or organizations"
        );
      }

      setSpaces(spacesData.spaces || []);
      setOrganizations(organizationsData.organizations || []);
    } catch (err) {
      setError(err.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleChange = (e) => {
    setForm((previous) => ({
      ...previous,
      [e.target.name]: e.target.value,
    }));

    setError("");
    setMessage("");
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    const cleanedForm = {
      ...form,
      organization_id: Number(form.organization_id),
      name: form.name.trim(),
      type: form.type.trim(),
      capacity: Number(form.capacity),
      location: form.location.trim(),
    };

    if (
      !cleanedForm.organization_id ||
      !cleanedForm.name ||
      !cleanedForm.type ||
      !cleanedForm.location ||
      !form.capacity
    ) {
      setError("Please complete all required fields.");
      return;
    }

    if (
      !Number.isInteger(cleanedForm.capacity) ||
      cleanedForm.capacity < 1
    ) {
      setError("Capacity must be a whole number greater than zero.");
      return;
    }

    try {
      setSaving(true);

      const url = editingId
        ? `${API}/spaces/${editingId}`
        : `${API}/spaces`;

      const response = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(cleanedForm),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to save space");
      }

      setMessage(
        data.message ||
          (editingId
            ? "Space updated successfully."
            : "Space created successfully.")
      );

      resetForm();
      await loadData();
    } catch (err) {
      setError(err.message || "Failed to save space");
    } finally {
      setSaving(false);
    }
  };

  const startEditing = (space) => {
    setEditingId(space.space_id);

    setForm({
      organization_id: String(space.organization_id ?? ""),
      name: space.name || "",
      type: space.type || "",
      capacity: String(space.capacity ?? ""),
      location: space.location || "",
    });

    setError("");
    setMessage("");

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteSpace = async (space) => {
    if (!window.confirm(`Are you sure you want to delete "${space.name}"?`)) {
      return;
    }

    setError("");
    setMessage("");
    setDeletingId(space.space_id);

    try {
      const response = await fetch(`${API}/spaces/${space.space_id}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete space");
      }

      setMessage(data.message || "Space deleted successfully.");

      if (editingId === space.space_id) {
        resetForm();
      }

      await loadData();
    } catch (err) {
      setError(err.message || "Failed to delete space");
    } finally {
      setDeletingId(null);
    }
  };

  const filteredSpaces = spaces.filter((space) =>
    [
      space.name,
      space.type,
      space.location,
      space.organization_name,
    ].some((value) =>
      String(value || "").toLowerCase().includes(search.trim().toLowerCase())
    )
  );

  const inputClass =
    "w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 hover:border-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50";

  const primaryButton =
    "inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60";

  const secondaryButton =
    "inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 disabled:cursor-not-allowed disabled:opacity-60";

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
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Space Management
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-600 sm:text-base">
            Create, view, edit, and manage spaces across organizations.
          </p>
        </div>

        {/* Notifications */}
        {message && (
          <div
            role="status"
            className="mb-5 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"
          >
            <span className="font-bold">✓</span>
            <p>{message}</p>
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="mb-5 flex flex-col justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 sm:flex-row sm:items-center"
          >
            <p>{error}</p>

            <button
              onClick={() => {
                setError("");
                loadData();
              }}
              disabled={loading}
              className="self-start rounded-lg bg-white px-4 py-2 font-semibold text-red-700 transition hover:bg-red-100 disabled:opacity-50 sm:self-auto"
            >
              Retry
            </button>
          </div>
        )}

        {/* Add / Edit Space */}
        <section className="mb-9 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-5 sm:px-6">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="h-5 w-5"
                  aria-hidden="true"
                >
                  <rect x="3" y="3" width="7" height="7" rx="1.5" />
                  <rect x="14" y="3" width="7" height="7" rx="1.5" />
                  <rect x="3" y="14" width="7" height="7" rx="1.5" />
                  <path d="M17.5 14v7m-3.5-3.5h7" />
                </svg>
              </div>

              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {editingId ? "Edit Space" : "Add Space"}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {editingId
                    ? "Update the selected space details."
                    : "Enter the details to create a new space."}
                </p>
              </div>
            </div>

            {editingId && (
              <span className="rounded-lg bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700">
                Editing
              </span>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 p-5 sm:p-6">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              <div>
                <label
                  htmlFor="space-organization"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Organization <span className="text-red-500">*</span>
                </label>

                <select
                  id="space-organization"
                  name="organization_id"
                  value={form.organization_id}
                  onChange={handleChange}
                  required
                  disabled={saving || organizations.length === 0}
                  className={inputClass}
                >
                  <option value="">Select organization</option>

                  {organizations.map((organization) => (
                    <option
                      key={organization.organization_id}
                      value={organization.organization_id}
                    >
                      {organization.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="space-name"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Space Name <span className="text-red-500">*</span>
                </label>

                <input
                  id="space-name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  maxLength={100}
                  required
                  disabled={saving}
                  placeholder="e.g. Seminar Hall 1"
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

                <input
                  id="space-type"
                  name="type"
                  value={form.type}
                  onChange={handleChange}
                  maxLength={100}
                  required
                  disabled={saving}
                  placeholder="e.g. Meeting Room"
                  className={inputClass}
                />
              </div>

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
                  required
                  disabled={saving}
                  placeholder="Number of people"
                  className={inputClass}
                />
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
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  maxLength={150}
                  required
                  disabled={saving}
                  placeholder="e.g. Building B, Floor 2"
                  className={inputClass}
                />
              </div>
            </div>

            {organizations.length === 0 && !loading && (
              <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                Create an organization before adding a space.
              </p>
            )}

            <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  disabled={saving}
                  className={secondaryButton}
                >
                  Cancel Edit
                </button>
              )}

              <button
                type="submit"
                disabled={saving || organizations.length === 0}
                className={primaryButton}
              >
                {saving ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    Saving...
                  </>
                ) : editingId ? (
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
                      <path d="m5 12 4 4L19 6" />
                    </svg>
                    Update Space
                  </>
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
                    Create Space
                  </>
                )}
              </button>
            </div>
          </form>
        </section>

        {/* All Spaces */}
        <section>
          <div className="mb-4 rounded-xl border border-violet-100 bg-violet-50 px-5 py-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-violet-900">
                  All Spaces
                </h2>

                <p className="mt-1 text-sm text-violet-700">
                  View and manage spaces registered across organizations.
                </p>
              </div>

              <span className="rounded-lg bg-white px-3 py-2 text-sm font-semibold text-violet-800 shadow-sm">
                {filteredSpaces.length} of {spaces.length} spaces
              </span>
            </div>
          </div>

          {/* Search and Refresh */}
          <div className="mb-5 flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-4-4" />
              </svg>

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, type, location, or organization..."
                aria-label="Search spaces"
                className={`${inputClass} pl-11`}
              />
            </div>

            <button
              type="button"
              onClick={loadData}
              disabled={loading}
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
                <path d="M20 7v5h-5M4 17v-5h5" />
                <path d="M5.6 9A7 7 0 0 1 18 6l2 6M4 12l2 6a7 7 0 0 0 12.4-3" />
              </svg>
              {loading ? "Refreshing..." : "Refresh"}
            </button>
          </div>

          {loading ? (
            <div className="rounded-xl border border-slate-200 bg-white p-10 text-center shadow-sm">
              <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />
              <p className="text-sm font-medium text-slate-600">
                Loading spaces...
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="whitespace-nowrap px-5 py-4 sm:px-6">
                        No.
                      </th>
                      <th className="px-5 py-4 sm:px-6">Space</th>
                      <th className="px-5 py-4 sm:px-6">Type</th>
                      <th className="px-5 py-4 sm:px-6">Capacity</th>
                      <th className="px-5 py-4 sm:px-6">Location</th>
                      <th className="px-5 py-4 sm:px-6">Organization</th>
                      <th className="px-5 py-4 sm:px-6">Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredSpaces.map((space, index) => (
                      <tr
                        key={space.space_id}
                        className={`border-t border-slate-100 transition hover:bg-blue-50/40 ${
                          editingId === space.space_id
                            ? "bg-blue-50/60"
                            : ""
                        }`}
                      >
                        <td className="px-5 py-4 text-slate-500 sm:px-6">
                          {index + 1}
                        </td>

                        <td className="min-w-44 px-5 py-4 sm:px-6">
                          <p className="font-semibold text-slate-900">
                            {space.name}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            ID: {space.space_id}
                          </p>
                        </td>

                        <td className="px-5 py-4 sm:px-6">
                          <span className="inline-flex rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
                            {space.type || "-"}
                          </span>
                        </td>

                        <td className="whitespace-nowrap px-5 py-4 text-slate-600 sm:px-6">
                          {space.capacity ?? "-"} people
                        </td>

                        <td className="min-w-36 px-5 py-4 text-slate-600 sm:px-6">
                          {space.location || "-"}
                        </td>

                        <td className="min-w-40 px-5 py-4 sm:px-6">
                          <span className="inline-flex rounded-lg bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-700">
                            {space.organization_name || "—"}
                          </span>
                        </td>

                        <td className="px-5 py-4 sm:px-6">
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => startEditing(space)}
                              disabled={saving || deletingId !== null}
                              className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm"
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              onClick={() => deleteSpace(space)}
                              disabled={saving || deletingId !== null}
                              className="rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm"
                            >
                              {deletingId === space.space_id
                                ? "Deleting..."
                                : "Delete"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}

                    {filteredSpaces.length === 0 && (
                      <tr>
                        <td colSpan={7} className="px-5 py-12 text-center">
                          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
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
                                y="3"
                                width="7"
                                height="7"
                                rx="1.5"
                              />
                              <rect
                                x="14"
                                y="3"
                                width="7"
                                height="7"
                                rx="1.5"
                              />
                              <rect
                                x="3"
                                y="14"
                                width="7"
                                height="7"
                                rx="1.5"
                              />
                              <rect
                                x="14"
                                y="14"
                                width="7"
                                height="7"
                                rx="1.5"
                              />
                            </svg>
                          </div>

                          <p className="mt-4 font-semibold text-slate-800">
                            No spaces found
                          </p>

                          <p className="mt-1 text-sm text-slate-500">
                            {search
                              ? "Try changing your search terms."
                              : "Create a space using the form above."}
                          </p>

                          {search && (
                            <button
                              type="button"
                              onClick={() => setSearch("")}
                              className={`${secondaryButton} mt-4`}
                            >
                              Clear Search
                            </button>
                          )}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default AdminSpaces;