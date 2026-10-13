
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

      setSuccess("Facility assigned successfully");

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

  if (!facility) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 px-5">
        <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-xl font-bold text-blue-600">
            F
          </div>

          <h2 className="mt-4 text-xl font-bold text-slate-900">
            Facility not found
          </h2>

          <p className="mt-2 text-slate-500">
            Open this page from Facility Management.
          </p>

          <button
            onClick={() => navigate("/manager/facilities")}
            className="mt-5 rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
          >
            Back to Facilities
          </button>
        </div>
      </div>
    );
  }

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
              Assign Facility
            </h1>
            <p className="mt-2 text-slate-500">
              Assign a facility to a space in your organization.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-6 rounded-lg border border-blue-100 bg-blue-50 p-4">
              <p className="text-sm font-medium text-slate-500">Selected Facility</p>
              <p className="mt-1 text-lg font-bold text-slate-900">
                {facility.name}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Facility ID: {facility.facility_id}
              </p>
            </div>

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

            {loading ? (
              <p className="py-5 text-center text-slate-500">
                Loading spaces...
              </p>
            ) : (
              <form onSubmit={handleSubmit}>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Select Space
                </label>

                <select
                  value={selectedSpace}
                  onChange={(e) => setSelectedSpace(e.target.value)}
                  required
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">Select a space</option>
                  {spaces.map((space) => (
                    <option key={space.space_id} value={space.space_id}>
                      {space.name} - {space.location}
                    </option>
                  ))}
                </select>

                {spaces.length === 0 && !error && (
                  <p className="mt-2 text-sm text-slate-500">
                    No spaces found in your organization.
                  </p>
                )}

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
                    disabled={saving || loading || spaces.length === 0}
                    className="flex-1 rounded-lg bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {saving ? "Assigning..." : "Assign Facility"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default AssignFacility;
