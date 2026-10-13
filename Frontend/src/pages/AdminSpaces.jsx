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
            "Failed to load spaces or organizations",
        );
      }

      setSpaces(spacesData.spaces || []);
      setOrganizations(organizationsData.organizations || []);
    } catch (error) {
      setError(error.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      setSaving(true);

      const url = editingId ? `${API}/spaces/${editingId}` : `${API}/spaces`;

      const response = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          name: form.name.trim(),
          type: form.type.trim(),
          location: form.location.trim(),
          capacity: Number(form.capacity),
          organization_id: Number(form.organization_id),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to save space");
      }

      setMessage(
        data.message ||
          (editingId
            ? "Space updated successfully"
            : "Space created successfully"),
      );

      resetForm();
      await loadData();
    } catch (error) {
      setError(error.message || "Failed to save space");
    } finally {
      setSaving(false);
    }
  };

  const startEditing = (space) => {
    setEditingId(space.space_id);

    setForm({
      organization_id: String(space.organization_id),
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

    try {
      const response = await fetch(`${API}/spaces/${space.space_id}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete space");
      }

      setMessage(data.message || "Space deleted successfully");

      if (editingId === space.space_id) {
        resetForm();
      }

      await loadData();
    } catch (error) {
      setError(error.message || "Failed to delete space");
    }
  };

  const filteredSpaces = spaces.filter((space) =>
    [space.name, space.type, space.location, space.organization_name].some(
      (value) =>
        String(value || "")
          .toLowerCase()
          .includes(search.toLowerCase()),
    ),
  );

  return (
    <div className="min-h-screen w-full bg-slate-100 text-slate-900">
      <nav className="flex min-h-[72px] items-center justify-between border-b border-slate-700 bg-slate-900 px-5 py-4 sm:px-8 lg:px-12">
        <button
          onClick={() => navigate("/admin")}
          className="text-xl font-bold text-white sm:text-2xl"
        >
          Smart Space
        </button>

        <button
          onClick={() => navigate("/admin")}
          className="rounded-lg bg-blue-600 px-4 py-2.5 font-semibold text-white transition hover:bg-blue-700 sm:px-5"
        >
          Back to Dashboard
        </button>
      </nav>

      <main className="w-full px-5 py-8 sm:px-8 sm:py-10 lg:px-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Space Management
          </h1>
          <p className="mt-2 text-slate-500">
            Create, view, edit, and manage spaces across organizations.
          </p>
        </div>

        {message && (
          <div
            role="status"
            className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700"
          >
            {message}
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            {error}
            <button onClick={loadData} className="ml-3 font-semibold underline">
              Retry
            </button>
          </div>
        )}

        <section className="mb-10 rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-6">
            <h2 className="text-xl font-bold">
              {editingId ? "Edit Space" : "Add Space"}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {editingId
                ? "Update the selected space details."
                : "Enter the details to create a new space."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Organization
                </label>
                <select
                  name="organization_id"
                  value={form.organization_id}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Space Name
                </label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  maxLength={100}
                  required
                  placeholder="e.g. Seminar Hall 1"
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Space Type
                </label>
                <input
                  name="type"
                  value={form.type}
                  onChange={handleChange}
                  required
                  placeholder="e.g. Meeting Room"
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Capacity
                </label>
                <input
                  type="number"
                  name="capacity"
                  value={form.capacity}
                  onChange={handleChange}
                  min="1"
                  step="1"
                  required
                  placeholder="Number of people"
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Location
                </label>
                <input
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  required
                  placeholder="Building or floor"
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row">
              <button
                type="submit"
                disabled={saving || organizations.length === 0}
                className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving
                  ? "Saving..."
                  : editingId
                    ? "Update Space"
                    : "Create Space"}
              </button>

              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-lg border border-slate-300 px-6 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Cancel Edit
                </button>
              )}
            </div>

            {organizations.length === 0 && !loading && (
              <p className="text-sm text-amber-700">
                Create an organization before adding a space.
              </p>
            )}
          </form>
        </section>

        <section>
          <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <h2 className="text-2xl font-bold">All Spaces</h2>
              <p className="mt-1 text-sm text-slate-500">
                Showing {filteredSpaces.length} of {spaces.length} spaces
              </p>
            </div>

            <button
              onClick={loadData}
              disabled={loading}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
            >
              Refresh
            </button>
          </div>

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, type, location, or organization"
            className="mb-5 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />

          {loading ? (
            <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">
              <p className="text-slate-500">Loading spaces...</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
              <table className="w-full text-left">
                <thead className="bg-slate-900 text-white">
                  <tr>
                    <th className="whitespace-nowrap px-5 py-4 text-sm font-semibold">
                      No.
                    </th>
                    <th className="whitespace-nowrap px-5 py-4 text-sm font-semibold">
                      Space
                    </th>
                    <th className="whitespace-nowrap px-5 py-4 text-sm font-semibold">
                      Type
                    </th>
                    <th className="whitespace-nowrap px-5 py-4 text-sm font-semibold">
                      Capacity
                    </th>
                    <th className="whitespace-nowrap px-5 py-4 text-sm font-semibold">
                      Location
                    </th>
                    <th className="whitespace-nowrap px-5 py-4 text-sm font-semibold">
                      Organization
                    </th>
                    <th className="whitespace-nowrap px-5 py-4 text-sm font-semibold">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredSpaces.map((space, index) => (
                    <tr
                      key={space.space_id}
                      className="border-t border-slate-100 transition hover:bg-slate-50"
                    >
                      <td className="px-5 py-4 text-sm text-slate-500">
                        {index + 1}
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 font-semibold">
                        {space.name}
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-600">
                        {space.type}
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-600">
                        {space.capacity}
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-600">
                        {space.location}
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-600">
                        {space.organization_name || "—"}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => startEditing(space)}
                            className="rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
                          >
                            Edit
                          </button>

                          <button
                            onClick={() => deleteSpace(space)}
                            className="rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {filteredSpaces.length === 0 && (
                    <tr>
                      <td
                        colSpan="7"
                        className="px-5 py-10 text-center text-slate-500"
                      >
                        No spaces found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default AdminSpaces;
