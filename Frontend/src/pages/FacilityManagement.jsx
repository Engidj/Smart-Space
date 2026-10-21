import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function FacilityManagement() {
  const navigate = useNavigate();

  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadFacilities = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "http://localhost:5000/api/facilities",
        {
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load facilities");
      }

      setFacilities(data.facilities || []);
    } catch (error) {
      setError(error.message || "Failed to load facilities");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFacilities();
  }, []);

  const navLink =
    "rounded-lg px-3 py-2 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400";

  const primaryButton =
    "inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60";

  const secondaryButton =
    "inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400";

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

      <main className="mx-auto w-full max-w-7xl px-5 py-8 md:px-8 md:py-10">
        {/* Page Heading */}
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Facility Management
            </h1>

            <p className="mt-2 text-sm leading-6 text-slate-600 sm:text-base">
              Manage facilities available in your organization.
            </p>
          </div>

          <button
            onClick={() => navigate("/manager/facilities/add")}
            className={`${primaryButton} self-start sm:self-auto`}
          >
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
            Add Facility
          </button>
        </div>

        {/* Error State */}
        {error && (
          <div
            role="alert"
            className="mb-6 flex flex-col justify-between gap-3 rounded-xl border border-red-200 bg-white p-5 sm:flex-row sm:items-center"
          >
            <div>
              <p className="font-semibold text-red-700">
                Could not load facilities
              </p>
              <p className="mt-1 text-sm text-slate-600">{error}</p>
            </div>

            <button
              onClick={loadFacilities}
              disabled={loading}
              className={secondaryButton}
            >
              {loading ? "Loading..." : "Retry"}
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="rounded-xl border border-slate-200 bg-white p-12 text-center shadow-sm">
            <div className="mx-auto mb-4 h-9 w-9 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

            <p className="font-semibold text-slate-800">
              Loading facilities
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Retrieving your organization's facilities...
            </p>
          </div>
        ) : error ? null : facilities.length === 0 ? (
          /* Empty State */
          <div className="rounded-xl border border-slate-200 bg-white px-5 py-12 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="h-7 w-7"
                aria-hidden="true"
              >
                <path d="M4 21V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v16" />
                <path d="M2 21h20M9 7h2m2 0h2M9 11h2m2 0h2M10 21v-5h4v5" />
              </svg>
            </div>

            <h2 className="mt-4 text-xl font-bold text-slate-900">
              No facilities found
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              Add a facility to start managing resources across your spaces.
            </p>

            <button
              onClick={() => navigate("/manager/facilities/add")}
              className={`${primaryButton} mt-5`}
            >
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
              Add Your First Facility
            </button>
          </div>
        ) : (
          /* Facilities Grid */
          <>
            <div className="mb-5 flex items-center justify-between gap-3">
              <h2 className="text-lg font-bold text-slate-900">
                Your Facilities
              </h2>

              <span className="rounded-full bg-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600">
                {facilities.length}{" "}
                {facilities.length === 1 ? "facility" : "facilities"}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {facilities.map((facility) => (
                <article
                  key={facility.facility_id}
                  className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md sm:p-6"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        className="h-6 w-6"
                        aria-hidden="true"
                      >
                        <path d="M4 21V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v16" />
                        <path d="M2 21h20M9 7h2m2 0h2M9 11h2m2 0h2M10 21v-5h4v5" />
                      </svg>
                    </div>

                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                      Facility
                    </span>
                  </div>

                  <h3 className="mt-5 break-words text-lg font-bold text-slate-900">
                    {facility.name || "Unnamed Facility"}
                  </h3>

                  <p className="mt-2 text-sm text-slate-500">
                    Facility ID: {facility.facility_id}
                  </p>

                  <div className="mt-5 border-t border-slate-100 pt-4">
                    <button
                      onClick={() =>
                        navigate("/manager/facilities/assign", {
                          state: { facility },
                        })
                      }
                      className={`${primaryButton} w-full`}
                    >
                      Assign to Space
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="h-4 w-4"
                        aria-hidden="true"
                      >
                        <path d="M5 12h14m-6-6 6 6-6 6" />
                      </svg>
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default FacilityManagement;