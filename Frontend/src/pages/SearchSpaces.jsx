
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
        facility: ""
    });

    useEffect(() => {
        const loadFacilities = async () => {
            try {
                const response = await fetch(
                    "http://localhost:5000/api/facilities",
                    { credentials: "include" }
                );

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(
                        data.message || "Failed to load facilities"
                    );
                }

                setFacilities(data.facilities || []);
            } catch (error) {
                setError(error.message);
            }
        };

        const loadLocations = async () => {
            try {
                const response = await fetch(
                    "http://localhost:5000/api/spaces",
                    { credentials: "include" }
                );

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(
                        data.message || "Failed to load locations"
                    );
                }

                const uniqueLocations = [
                    ...new Set(
                        (data.spaces || [])
                            .map((space) => space.location?.trim())
                            .filter(Boolean)
                    )
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
            [e.target.name]: e.target.value
        }));
    };

    const searchSpaces = async (e) => {
        e.preventDefault();

        setError("");
        setSpaces([]);
        setSpaceFacilities({});

        if (
            !form.date ||
            !form.start_time ||
            !form.end_time ||
            !form.capacity
        ) {
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
                capacity: form.capacity
            });

            if (form.location) {
                params.append("location", form.location);
            }

            if (form.facility) {
                params.append("facility", form.facility);
            }

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
                            throw new Error(
                                facilityResult.message ||
                                "Failed to load space facilities"
                            );
                        }

                        facilityData[space.space_id] =
                            facilityResult.facilities || [];
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

    return (
        <div className="min-h-screen bg-slate-50">
            <nav className="h-18 bg-white border-b border-slate-200 flex items-center justify-between px-8 md:px-16">
                <button
                    onClick={() => navigate("/home")}
                    className="text-2xl font-bold text-slate-900"
                >
                    Smart Space
                </button>

                <div className="flex items-center gap-6">
                    <button
                        onClick={() => navigate("/home")}
                        className="text-slate-700 hover:text-blue-600"
                    >
                        Home
                    </button>

                    <button className="text-blue-600 font-semibold">
                        Find Space
                    </button>

                    <button
                        onClick={() => navigate("/bookings")}
                        className="text-slate-700 hover:text-blue-600"
                    >
                        My Bookings
                    </button>
                </div>
            </nav>

            <main className="max-w-6xl mx-auto px-6 py-12">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-slate-900">
                        Find a Space
                    </h1>

                    <p className="text-slate-500 mt-2">
                        Search for a suitable space based on your requirements.
                    </p>
                </div>

                <form
                    onSubmit={searchSpaces}
                    className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm"
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Date
                            </label>

                            <input
                                type="date"
                                name="date"
                                value={form.date}
                                onChange={handleChange}
                                min={new Date().toLocaleDateString("en-CA")}
                                required
                                className="w-full border border-slate-300 rounded-lg px-4 py-3"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Start Time
                            </label>

                            <input
                                type="time"
                                name="start_time"
                                value={form.start_time}
                                onChange={handleChange}
                                required
                                className="w-full border border-slate-300 rounded-lg px-4 py-3"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                End Time
                            </label>

                            <input
                                type="time"
                                name="end_time"
                                value={form.end_time}
                                onChange={handleChange}
                                required
                                className="w-full border border-slate-300 rounded-lg px-4 py-3"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
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
                                className="w-full border border-slate-300 rounded-lg px-4 py-3"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Location
                            </label>

                            <select
                                name="location"
                                value={form.location}
                                onChange={handleChange}
                                className="w-full border border-slate-300 rounded-lg px-4 py-3"
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
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Required Facility
                            </label>

                            <select
                                name="facility"
                                value={form.facility}
                                onChange={handleChange}
                                className="w-full border border-slate-300 rounded-lg px-4 py-3"
                            >
                                <option value="">Any facility</option>

                                {facilities.map((facility) => (
                                    <option
                                        key={facility.facility_id}
                                        value={facility.name}
                                    >
                                        {facility.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-50 text-red-600 p-4 rounded-lg mt-5">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold disabled:opacity-50"
                    >
                        {loading ? "Searching..." : "Search Spaces"}
                    </button>
                </form>

                {spaces.length > 0 && (
                    <div className="mt-10">
                        <h2 className="text-2xl font-bold text-slate-900 mb-5">
                            Suitable Spaces
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {spaces.map((space) => (
                                <div
                                    key={space.space_id}
                                    className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm"
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="text-xl font-bold text-slate-900">
                                                {space.name}
                                            </h3>

                                            <p className="text-slate-500 mt-1">
                                                {space.type}
                                            </p>
                                        </div>

                                        <span className="bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full">
                                            Available
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

                                    <div className="mt-5">
                                        <p className="font-semibold text-slate-900 mb-2">
                                            Facilities
                                        </p>

                                        <div className="flex flex-wrap gap-2">
                                            {(spaceFacilities[space.space_id] || []).map(
                                                (facility) => (
                                                    <span
                                                        key={facility.facility_id}
                                                        className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm"
                                                    >
                                                        {facility.name}
                                                    </span>
                                                )
                                            )}
                                        </div>
                                    </div>

                                    <button
                                        onClick={() =>
                                            navigate(`/space/${space.space_id}`, {
                                                state: {
                                                    space,
                                                    booking: form
                                                }
                                            })
                                        }
                                        className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold"
                                    >
                                        View & Book
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {!loading && spaces.length === 0 && form.date && !error && (
                    <div className="bg-white border border-slate-200 rounded-xl p-10 text-center mt-8">
                        <h2 className="text-xl font-bold text-slate-900">
                            No suitable spaces found
                        </h2>

                        <p className="text-slate-500 mt-2">
                            Try changing your time, capacity, location, or facility.
                        </p>
                    </div>
                )}
            </main>
        </div>
    );
}

export default SearchSpaces;
