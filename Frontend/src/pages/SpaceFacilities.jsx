import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

function SpaceFacilities() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();

  const space = location.state?.space;

  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadFacilities = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `http://localhost:5000/api/facilities/space/${id}`,
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
  }, [id]);

  const navLink =
    "rounded-lg px-3 py-2 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400";

  const primaryButton =
    "inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2";

  const secondaryButton =
    "inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400";

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

          <button
            onClick={() => navigate("/manager/facilities")}
            className={`${navLink} text-slate-300 hover:bg-slate-800 hover:text-white`}
          >
            Facilities
          </button>

          <span
            aria-current="page"
            className={`${navLink} hidden bg-blue-600 text-white shadow-sm sm:inline-flex`}
          >
            Space Details
          </span>
        </div>
      </nav>

      <main className="mx-auto w-full max-w-7xl px-5 py-8 md:px-8 md:py-10">
        {/* Page heading */}
        <div className="mb-8">
         

         

          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Space Facilities
          </h1>

         
        </div>

        {/* Space information */}
        <section className="mb-8 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="h-7 w-7"
                  aria-hidden="true"
                >
                  <rect x="3" y="3" width="7" height="7" rx="1.5" />
                  <rect x="14" y="3" width="7" height="7" rx="1.5" />
                  <rect x="3" y="14" width="7" height="7" rx="1.5" />
                  <rect x="14" y="14" width="7" height="7" rx="1.5" />
                </svg>
              </div>

              <div>
                <p className="text-sm font-medium text-slate-500">
                  Selected Space
                </p>

                <h2 className="mt-1 text-xl font-bold text-slate-900">
                  {space?.name || `Space #${id}`}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {space?.type || "Space"}{" "}
                  {space?.location ? `· ${space.location}` : ""}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 self-start rounded-lg bg-slate-50 px-4 py-3 sm:self-auto">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-blue-600 shadow-sm">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="h-5 w-5"
                  aria-hidden="true"
                >
                  <path d="M4 7h16M4 12h16M4 17h10" />
                </svg>
              </div>

              <div>
                <p className="text-xs font-medium text-slate-500">
                  Assigned Facilities
                </p>
                <p className="text-lg font-bold text-slate-900">
                  {loading ? "—" : facilities.length}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Facilities section */}
        <section>
          <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                Assigned Facilities
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Resources currently available in this space.
              </p>
            </div>

            <button
              onClick={loadFacilities}
              disabled={loading}
              className={`${secondaryButton} self-start sm:self-auto`}
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600" />
                  Loading...
                </>
              ) : (
                "Refresh"
              )}
            </button>
          </div>

          {/* Error state */}
          {error && (
            <div
              role="alert"
              className="mb-5 flex flex-col justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-5 sm:flex-row sm:items-center"
            >
              <div>
                <p className="font-semibold text-red-700">
                  Could not load facilities
                </p>
                <p className="mt-1 text-sm text-red-600">{error}</p>
              </div>

              <button
                onClick={loadFacilities}
                disabled={loading}
                className="rounded-lg border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:opacity-60"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Loading state */}
          {loading ? (
            <div className="rounded-xl border border-slate-200 bg-white p-12 text-center shadow-sm">
              <div className="mx-auto mb-4 h-9 w-9 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

              <h3 className="font-semibold text-slate-900">
                Loading facilities
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Retrieving the resources assigned to this space...
              </p>
            </div>
          ) : error ? null : facilities.length === 0 ? (
            /* Empty state */
            <div className="rounded-xl border border-slate-200 bg-white px-5 py-14 text-center shadow-sm">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="h-8 w-8"
                  aria-hidden="true"
                >
                  <rect x="3" y="3" width="7" height="7" rx="1.5" />
                  <rect x="14" y="3" width="7" height="7" rx="1.5" />
                  <rect x="3" y="14" width="7" height="7" rx="1.5" />
                  <rect x="14" y="14" width="7" height="7" rx="1.5" />
                </svg>
              </div>

              <h3 className="mt-5 text-xl font-bold text-slate-900">
                No facilities assigned
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                This space doesn't have any facilities assigned yet. Visit
                Manage Facilities to review available resources.
              </p>

              <button
                onClick={() => navigate("/manager/facilities")}
                className={`${primaryButton} mt-6`}
              >
                Manage Facilities
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
          ) : (
            /* Facilities grid */
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

                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-200">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      Assigned
                    </span>
                  </div>

                  <h3 className="mt-5 break-words text-lg font-bold text-slate-900">
                    {facility.name || "Unnamed Facility"}
                  </h3>

                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    Assigned to this space.
                  </p>

                  <div className="mt-5 border-t border-slate-100 pt-4">
                    <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                      Facility ID
                    </p>

                    <p className="mt-1 text-sm font-semibold text-slate-700">
                      #{facility.facility_id}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* Bottom navigation */}
        <div className="mt-8 flex flex-wrap gap-3">
          <button
            onClick={() => navigate("/manager")}
            className={secondaryButton}
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
              <path d="m15 18-6-6 6-6" />
            </svg>
            Back to Manager
          </button>

          <button
            onClick={() =>
              navigate("/manager/spaces/edit/" + id, {
                state: { space },
              })
            }
            className={secondaryButton}
          >
            Edit Space
          </button>
        </div>
      </main>
    </div>
  );
}

export default SpaceFacilities;