import { useState } from "react";
import { useNavigate } from "react-router-dom";

function AddFacility() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        "http://localhost:5000/api/facilities",
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            name
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create facility");
      }

      setSuccess("Facility created successfully");
      setName("");

      setTimeout(() => {
        navigate("/manager/facilities");
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
          onClick={() => navigate("/manager/facilities")}
          className="text-slate-700 hover:text-blue-600"
        >
          Facilities
        </button>
      </nav>

      <main className="max-w-2xl mx-auto px-6 py-12">
        <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm">
          <h1 className="text-3xl font-bold text-slate-900">
            Add Facility
          </h1>

          <p className="text-slate-500 mt-2 mb-8">
            Add a facility that can be assigned to spaces.
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

          <form onSubmit={handleSubmit}>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Facility Name
            </label>

            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Example: Projector"
              required
              className="w-full border border-slate-300 rounded-lg px-4 py-3 outline-none focus:border-blue-500"
            />

            <div className="flex gap-4 mt-6">
              <button
                type="button"
                onClick={() => navigate("/manager/facilities")}
                className="flex-1 border border-slate-300 text-slate-700 hover:bg-slate-50 py-3 rounded-lg font-semibold"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold"
              >
                Add Facility
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

export default AddFacility;