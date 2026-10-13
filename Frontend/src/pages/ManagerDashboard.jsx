
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
    <div className="min-h-screen w-full bg-slate-100 text-slate-900">
      <nav className="flex min-h-[72px] items-center justify-between border-b border-slate-700 bg-slate-900 px-5 py-4 sm:px-8 lg:px-12">
        <button
          onClick={() => navigate("/manager")}
          className="text-xl font-bold text-white sm:text-2xl"
        >
          Smart Space
        </button>

        <div className="flex items-center gap-3 sm:gap-5">
          <span className="text-sm font-semibold text-slate-200 sm:text-base">
            Manager
          </span>

          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="rounded-lg bg-blue-600 px-4 py-2.5 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60 sm:px-5"
          >
            {loggingOut ? "Logging out..." : "Logout"}
          </button>
        </div>
      </nav>

      <main className="w-full px-5 py-8 sm:px-8 sm:py-10 lg:px-12">
        <div className="mb-8 flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Manager Dashboard
            </h1>
            <p className="mt-2 text-slate-500">
              Manage spaces available in your organization.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => navigate("/manager/schedules")}
              className="rounded-lg border border-slate-300 bg-white px-4 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Manage Schedules
            </button>

            <button
              onClick={() => navigate("/manager/facilities")}
              className="rounded-lg border border-slate-300 bg-white px-4 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Manage Facilities
            </button>

            <button
              onClick={() => navigate("/manager/spaces/add")}
              className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
            >
              + Add Space
            </button>
          </div>
        </div>

        <div className="mb-8">
          <div className="w-full rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:max-w-md">
            <p className="text-sm font-medium text-slate-500">
              Total Spaces
            </p>
            <p className="mt-2 text-3xl font-bold text-slate-900">
              {loading ? "..." : spaces.length}
            </p>
          </div>
        </div>

        <div className="mb-5">
          <h2 className="text-2xl font-bold">Your Spaces</h2>
          <p className="mt-1 text-sm text-slate-500">
            View and manage your organization's spaces.
          </p>
        </div>

        {loading ? (
          <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">
            <p className="text-slate-500">Loading spaces...</p>
          </div>
        ) : error ? (
          <div className="rounded-xl border border-red-200 bg-white p-6">
            <p className="text-red-700">{error}</p>
            <button
              onClick={loadSpaces}
              className="mt-4 rounded-lg bg-blue-600 px-5 py-2.5 font-semibold text-white hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        ) : spaces.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white px-5 py-12 text-center">
            <h2 className="text-xl font-bold">No spaces found</h2>
            <p className="mt-2 text-slate-500">
              Add your first space to start managing resources.
            </p>
            <button
              onClick={() => navigate("/manager/spaces/add")}
              className="mt-5 rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
            >
              + Add Your First Space
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {spaces.map((space) => (
              <div
                key={space.space_id}
                className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-xl font-bold">{space.name}</h3>
                    <p className="mt-1 text-sm text-slate-500">
                      {space.type}
                    </p>
                  </div>

                  <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                    Space
                  </span>
                </div>

                <div className="mt-5 space-y-3 border-t border-slate-100 pt-4 text-sm">
                  <p className="flex justify-between gap-3">
                    <span className="text-slate-500">Capacity</span>
                    <span className="font-semibold">{space.capacity}</span>
                  </p>
                  <p className="flex justify-between gap-3">
                    <span className="text-slate-500">Location</span>
                    <span className="text-right font-semibold">
                      {space.location}
                    </span>
                  </p>
                </div>

                <div className="mt-6 grid grid-cols-3 gap-2">
                  <button
                    onClick={() =>
                      navigate(`/manager/spaces/edit/${space.space_id}`, {
                        state: { space },
                      })
                    }
                    className="rounded-lg border border-blue-200 py-2.5 text-sm font-semibold text-blue-700 transition hover:bg-blue-50"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() =>
                      navigate(`/manager/spaces/${space.space_id}/facilities`, {
                        state: { space },
                      })
                    }
                    className="rounded-lg border border-slate-200 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    Facilities
                  </button>

                  <button
                    onClick={() => deleteSpace(space.space_id)}
                    className="rounded-lg border border-red-200 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50"
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
