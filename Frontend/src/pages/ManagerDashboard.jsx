
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

function ManagerDashboard() {
  const navigate = useNavigate();
  const [spaces, setSpaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const [error, setError] = useState("");

  const loadSpaces = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("http://localhost:5000/api/spaces", {
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load spaces");
      }

      setSpaces(data.spaces || []);
    } catch (error) {
      console.error("Load spaces error:", error);
      setError(error.message || "Failed to load spaces");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSpaces();
  }, []);

  const handleLogout = async () => {
    setLoggingOut(true);

    try {
      await fetch("http://localhost:5000/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      navigate("/login", { replace: true });
      window.location.reload();
    }
  };

  const deleteSpace = async (spaceId) => {
    if (!window.confirm("Are you sure you want to delete this space?")) {
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/spaces/${spaceId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete space");
      }

      await loadSpaces();
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="min-h-[72px] bg-white border-b border-slate-200 flex items-center justify-between px-6 md:px-16 py-3">
        <button
          onClick={() => navigate("/manager")}
          className="text-2xl font-bold text-slate-900"
        >
          Smart Space
        </button>

        <div className="flex items-center gap-4">
          <span className="text-blue-600 font-semibold">Manager</span>

          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="bg-slate-900 hover:bg-slate-700 text-white px-5 py-2.5 rounded-lg font-semibold disabled:opacity-60"
          >
            {loggingOut ? "Logging out..." : "Logout"}
          </button>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <h1 className="text-4xl font-bold text-slate-900">
              Manager Dashboard
            </h1>
            <p className="text-slate-500 mt-2">
              Manage spaces available in your organization.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => navigate("/manager/schedules")}
              className="border border-purple-300 text-purple-600 hover:bg-purple-50 px-6 py-3 rounded-lg font-semibold"
            >
              Manage Schedules
            </button>

            <button
              onClick={() => navigate("/manager/facilities")}
              className="border border-blue-300 text-blue-600 hover:bg-blue-50 px-6 py-3 rounded-lg font-semibold"
            >
              Manage Facilities
            </button>

            <button
              onClick={() => navigate("/manager/spaces/add")}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold"
            >
              Add Space
            </button>
          </div>
        </div>

        {loading ? (
          <div className="bg-white border border-slate-200 rounded-xl p-10 text-center">
            <p className="text-slate-500">Loading spaces...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6">
            <p className="text-red-700">{error}</p>
            <button
              onClick={loadSpaces}
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-semibold"
            >
              Retry
            </button>
          </div>
        ) : spaces.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
            <h2 className="text-xl font-bold text-slate-900">
              No spaces found
            </h2>
            <p className="text-slate-500 mt-2">
              Add your first space to start managing resources.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {spaces.map((space) => (
              <div
                key={space.space_id}
                className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">
                      {space.name}
                    </h2>
                    <p className="text-slate-500 mt-1">{space.type}</p>
                  </div>

                  <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full">
                    Space
                  </span>
                </div>

                <div className="mt-5 space-y-2 text-slate-600">
                  <p>
                    <span className="font-semibold text-slate-900">
                      Capacity:
                    </span>{" "}
                    {space.capacity}
                  </p>
                  <p>
                    <span className="font-semibold text-slate-900">
                      Location:
                    </span>{" "}
                    {space.location}
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-3 mt-6">
                  <button
                    onClick={() =>
                      navigate(`/manager/spaces/edit/${space.space_id}`, {
                        state: { space },
                      })
                    }
                    className="border border-blue-300 text-blue-600 hover:bg-blue-50 py-3 rounded-lg font-semibold"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() =>
                      navigate(`/manager/spaces/${space.space_id}/facilities`, {
                        state: { space },
                      })
                    }
                    className="border border-slate-300 text-slate-700 hover:bg-slate-50 py-3 rounded-lg font-semibold"
                  >
                    Facilities
                  </button>

                  <button
                    onClick={() => deleteSpace(space.space_id)}
                    className="border border-red-300 text-red-600 hover:bg-red-50 py-3 rounded-lg font-semibold"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default ManagerDashboard;
