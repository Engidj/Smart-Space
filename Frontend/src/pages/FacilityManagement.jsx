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
          credentials: "include"
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
    <div className="min-h-screen bg-slate-50">
      <nav className="h-18 bg-white border-b border-slate-200 flex items-center justify-between px-8 md:px-16">
        <button
          onClick={() => navigate("/manager")}
          className="text-2xl font-bold text-slate-900"
        >
          Smart Space
        </button>

        <div className="flex items-center gap-6">
          <button
            onClick={() => navigate("/manager")}
            className="text-slate-700 hover:text-blue-600"
          >
            Manager Dashboard
          </button>

          <button
            className="text-blue-600 font-semibold"
          >
            Facilities
          </button>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-slate-900">
              Facility Management
            </h1>

            <p className="text-slate-500 mt-2">
              Manage facilities available in your organization.
            </p>
          </div>

          <button
            onClick={() => navigate("/manager/facilities/add")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold"
          >
            Add Facility
          </button>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <div className="bg-white border border-slate-200 rounded-xl p-10 text-center">
            <p className="text-slate-500">
              Loading facilities...
            </p>
          </div>
        ) : facilities.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
            <h2 className="text-xl font-bold text-slate-900">
              No facilities found
            </h2>

            <p className="text-slate-500 mt-2">
              Add a facility to start managing resources.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {facilities.map((facility) => (
              <div
                key={facility.facility_id}
                className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm"
              >
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center text-xl font-bold">
                  F
                </div>

                <h2 className="text-xl font-bold text-slate-900 mt-5">
                  {facility.name}
                </h2>

                <p className="text-slate-500 mt-1">
                  Facility ID: {facility.facility_id}
                </p>

                <button
                  onClick={() =>
                    navigate("/manager/facilities/assign", {
                      state: { facility }
                    })
                  }
                  className="w-full mt-6 bg-slate-900 hover:bg-slate-800 text-white py-3 rounded-lg font-semibold"
                >
                  Assign to Space
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default FacilityManagement;