import { useState } from "react";
import { useNavigate } from "react-router-dom";

function AddSpace() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    organization_id: "1",
    name: "",
    type: "",
    capacity: "",
    location: ""
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        "http://localhost:5000/api/spaces",
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            organization_id: Number(form.organization_id),
            name: form.name,
            type: form.type,
            capacity: Number(form.capacity),
            location: form.location
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create space");
      }

      setSuccess("Space created successfully");

      setTimeout(() => {
        navigate("/manager");
      }, 1000);
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="h-18 bg-white border-b border-slate-200 flex items-center justify-between px-8 md:px-16">
        <button
          onClick={() => navigate("/manager")}
          className="text-2xl font-bold text-slate-900"
        >
          Smart Space
        </button>

        <button
          onClick={() => navigate("/manager")}
          className="text-slate-700 hover:text-blue-600"
        >
          Manager Dashboard
        </button>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-12">
        <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm">
          <h1 className="text-3xl font-bold text-slate-900">
            Add Space
          </h1>

          <p className="text-slate-500 mt-2 mb-8">
            Add a new space to your organization.
          </p>

          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 text-green-600 p-4 rounded-lg mb-6">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Space Name
              </label>

              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Example: Seminar Hall 2"
                required
                className="w-full border border-slate-300 rounded-lg px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Space Type
              </label>

              <select
                name="type"
                value={form.type}
                onChange={handleChange}
                required
                className="w-full border border-slate-300 rounded-lg px-4 py-3 outline-none focus:border-blue-500"
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

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Capacity
              </label>

              <input
                type="number"
                name="capacity"
                value={form.capacity}
                onChange={handleChange}
                placeholder="Example: 50"
                min="1"
                required
                className="w-full border border-slate-300 rounded-lg px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Location
              </label>

              <input
                type="text"
                name="location"
                value={form.location}
                onChange={handleChange}
                placeholder="Example: Block B"
                required
                className="w-full border border-slate-300 rounded-lg px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => navigate("/manager")}
                className="flex-1 border border-slate-300 text-slate-700 hover:bg-slate-50 py-3 rounded-lg font-semibold"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold"
              >
                Create Space
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

export default AddSpace;