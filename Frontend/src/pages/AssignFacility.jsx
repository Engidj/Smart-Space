
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
          throw new Error(
            data.message || "Failed to load spaces"
          );
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
      setError("Please select a space");
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
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            facilityId: facility.facility_id
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to assign facility"
        );
      }

      setSuccess("Facility assigned successfully");

      navigate("/manager/facilities", {
        state: {
          message: "Facility assigned successfully"
        }
      });
    } catch (err) {
      setError(err.message || "Failed to assign facility");
    } finally {
      setSaving(false);
    }
  };

  if (!facility) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center bg-white p-8 rounded-xl shadow-sm">
          <h2 className="text-xl font-bold text-slate-900">
            Facility not found
          </h2>

          <p className="text-slate-500 mt-2">
            Open this page from Facility Management.
          </p>

          <button
            onClick={() => navigate("/manager/facilities")}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg"
          >
            Back to Facilities
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-slate-200 px-8 md:px-16 py-5 flex items-center justify-between">
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
            Assign Facility
          </h1>

          <p className="text-slate-500 mt-2 mb-8">
            Assign this facility to a space in your organization.
          </p>

          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6">
            <p className="text-sm text-slate-500">
              Facility
            </p>

            <p className="text-lg font-bold text-slate-900 mt-1">
              {facility.name}
            </p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 text-green-700 p-4 rounded-lg mb-6">
              {success}
            </div>
          )}

          {loading ? (
            <p className="text-slate-500">
              Loading spaces...
            </p>
          ) : (
            <form onSubmit={handleSubmit}>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Select Space
              </label>

              <select
                value={selectedSpace}
                onChange={(e) => setSelectedSpace(e.target.value)}
                required
                className="w-full border border-slate-300 rounded-lg px-4 py-3 outline-none focus:border-blue-500"
              >
                <option value="">Select a space</option>

                {spaces.map((space) => (
                  <option
                    key={space.space_id}
                    value={space.space_id}
                  >
                    {space.name} - {space.location}
                  </option>
                ))}
              </select>

              {!error && spaces.length === 0 && (
                <p className="text-sm text-slate-500 mt-2">
                  No spaces found in your organization.
                </p>
              )}

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
                  disabled={saving || loading || spaces.length === 0}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold disabled:opacity-50"
                >
                  {saving ? "Assigning..." : "Assign Facility"}
                </button>
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}

export default AssignFacility;
