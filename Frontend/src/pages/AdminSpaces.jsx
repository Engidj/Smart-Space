
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
        location: ""
    };

    const [form, setForm] = useState(emptyForm);

    const loadData = async () => {
        try {
            setLoading(true);
            setError("");

            const [spacesResponse, organizationsResponse] =
                await Promise.all([
                    fetch(`${API}/admin/spaces`, {
                        credentials: "include"
                    }),
                    fetch(`${API}/admin/organizations`, {
                        credentials: "include"
                    })
                ]);

            const spacesData = await spacesResponse.json();
            const organizationsData = await organizationsResponse.json();

            if (!spacesResponse.ok || !organizationsResponse.ok) {
                throw new Error("Failed to load spaces or organizations");
            }

            setSpaces(spacesData.spaces || []);
            setOrganizations(organizationsData.organizations || []);
        } catch (error) {
            setError(error.message);
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
            [e.target.name]: e.target.value
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

            const url = editingId
                ? `${API}/spaces/${editingId}`
                : `${API}/spaces`;

            const response = await fetch(url, {
                method: editingId ? "PUT" : "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    ...form,
                    capacity: Number(form.capacity),
                    organization_id: Number(form.organization_id)
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to save space");
            }

            setMessage(data.message || "Space saved successfully");
            resetForm();
            await loadData();
        } catch (error) {
            setError(error.message);
        } finally {
            setSaving(false);
        }
    };

    const startEditing = (space) => {
        setEditingId(space.space_id);

        setForm({
            organization_id: String(space.organization_id),
            name: space.name,
            type: space.type,
            capacity: String(space.capacity),
            location: space.location
        });

        setError("");
        setMessage("");

        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const deleteSpace = async (space) => {
        if (
            !window.confirm(
                `Are you sure you want to delete "${space.name}"?`
            )
        ) {
            return;
        }

        setError("");
        setMessage("");

        try {
            const response = await fetch(
                `${API}/spaces/${space.space_id}`,
                {
                    method: "DELETE",
                    credentials: "include"
                }
            );

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
            setError(error.message);
        }
    };

    const filteredSpaces = spaces.filter((space) =>
        [
            space.name,
            space.type,
            space.location,
            space.organization_name
        ].some((value) =>
            String(value || "")
                .toLowerCase()
                .includes(search.toLowerCase())
        )
    );

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
                    Space Management
                </h2>

                <p className="mt-2 text-slate-500">
                    Create, view, edit, and manage spaces.
                </p>

                {message && (
                    <div className="mt-6 rounded-lg bg-green-50 p-4 text-green-700">
                        {message}
                    </div>
                )}

                {error && (
                    <div className="mt-6 rounded-lg bg-red-50 p-4 text-red-700">
                        {error}
                    </div>
                )}

                <section className="mt-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h3 className="mb-5 text-xl font-bold text-slate-900">
                        {editingId ? "Edit Space" : "Add Space"}
                    </h3>

                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                            <div>
                                <label className="mb-2 block font-medium">
                                    Organization
                                </label>

                                <select
                                    name="organization_id"
                                    value={form.organization_id}
                                    onChange={handleChange}
                                    required
                                    className="w-full rounded-lg border border-slate-300 p-3"
                                >
                                    <option value="">
                                        Select organization
                                    </option>

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
                                <label className="mb-2 block font-medium">
                                    Space Name
                                </label>

                                <input
                                    name="name"
                                    value={form.name}
                                    onChange={handleChange}
                                    maxLength={100}
                                    required
                                    placeholder="e.g. Seminar Hall 1"
                                    className="w-full rounded-lg border border-slate-300 p-3"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block font-medium">
                                    Type
                                </label>

                                <input
                                    name="type"
                                    value={form.type}
                                    onChange={handleChange}
                                    required
                                    placeholder="e.g. Meeting Room"
                                    className="w-full rounded-lg border border-slate-300 p-3"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block font-medium">
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
                                    className="w-full rounded-lg border border-slate-300 p-3"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block font-medium">
                                    Location
                                </label>

                                <input
                                    name="location"
                                    value={form.location}
                                    onChange={handleChange}
                                    required
                                    placeholder="Building or floor"
                                    className="w-full rounded-lg border border-slate-300 p-3"
                                />
                            </div>
                        </div>

                        <div className="mt-6 flex flex-wrap gap-3">
                            <button
                                type="submit"
                                disabled={saving || organizations.length === 0}
                                className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
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
                                    className="rounded-lg border border-slate-300 px-6 py-3 font-semibold hover:bg-slate-100"
                                >
                                    Cancel Edit
                                </button>
                            )}
                        </div>

                        {organizations.length === 0 && (
                            <p className="mt-3 text-sm text-amber-700">
                                Create an organization before adding a space.
                            </p>
                        )}
                    </form>
                </section>

                <section className="mt-10">
                    <div className="mb-5">
                        <h3 className="text-xl font-bold text-slate-900">
                            All Spaces
                        </h3>

                        <p className="mt-1 text-slate-500">
                            Showing {filteredSpaces.length} of {spaces.length} spaces
                        </p>
                    </div>

                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by name, type, location, or organization"
                        className="mb-5 w-full rounded-lg border border-slate-300 bg-white p-3"
                    />

                    {loading ? (
                        <div className="rounded-xl bg-white p-8 text-center">
                            Loading spaces...
                        </div>
                    ) : (
                        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
                            <table className="w-full text-left">
                                <thead className="bg-slate-100">
                                    <tr>
                                        <th className="px-5 py-4">No.</th>
                                        <th className="px-5 py-4">Space</th>
                                        <th className="px-5 py-4">Type</th>
                                        <th className="px-5 py-4">Capacity</th>
                                        <th className="px-5 py-4">Location</th>
                                        <th className="px-5 py-4">Organization</th>
                                        <th className="px-5 py-4">Actions</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {filteredSpaces.map((space, index) => (
                                        <tr
                                            key={space.space_id}
                                            className="border-t border-slate-100 hover:bg-slate-50"
                                        >
                                            <td className="px-5 py-4">
                                                {index + 1}
                                            </td>

                                            <td className="px-5 py-4 font-semibold">
                                                {space.name}
                                            </td>

                                            <td className="px-5 py-4">
                                                {space.type}
                                            </td>

                                            <td className="px-5 py-4">
                                                {space.capacity}
                                            </td>

                                            <td className="px-5 py-4">
                                                {space.location}
                                            </td>

                                            <td className="px-5 py-4">
                                                {space.organization_name || "—"}
                                            </td>

                                            <td className="px-5 py-4">
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => startEditing(space)}
                                                        className="rounded-md bg-amber-500 px-3 py-2 text-sm font-semibold text-white hover:bg-amber-600"
                                                    >
                                                        Edit
                                                    </button>

                                                    <button
                                                        onClick={() => deleteSpace(space)}
                                                        className="rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-700"
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
