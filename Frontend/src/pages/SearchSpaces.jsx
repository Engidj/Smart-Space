
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

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
    "w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 hover:border-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100";

  const primaryButton =
    "inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60";

  const navLink =
    "rounded-lg px-3 py-2 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400";

  const sectionHeading =
    "text-2xl font-bold tracking-tight text-slate-900";

  return (
    <div className="min-h-screen w-full bg-slate-100 text-slate-900">
      <nav className="sticky top-0 z-20 flex w-full items-center justify-between border-b border-slate-800 bg-slate-900 px-5 py-3 text-white shadow-sm md:px-8">
        <Link
          to="/home"
          className="shrink-0 text-xl font-bold tracking-tight transition hover:text-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
        >
          Smart Space
        </Link>

        <div className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => navigate("/home")}
            className={`${navLink} text-slate-300 hover:bg-slate-800 hover:text-white`}
          >
            Home
          </button>

          <span
            aria-current="page"
            className={`${navLink} bg-blue-600 text-white shadow-sm`}
          >
            Find Space
          </span>

          <button
            onClick={() => navigate("/bookings")}
            className={`${navLink} text-slate-300 hover:bg-slate-800 hover:text-white`}
          >
            <span className="hidden sm:inline">My Bookings</span>
            <span className="sm:hidden">Bookings</span>
          </button>
        </div>
      </nav>

      <main className="mx-auto w-full max-w-7xl px-5 py-8 md:px-8 md:py-10">
        <section className="mb-8">
          <p className="text-xs font-bold uppercase tracking-widest text-blue-700">
            Explore spaces
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Find a Space
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
            Find the right room or workspace by choosing your date, time,
            capacity, location, and required facilities.
          </p>
        </section>

        <form
          onSubmit={searchSpaces}
          className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
        >
          <div className="border-b border-slate-200 px-5 py-5 sm:px-7">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                <svg
                  className="h-6 w-6"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  aria-hidden="true"
                >
                  <circle cx="11" cy="11" r="7" />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m16 16 4 4"
                  />
                </svg>
              </div>

              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Search Requirements
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Select the details for your preferred space.
                </p>
              </div>
            </div>
          </div>

          <div className="p-5 sm:p-7">
            <div className="grid grid-cols-1 gap-x-5 gap-y-5 md:grid-cols-2 lg:grid-cols-3">
              <div>
                <label
                  htmlFor="date"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Date <span className="text-blue-600">*</span>
                </label>
                <input
                  id="date"
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
                <label
                  htmlFor="start_time"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Start Time <span className="text-blue-600">*</span>
                </label>
                <input
                  id="start_time"
                  type="time"
                  name="start_time"
                  value={form.start_time}
                  onChange={handleChange}
                  required
                  className={inputClass}
                />
              </div>

              <div>
                <label
                  htmlFor="end_time"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  End Time <span className="text-blue-600">*</span>
                </label>
                <input
                  id="end_time"
                  type="time"
                  name="end_time"
                  value={form.end_time}
                  onChange={handleChange}
                  required
                  className={inputClass}
                />
              </div>

              <div>
                <label
                  htmlFor="capacity"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Required Capacity <span className="text-blue-600">*</span>
                </label>
                <input
                  id="capacity"
                  type="number"
                  name="capacity"
                  value={form.capacity}
                  onChange={handleChange}
                  min="1"
                  placeholder="e.g. 30 people"
                  required
                  className={inputClass}
                />
              </div>

              <div>
                <label
                  htmlFor="location"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Location
                </label>
                <select
                  id="location"
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
                <label
                  htmlFor="facility"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Required Facility
                </label>
                <select
                  id="facility"
                  name="facility"
                  value={form.facility}
                  onChange={handleChange}
                  className={inputClass}
                >
                  <option value="">Any Facility</option>
                  {facilities.map((facility) => (
                    <option key={facility.facility_id} value={facility.name}>
                      {facility.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {error && (
              <div
                role="alert"
                className="mt-6 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
              >
                <svg
                  className="mt-0.5 h-5 w-5 shrink-0"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="12" r="9" />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 8v5m0 3h.01"
                  />
                </svg>
                <p>{error}</p>
              </div>
            )}

            <div className="mt-7 flex flex-col gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:items-center">
              <button
                type="submit"
                disabled={loading}
                className={primaryButton}
              >
                {loading ? (
                  <>
                    <svg
                      className="h-4 w-4 animate-spin"
                      viewBox="0 0 24 24"
                      fill="none"
                      aria-hidden="true"
                    >
                      <circle
                        cx="12"
                        cy="12"
                        r="9"
                        stroke="currentColor"
                        strokeWidth="3"
                        opacity="0.25"
                      />
                      <path
                        d="M21 12a9 9 0 0 0-9-9"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                      />
                    </svg>
                    Searching...
                  </>
                ) : (
                  <>
                    Search Spaces
                    <span aria-hidden="true">→</span>
                  </>
                )}
              </button>

              <p className="text-xs text-slate-500">
                <span className="text-blue-600">*</span> Required fields
              </p>
            </div>
          </div>
        </form>

        {spaces.length > 0 && (
          <section className="mt-10">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-blue-700">
                  Search results
                </p>
                <h2 className={`${sectionHeading} mt-2`}>
                  Suitable Spaces
                </h2>
                <p className="mt-2 text-sm text-slate-600">
                  Spaces matching your selected requirements.
                </p>
              </div>

              <span className="w-fit rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700">
                {spaces.length} {spaces.length === 1 ? "space" : "spaces"}{" "}
                found
              </span>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              {spaces.map((space) => (
                <article
                  key={space.space_id}
                  className="flex flex-col rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-blue-200 hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="break-words text-xl font-bold text-slate-900">
                        {space.name}
                      </h3>
                      <p className="mt-1.5 text-sm text-slate-500">
                        {space.type}
                      </p>
                    </div>

                    <span className="shrink-0 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-xs font-semibold text-emerald-700">
                      Available
                    </span>
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <div className="rounded-lg bg-slate-50 p-3.5">
                      <p className="text-xs font-medium text-slate-500">
                        Capacity
                      </p>
                      <p className="mt-1 text-base font-bold text-slate-900">
                        {space.capacity}
                      </p>
                    </div>

                    <div className="rounded-lg bg-slate-50 p-3.5">
                      <p className="text-xs font-medium text-slate-500">
                        Location
                      </p>
                      <p className="mt-1 break-words text-sm font-semibold text-slate-900">
                        {space.location || "Not specified"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 flex-1">
                    <p className="mb-3 text-sm font-semibold text-slate-800">
                      Facilities
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {(spaceFacilities[space.space_id] || []).map(
                        (facility) => (
                          <span
                            key={facility.facility_id}
                            className="rounded-lg border border-blue-100 bg-blue-50 px-2.5 py-1.5 text-xs font-medium text-blue-700"
                          >
                            {facility.name}
                          </span>
                        )
                      )}

                      {spaceFacilities[space.space_id]?.length === 0 && (
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
                    className={`${primaryButton} mt-6 w-full`}
                  >
                    View &amp; Book
                    <span aria-hidden="true">→</span>
                  </button>
                </article>
              ))}
            </div>
          </section>
        )}

        {!loading && spaces.length === 0 && form.date && !error && (
          <section className="mt-8 rounded-xl border border-slate-200 bg-white px-6 py-10 text-center shadow-sm sm:px-10">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
              <svg
                className="h-7 w-7"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="7" />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m16 16 4 4"
                />
              </svg>
            </div>

            <h2 className="mt-5 text-xl font-bold text-slate-900">
              No suitable spaces found
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              Try adjusting your time, capacity, location, or facility to find
              more suitable spaces.
            </p>
          </section>
        )}
      </main>
    </div>
  );
}

export default SearchSpaces;
