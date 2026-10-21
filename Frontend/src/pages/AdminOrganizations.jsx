import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function AdminOrganizations() {
  const navigate = useNavigate();

  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    name: "",
    type: "",
    location: "",
  });

  const loadOrganizations = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "http://localhost:5000/api/admin/organizations",
        { credentials: "include" }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to load organizations"
        );
      }

      setOrganizations(data.organizations || []);
    } catch (err) {
      setError(err.message || "Failed to load organizations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrganizations();
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
    setForm({
      name: "",
      type: "",
      location: "",
    });
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    const cleanedForm = {
      name: form.name.trim(),
      type: form.type.trim(),
      location: form.location.trim(),
    };

    if (!cleanedForm.name || !cleanedForm.type || !cleanedForm.location) {
      setError("Please complete all required fields.");
      return;
    }

    try {
      setSaving(true);

      const url = editingId
        ? `http://localhost:5000/api/admin/organizations/${editingId}`
        : "http://localhost:5000/api/admin/organizations";

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
        throw new Error(
          data.message || "Failed to save organization"
        );
      }

      setMessage(
        data.message || "Organization saved successfully."
      );

      resetForm();
      await loadOrganizations();
    } catch (err) {
      setError(err.message || "Failed to save organization");
    } finally {
      setSaving(false);
    }
  };

  const startEditing = (organization) => {
    setEditingId(organization.organization_id);

    setForm({
      name: organization.name || "",
      type: organization.type || "",
      location: organization.location || "",
    });

    setError("");
    setMessage("");

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteOrganization = async (organization) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${organization.name}"?`
    );

    if (!confirmed) return;

    setError("");
    setMessage("");

    try {
      const response = await fetch(
        `http://localhost:5000/api/admin/organizations/${organization.organization_id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to delete organization"
        );
      }

      setMessage(
        data.message || "Organization deleted successfully."
      );

      if (editingId === organization.organization_id) {
        resetForm();
      }

      await loadOrganizations();
    } catch (err) {
      setError(err.message || "Failed to delete organization");
    }
  };

  const inputClass =
    "w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 hover:border-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100";

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
            Organization Management
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-600 sm:text-base">
            Create, view, edit, and manage registered organizations.
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
                loadOrganizations();
              }}
              disabled={loading}
              className="self-start rounded-lg bg-white px-4 py-2 font-semibold text-red-700 transition hover:bg-red-100 disabled:opacity-50 sm:self-auto"
            >
              Retry
            </button>
          </div>
        )}

        {/* Create / Edit Form */}
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
                  <rect x="4" y="3" width="16" height="18" rx="2" />
                  <path d="M9 8h6m-6 4h6m-6 4h3" />
                </svg>
              </div>

              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {editingId ? "Edit Organization" : "Add Organization"}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {editingId
                    ? "Update the organization details below."
                    : "Enter the details to register a new organization."}
                </p>
              </div>
            </div>

            {editingId && (
              <span className="rounded-lg bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700">
                Editing
              </span>
            )}
          </div>

          <form onSubmit={handleSubmit} className="p-5 sm:p-6">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
              <div>
                <label
                  htmlFor="organization-name"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Organization Name
                  <span className="ml-1 text-red-500">*</span>
                </label>

                <input
                  id="organization-name"
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  maxLength={100}
                  required
                  placeholder="e.g. Smart Tech Solutions"
                  disabled={saving}
                  className={inputClass}
                />
              </div>

              <div>
                <label
                  htmlFor="organization-type"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Organization Type
                  <span className="ml-1 text-red-500">*</span>
                </label>

                <input
                  id="organization-type"
                  type="text"
                  name="type"
                  value={form.type}
                  onChange={handleChange}
                  maxLength={50}
                  required
                  placeholder="e.g. College, Company"
                  disabled={saving}
                  className={inputClass}
                />
              </div>

              <div>
                <label
                  htmlFor="organization-location"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Location
                  <span className="ml-1 text-red-500">*</span>
                </label>

                <input
                  id="organization-location"
                  type="text"
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  maxLength={150}
                  required
                  placeholder="e.g. Pune, Maharashtra"
                  disabled={saving}
                  className={inputClass}
                />
              </div>
            </div>

            <div className="mt-6 flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
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
                disabled={saving}
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
                    Update Organization
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
                    Create Organization
                  </>
                )}
              </button>
            </div>
          </form>
        </section>

        {/* Organization List Heading */}
        <section>
          <div className="mb-4 rounded-xl border border-violet-100 bg-violet-50 px-5 py-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-violet-900">
                  All Organizations
                </h2>
                <p className="mt-1 text-sm text-violet-700">
                  View and manage organizations registered on the platform.
                </p>
              </div>

              <span className="rounded-lg bg-white px-3 py-2 text-sm font-semibold text-violet-800 shadow-sm">
                {organizations.length}{" "}
                {organizations.length === 1 ? "Organization" : "Organizations"}
              </span>
            </div>
          </div>

          {loading ? (
            <div className="rounded-xl border border-slate-200 bg-white p-10 text-center shadow-sm">
              <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />
              <p className="text-sm font-medium text-slate-600">
                Loading organizations...
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
                      <th className="px-5 py-4 sm:px-6">
                        Organization
                      </th>
                      <th className="px-5 py-4 sm:px-6">Type</th>
                      <th className="px-5 py-4 sm:px-6">Location</th>
                      <th className="px-5 py-4 sm:px-6">Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {organizations.map((organization, index) => (
                      <tr
                        key={organization.organization_id}
                        className={`border-t border-slate-100 transition hover:bg-blue-50/40 ${
                          editingId === organization.organization_id
                            ? "bg-blue-50/60"
                            : ""
                        }`}
                      >
                        <td className="px-5 py-4 text-slate-500 sm:px-6">
                          {index + 1}
                        </td>

                        <td className="min-w-48 px-5 py-4 sm:px-6">
                          <p className="font-semibold text-slate-900">
                            {organization.name}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            ID: {organization.organization_id}
                          </p>
                        </td>

                        <td className="px-5 py-4 sm:px-6">
                          <span className="inline-flex rounded-lg bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-700">
                            {organization.type || "-"}
                          </span>
                        </td>

                        <td className="min-w-40 px-5 py-4 text-slate-600 sm:px-6">
                          {organization.location || "-"}
                        </td>

                        <td className="px-5 py-4 sm:px-6">
                          <div className="flex flex-wrap gap-2">
                            <button
                              onClick={() => startEditing(organization)}
                              disabled={saving}
                              className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50 sm:text-sm"
                            >
                              Edit
                            </button>

                            <button
                              onClick={() => deleteOrganization(organization)}
                              disabled={saving}
                              className="rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}

                    {organizations.length === 0 && (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-6 py-12 text-center"
                        >
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
                                x="4"
                                y="3"
                                width="16"
                                height="18"
                                rx="2"
                              />
                              <path d="M9 8h6m-6 4h6m-6 4h3" />
                            </svg>
                          </div>

                          <p className="mt-4 font-semibold text-slate-800">
                            No organizations found
                          </p>
                          <p className="mt-1 text-sm text-slate-500">
                            Create an organization using the form above.
                          </p>
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

export default AdminOrganizations;