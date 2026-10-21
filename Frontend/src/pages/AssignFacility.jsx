import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

function AssignFacility() {
  const navigate = useNavigate();
  const location = useLocation();
  const facility = location.state?.facility;

  const [spaces, setSpaces] = useState([]);
  const [selectedSpace, setSelectedSpace] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadSpaces = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(
          "http://localhost:5000/api/spaces",
          { credentials: "include" }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to load spaces");
        }

        setSpaces(data.spaces || []);
      } catch (err) {
        setError(err.message || "Failed to load spaces");
      } finally {
        setLoading(false);
      }
    };

    if (facility) {
      loadSpaces();
    } else {
      setLoading(false);
    }
  }, [facility]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!selectedSpace) {
      setError("Please select a space.");
      return;
    }

    if (!facility?.facility_id) {
      setError("Facility information is missing. Please open this page again.");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(
        `http://localhost:5000/api/facilities/space/${selectedSpace}`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            facilityId: facility.facility_id,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to assign facility");
      }

      setSuccess("Facility assigned successfully.");

      navigate("/manager/facilities", {
        state: {
          message: "Facility assigned successfully",
        },
      });
    } catch (err) {
      setError(err.message || "Failed to assign facility");
    } finally {
      setSaving(false);
    }
  };

  const navLink =
    "rounded-lg px-3 py-2 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400";

  const inputClass =
    "w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition hover:border-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100";

  const primaryButton =
    "inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60";

  const secondaryButton =
    "inline-flex flex-1 items-center justify-center rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 disabled:cursor-not-allowed disabled:opacity-60";

  if (!facility) {
    return (
      <div className="min-h-screen w-full bg-slate-100 text-slate-900">
        <nav className="flex min-h-[64px] items-center justify-between border-b border-slate-800 bg-slate-900 px-5 py-3 text-white shadow-sm md:px-8">
          <button
            onClick={() => navigate("/manager")}
            className="text-xl font-bold tracking-tight transition hover:text-blue-200"
          >
            Smart Space
          </button>

          <button
            onClick={() => navigate("/manager/facilities")}
            className={`${navLink} text-slate-300 hover:bg-slate-800 hover:text-white`}
          >
            Facilities
          </button>
        </nav>

        <main className="flex justify-center px-5 py-12">
          <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <h1 className="text-xl font-bold text-slate-900">
              Facility not found
            </h1>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Open this page from Facility Management to select a facility.
            </p>

            <button
              onClick={() => navigate("/manager/facilities")}
              className={`${primaryButton} mt-6`}
            >
              Back to Facilities
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-slate-100 text-slate-900">
      {/* Consistent Manager Navbar */}
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
            Facilities
          </span>
        </div>
      </nav>

     <main className="w-full px-5 py-8 md:px-8 md:py-10 lg:px-12">
        {/* Page Heading */}
        <div className="mb-7">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Assign Facility
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-600 sm:text-base">
            Select a space to assign this facility to.
          </p>
        </div>

        {/* Assignment Form */}
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-5 sm:px-7">
            <h2 className="text-lg font-bold text-slate-900">
              Facility Details
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Review the facility and choose the destination space.
            </p>
          </div>

          <div className="space-y-6 p-5 sm:p-7">
            {/* Selected Facility */}
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Selected Facility
              </p>

              <div className="mt-2 flex items-center justify-between gap-3">
                <h3 className="break-words text-lg font-bold text-slate-900">
                  {facility.name || "Unnamed Facility"}
                </h3>

                <span className="shrink-0 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                  #{facility.facility_id}
                </span>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div
                role="alert"
                className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
              >
                {error}
              </div>
            )}

            {/* Success */}
            {success && (
              <div
                role="status"
                className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"
              >
                {success}
              </div>
            )}

            {/* Loading */}
            {loading ? (
              <div className="py-8 text-center">
                <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

                <p className="text-sm font-medium text-slate-700">
                  Loading spaces...
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <label
                  htmlFor="space-select"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Select Space <span className="text-red-500">*</span>
                </label>

                <select
                  id="space-select"
                  value={selectedSpace}
                  onChange={(e) => {
                    setSelectedSpace(e.target.value);
                    setError("");
                    setSuccess("");
                  }}
                  required
                  disabled={saving || spaces.length === 0}
                  className={inputClass}
                >
                  <option value="">Choose a space</option>

                  {spaces.map((space) => (
                    <option key={space.space_id} value={space.space_id}>
                      {space.name} — {space.location || "Location not specified"}
                    </option>
                  ))}
                </select>

                {!error && spaces.length === 0 && (
                  <p className="mt-2 text-sm text-slate-500">
                    No spaces found. Add a space before assigning a facility.
                  </p>
                )}

                {/* Form Actions */}
                <div className="mt-6 flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => navigate("/manager/facilities")}
                    disabled={saving}
                    className={secondaryButton}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={saving || loading || spaces.length === 0}
                    className={primaryButton}
                  >
                    {saving ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                        Assigning...
                      </>
                    ) : (
                      "Assign Facility"
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default AssignFacility;