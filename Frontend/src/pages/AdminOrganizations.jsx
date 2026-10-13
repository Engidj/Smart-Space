
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
        location: ""
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
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadOrganizations();
    }, []);

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    const resetForm = () => {
        setForm({ name: "", type: "", location: "" });
        setEditingId(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setMessage("");

        try {
            setSaving(true);

            const url = editingId
                ? `http://localhost:5000/api/admin/organizations/${editingId}`
                : "http://localhost:5000/api/admin/organizations";

            const response = await fetch(url, {
                method: editingId ? "PUT" : "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(form)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to save organization"
                );
            }

            setMessage(data.message || "Organization saved successfully");
            resetForm();
            await loadOrganizations();
        } catch (error) {
            setError(error.message);
        } finally {
            setSaving(false);
        }
    };

    const startEditing = (organization) => {
        setEditingId(organization.organization_id);

        setForm({
            name: organization.name,
            type: organization.type,
            location: organization.location
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
                    credentials: "include"
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to delete organization"
                );
            }

            setMessage(data.message || "Organization deleted successfully");

            if (editingId === organization.organization_id) {
                resetForm();
            }

            await loadOrganizations();
        } catch (error) {
            setError(error.message);
        }
    };

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
                <div className="mb-8">
                    <h2 className="text-3xl font-bold text-slate-800">
                        Organization Management
                    </h2>

                    <p className="mt-2 text-slate-600">
                        Create, view, edit, and delete organizations.
                    </p>
                </div>

                {message && (
                    <div className="mb-5 rounded-lg border border-green-200 bg-green-50 p-4 text-green-700">
                        {message}
                    </div>
                )}

                {error && (
                    <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
                        {error}
                    </div>
                )}

                <div className="mb-10 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h3 className="mb-5 text-xl font-bold text-slate-800">
                        {editingId ? "Edit Organization" : "Add Organization"}
                    </h3>

                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                            <div>
                                <label className="mb-2 block font-medium text-slate-700">
                                    Organization Name
                                </label>

                                <input
                                    type="text"
                                    name="name"
                                    value={form.name}
                                    onChange={handleChange}
                                    maxLength={100}
                                    required
                                    placeholder="Organization name"
                                    className="w-full rounded-lg border border-slate-300 p-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block font-medium text-slate-700">
                                    Organization Type
                                </label>

                                <input
                                    type="text"
                                    name="type"
                                    value={form.type}
                                    onChange={handleChange}
                                    maxLength={50}
                                    required
                                    placeholder="College, Company, etc."
                                    className="w-full rounded-lg border border-slate-300 p-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block font-medium text-slate-700">
                                    Location
                                </label>

                                <input
                                    type="text"
                                    name="location"
                                    value={form.location}
                                    onChange={handleChange}
                                    maxLength={150}
                                    required
                                    placeholder="City or address"
                                    className="w-full rounded-lg border border-slate-300 p-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                />
                            </div>
                        </div>

                        <div className="mt-6 flex flex-wrap gap-3">
                            <button
                                type="submit"
                                disabled={saving}
                                className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {saving
                                    ? "Saving..."
                                    : editingId
                                    ? "Update Organization"
                                    : "Create Organization"}
                            </button>

                            {editingId && (
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="rounded-lg border border-slate-300 px-6 py-3 font-semibold text-slate-700 transition hover:bg-slate-100"
                                >
                                    Cancel Edit
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                <div className="mb-5">
                    <h3 className="text-xl font-bold text-slate-800">
                        All Organizations
                    </h3>

                    <p className="mt-1 text-slate-600">
                        Total organizations: {organizations.length}
                    </p>
                </div>

                {loading ? (
                    <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-600 shadow-sm">
                        Loading organizations...
                    </div>
                ) : (
                    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 text-slate-600">
                                <tr>
                                    <th className="px-6 py-4">ID</th>
                                    <th className="px-6 py-4">Organization</th>
                                    <th className="px-6 py-4">Type</th>
                                    <th className="px-6 py-4">Location</th>
                                    <th className="px-6 py-4">Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {organizations.map((organization, index) => (
                                    <tr
                                        key={organization.organization_id}
                                        className="border-t border-slate-200 transition hover:bg-slate-50"
                                    >
                                        <td className="px-6 py-4">
                                            {index + 1}
                                        </td>

                                        <td className="px-6 py-4 font-semibold text-slate-800">
                                            {organization.name}
                                        </td>

                                        <td className="px-6 py-4 text-slate-700">
                                            {organization.type}
                                        </td>

                                        <td className="px-6 py-4 text-slate-700">
                                            {organization.location}
                                        </td>

                                        <td className="px-6 py-4">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => startEditing(organization)}
                                                    className="rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
                                                >
                                                    Edit
                                                </button>

                                                <button
                                                    onClick={() => deleteOrganization(organization)}
                                                    className="rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
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
                                            colSpan="5"
                                            className="px-6 py-10 text-center text-slate-500"
                                        >
                                            No organizations found.
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

export default AdminOrganizations;
