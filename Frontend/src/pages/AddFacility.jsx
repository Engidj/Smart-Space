
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function AddFacility() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/facilities",
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: name.trim(),
          }),
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
      setError(error.message || "Failed to create facility");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-100 text-slate-900">
      <nav className="flex min-h-[72px] items-center justify-between border-b border-slate-700 bg-slate-900 px-5 py-4 sm:px-8 lg:px-12">
        <button
          onClick={() => navigate("/manager")}
          className="text-xl font-bold text-white sm:text-2xl"
        >
          Smart Space
        </button>

        <button
          onClick={() => navigate("/manager/facilities")}
          className="text-sm font-medium text-slate-300 transition hover:text-white sm:text-base"
        >
          Facilities
        </button>
      </nav>

      <main className="w-full px-5 py-8 sm:px-8 sm:py-10 lg:px-12">
        <div className="mx-auto max-w-2xl">
          <div className="mb-6">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Add Facility
            </h1>
            <p className="mt-2 text-slate-500">
              Add a facility that can be assigned to spaces.
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

            <form onSubmit={handleSubmit}>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Facility Name
              </label>

              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Example: Projector"
                maxLength={100}
                required
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />

              <p className="mt-2 text-xs text-slate-500">
                Enter the name of the facility you want to add.
              </p>

              <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => navigate("/manager/facilities")}
                  className="flex-1 rounded-lg border border-slate-300 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={loading || !name.trim()}
                  className="flex-1 rounded-lg bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? "Adding..." : "Add Facility"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}

export default AddFacility;
