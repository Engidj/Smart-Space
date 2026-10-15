
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
      <div className="flex min-h-screen items-center justify-center bg-slate-100 px-5">
        <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <h2 className="text-xl font-bold text-slate-900">
            Space not found
          </h2>
          <p className="mt-2 text-slate-500">
            Please open this page from Manager Dashboard.
          </p>
          <button
            onClick={() => navigate("/manager")}
            className="mt-5 rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
          >
            Back to Manager
          </button>
        </div>
      </div>
    );
  }

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
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

      setSuccess("Space updated successfully");

      setTimeout(() => {
        navigate("/manager");
      }, 1000);
    } catch (error) {
      setError(error.message || "Failed to update space");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-100 text-slate-900">
      <nav className="flex min-h-20 items-center justify-between border-b border-slate-700 bg-slate-900 px-5 py-4 sm:px-8 lg:px-12">
        <button
          onClick={() => navigate("/manager")}
          className="text-xl font-bold text-white sm:text-2xl"
        >
          Smart Space
        </button>

        <button
          onClick={() => navigate("/manager")}
          className="text-sm font-medium text-slate-300 transition hover:text-white sm:text-base"
        >
          Manager Dashboard
        </button>
      </nav>

      <main className="w-full px-5 py-8 sm:px-8 sm:py-10 lg:px-12">
        <div className="mx-auto max-w-3xl">
          <div className="mb-6">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Edit Space
            </h1>
            <p className="mt-2 text-slate-500">
              Update the details of this space.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            {error && (
              <div
                role="alert"
                className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
              >
                {error}
              </div>
            )}

            {success && (
              <div
                role="status"
                className="mb-5 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700"
              >
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Space Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  maxLength={100}
                  required
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Space Type
                </label>
                <select
                  name="type"
                  value={form.type}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">Select type</option>
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
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Capacity
                  </label>
                  <input
                    type="number"
                    name="capacity"
                    value={form.capacity}
                    onChange={handleChange}
                    min="1"
                    required
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Location
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                    maxLength={150}
                    required
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              <div className="flex flex-col-reverse gap-3 pt-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => navigate("/manager")}
                  className="flex-1 rounded-lg border border-slate-300 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 rounded-lg bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "Updating..." : "Update Space"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}

export default EditSpace;
