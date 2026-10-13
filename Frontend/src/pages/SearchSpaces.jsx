
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function SearchSpaces() {
  const navigate = useNavigate();

  const [facilities, setFacilities] = useState([]);
  const [locations, setLocations] = useState([]);
  const [spaces, setSpaces] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [spaceFacilities, setSpaceFacilities] = useState({});

  const [form, setForm] = useState({
    date: "",
    start_time: "",
    end_time: "",
    capacity: "",
    location: "",
    facility: "",
  });

  useEffect(() => {
    const loadFacilities = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/facilities", {
          credentials: "include",
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to load facilities");
        }

        setFacilities(data.facilities || []);
      } catch (error) {
        setError(error.message);
      }
    };

    const loadLocations = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/spaces", {
          credentials: "include",
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to load locations");
        }

        const uniqueLocations = [
          ...new Set(
            (data.spaces || [])
              .map((space) => space.location?.trim())
              .filter(Boolean)
          ),
        ].sort((a, b) => a.localeCompare(b));

        setLocations(uniqueLocations);
      } catch (error) {
        setError(error.message);
      }
    };

    loadFacilities();
    loadLocations();
  }, []);

  const handleChange = (e) => {
    setForm((previousForm) => ({
      ...previousForm,
      [e.target.name]: e.target.value,
    }));
  };

  const searchSpaces = async (e) => {
    e.preventDefault();
    setError("");
    setSpaces([]);
    setSpaceFacilities({});

    if (!form.date || !form.start_time || !form.end_time || !form.capacity) {
      setError("Please fill all required fields");
      return;
    }

    if (form.start_time >= form.end_time) {
      setError("Start time must be before end time");
      return;
    }

    try {
      setLoading(true);

      const params = new URLSearchParams({
        date: form.date,
        start_time: form.start_time,
        end_time: form.end_time,
        capacity: form.capacity,
      });

      if (form.location) params.append("location", form.location);
      if (form.facility) params.append("facility", form.facility);

      const response = await fetch(
        `http://localhost:5000/api/search?${params.toString()}`,
        { credentials: "include" }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Search failed");
      }

      const results = data.spaces || [];
      setSpaces(results);

      const facilityData = {};

      await Promise.all(
        results.map(async (space) => {
          try {
            const facilityResponse = await fetch(
              `http://localhost:5000/api/facilities/space/${space.space_id}`,
              { credentials: "include" }
            );

            const facilityResult = await facilityResponse.json();

            if (!facilityResponse.ok) {
              throw new Error("Failed to load space facilities");
            }

            facilityData[space.space_id] = facilityResult.facilities || [];
          } catch {
            facilityData[space.space_id] = [];
          }
        })
      );

      setSpaceFacilities(facilityData);
    } catch (error) {
      setError(error.message || "Failed to search spaces");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

  return (
    <div className="min-h-screen w-full bg-slate-100 text-slate-900">
      {/* Navbar */}
      <nav className="flex w-full items-center justify-between bg-slate-900 px-5 py-3 text-white md:px-8">
        <button
          onClick={() => navigate("/home")}
          className="text-xl font-bold"
        >
          Smart Space
        </button>

        <div className="flex items-center gap-3 md:gap-6">
          <button
            onClick={() => navigate("/home")}
            className="hidden text-sm text-slate-200 hover:text-white sm:block"
          >
            Home
          </button>

          <span className="text-sm font-semibold text-blue-300">
            Find Space
          </span>

          <button
            onClick={() => navigate("/bookings")}
            className="hidden text-sm text-slate-200 hover:text-white sm:block"
          >
            My Bookings
          </button>
        </div>
      </nav>

      <main className="w-full px-5 py-7 md:px-10">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900">
            Find a Space
          </h1>
          <p className="mt-2 text-slate-600">
            Search for a suitable space based on your requirements.
          </p>
        </div>

        {/* Search form */}
        <form
          onSubmit={searchSpaces}
          className="rounded-xl border border-slate-200 border-t-4 border-t-blue-600 bg-white p-5 shadow-sm md:p-7"
        >
          <h2 className="mb-5 text-lg font-bold text-slate-800">
            Search Requirements
          </h2>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Date
              </label>
              <input
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
                min={new Date().toLocaleDateString("en-CA")}
                required
                className={inputClass}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Start Time
              </label>
              <input
                type="time"
                name="start_time"
                value={form.start_time}
                onChange={handleChange}
                required
                className={inputClass}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                End Time
              </label>
              <input
                type="time"
                name="end_time"
                value={form.end_time}
                onChange={handleChange}
                required
                className={inputClass}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Required Capacity
              </label>
              <input
                type="number"
                name="capacity"
                value={form.capacity}
                onChange={handleChange}
                min="1"
                placeholder="Example: 30"
                required
                className={inputClass}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Location
              </label>
              <select
                name="location"
                value={form.location}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="">All Locations</option>
                {locations.map((location) => (
                  <option key={location} value={location}>
                    {location}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Required Facility
              </label>
              <select
                name="facility"
                value={form.facility}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="">Any facility</option>
                {facilities.map((facility) => (
                  <option key={facility.facility_id} value={facility.name}>
                    {facility.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {error && (
            <div className="mt-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-6 rounded-lg bg-blue-600 px-7 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Searching..." : "Search Spaces"}
          </button>
        </form>

        {/* Search results */}
        {spaces.length > 0 && (
          <section className="mt-9">
            <h2 className="mb-5 text-2xl font-bold text-slate-900">
              Suitable Spaces
            </h2>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              {spaces.map((space) => (
                <div
                  key={space.space_id}
                  className="rounded-xl border border-slate-200 border-t-4 border-t-emerald-500 bg-white p-6 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900">
                        {space.name}
                      </h3>
                      <p className="mt-1 text-sm text-slate-500">
                        {space.type}
                      </p>
                    </div>

                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                      Available
                    </span>
                  </div>

                  <div className="mt-5 space-y-2 text-sm text-slate-600">
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

                  <div className="mt-5">
                    <p className="mb-2 font-semibold text-slate-900">
                      Facilities
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {(spaceFacilities[space.space_id] || []).map(
                        (facility) => (
                          <span
                            key={facility.facility_id}
                            className="rounded-full bg-blue-50 px-3 py-1 text-sm text-blue-700"
                          >
                            {facility.name}
                          </span>
                        )
                      )}

                      {(spaceFacilities[space.space_id] || []).length ===
                        0 && (
                        <span className="text-sm text-slate-500">
                          No facilities listed
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() =>
                      navigate(`/space/${space.space_id}`, {
                        state: { space, booking: form },
                      })
                    }
                    className="mt-6 w-full rounded-lg bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700"
                  >
                    View & Book
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {!loading && spaces.length === 0 && form.date && !error && (
          <div className="mt-8 rounded-xl border border-slate-200 bg-white p-8 text-center">
            <h2 className="text-xl font-bold text-slate-900">
              No suitable spaces found
            </h2>
            <p className="mt-2 text-slate-500">
              Try changing your time, capacity, location, or facility.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

export default SearchSpaces;
