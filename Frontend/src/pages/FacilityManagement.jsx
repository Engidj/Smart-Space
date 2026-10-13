
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
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFacilities();
  }, []);

  return (
    <div className="min-h-screen w-full bg-slate-100 text-slate-900">
      <nav className="flex min-h-[72px] items-center justify-between border-b border-slate-700 bg-slate-900 px-5 py-4 sm:px-8 lg:px-12">
        <button
          onClick={() => navigate("/manager")}
          className="text-xl font-bold text-white sm:text-2xl"
        >
          Smart Space
        </button>

        <div className="flex items-center gap-3 sm:gap-6">
          <button
            onClick={() => navigate("/manager")}
            className="text-sm font-medium text-slate-300 transition hover:text-white sm:text-base"
          >
            Dashboard
          </button>

          <span className="text-sm font-semibold text-blue-400 sm:text-base">
            Facilities
          </span>
        </div>
      </nav>

      <main className="w-full px-5 py-8 sm:px-8 sm:py-10 lg:px-12">
        <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Facility Management
            </h1>
            <p className="mt-2 text-slate-500">
              Manage facilities available in your organization.
            </p>
          </div>

          <button
            onClick={() => navigate("/manager/facilities/add")}
            className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
          >
            + Add Facility
          </button>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-white p-5">
            <p className="text-sm text-red-700">{error}</p>
            <button
              onClick={loadFacilities}
              className="mt-4 rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        )}

        {loading ? (
          <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">
            <p className="text-slate-500">Loading facilities...</p>
          </div>
        ) : !error && facilities.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-12 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-xl font-bold text-blue-600">
              F
            </div>

            <h2 className="mt-4 text-xl font-bold">No facilities found</h2>
            <p className="mt-2 text-slate-500">
              Add a facility to start managing resources.
            </p>

            <button
              onClick={() => navigate("/manager/facilities/add")}
              className="mt-5 rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
            >
              + Add Your First Facility
            </button>
          </div>
        ) : !error ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {facilities.map((facility) => (
              <div
                key={facility.facility_id}
                className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-xl font-bold text-blue-600">
                    F
                  </div>

                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                    Facility
                  </span>
                </div>

                <h2 className="mt-5 text-xl font-bold">{facility.name}</h2>

                <p className="mt-2 text-sm text-slate-500">
                  Facility ID: {facility.facility_id}
                </p>

                <button
                  onClick={() =>
                    navigate("/manager/facilities/assign", {
                      state: { facility },
                    })
                  }
                  className="mt-6 w-full rounded-lg bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700"
                >
                  Assign to Space
                </button>
              </div>
            ))}
          </div>
        ) : null}
      </main>
    </div>
  );
}

export default FacilityManagement;
