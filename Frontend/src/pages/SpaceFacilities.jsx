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
  }, [id]);

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

      <main className="max-w-5xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900">
            Space Facilities
          </h1>

          <p className="text-slate-500 mt-2">
            {space?.name || "Space"} facilities and resources.
          </p>
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
              No facilities assigned
            </h2>

            <p className="text-slate-500 mt-2">
              This space does not have any facilities yet.
            </p>

            <button
              onClick={() => navigate("/manager/facilities")}
              className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold"
            >
              Manage Facilities
            </button>
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
                  Available in this space
                </p>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={() => navigate("/manager")}
          className="mt-8 border border-slate-300 text-slate-700 hover:bg-white px-6 py-3 rounded-lg font-semibold"
        >
          Back to Manager
        </button>
      </main>
    </div>
  );
}

export default SpaceFacilities;