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
      const response = await fetch("http://localhost:5000/api/facilities", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
        }),
      });

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

  const inputClass =
    "w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 hover:border-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100";

  const navLink =
    "rounded-lg px-3 py-2 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400";

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

        <div className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => navigate("/manager")}
            className={`${navLink} text-slate-300 hover:bg-slate-800 hover:text-white`}
          >
            Dashboard
          </button>

          <span
            aria-current="page"
            className={`${navLink} bg-blue-600 text-white shadow-sm`}
          >
            Add Facility
          </span>
        </div>
      </nav>

      <main className="w-full px-5 py-8 md:px-8 md:py-10 lg:px-12">
        {/* Page heading */}
        <div className="mb-7">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Add Facility
          </h1>
        </div>

        {/* Form card */}
        <section className="w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-5 sm:px-8">
            <h2 className="text-lg font-bold text-slate-900">
              Facility Details
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Enter the name of the facility you want to add.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 p-5 sm:p-8">
            {/* Error message */}
            {error && (
              <div
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
              >
                {error}
              </div>
            )}

            {/* Success message */}
            {success && (
              <div
                role="status"
                className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"
              >
                {success}. Redirecting to Facilities...
              </div>
            )}

            {/* Facility name */}
            <div>
              <label
                htmlFor="facility-name"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Facility Name <span className="text-red-500">*</span>
              </label>

              <input
                id="facility-name"
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setError("");
                  setSuccess("");
                }}
                placeholder="Example: Projector"
                maxLength={100}
                required
                disabled={loading || Boolean(success)}
                className={inputClass}
              />

              <p className="mt-2 text-xs text-slate-500">
                Use a clear name, such as Projector, Whiteboard, or Air
                Conditioning.
              </p>
            </div>

            {/* Form actions */}
            <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row">
              <button
                type="button"
                onClick={() => navigate("/manager/facilities")}
                disabled={loading}
                className="inline-flex flex-1 items-center justify-center rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading || !name.trim() || Boolean(success)}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    Adding Facility...
                  </>
                ) : success ? (
                  "Added Successfully"
                ) : (
                  "Add Facility"
                )}
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}

export default AddFacility;