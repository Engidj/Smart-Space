import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const SPACE_TYPES = [
  "Classroom",
  "Laboratory",
  "Seminar Hall",
  "Conference Room",
  "Meeting Room",
  "Auditorium",
  "Computer Lab",
  "Library",
  "Training Room",
  "Lecture Hall",
  "Discussion Room",
  "Innovation Lab",
  "Recording Studio",
  "Exam Hall",
  "Multipurpose Hall",
];

function SpaceTypeDropdown({
  value,
  onChange,
  disabled,
  inputClass,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleOutsideClick(event) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setIsOpen(false);
        setSearch("");
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  const filteredTypes = SPACE_TYPES.filter((type) =>
    type.toLowerCase().includes(search.toLowerCase().trim())
  );

  function selectType(type) {
    onChange({
      target: {
        name: "type",
        value: type,
      },
    });

    setIsOpen(false);
    setSearch("");
  }

  return (
    <div ref={dropdownRef} className="relative w-full">
      <button
        id="space-type"
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((previous) => !previous)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`${inputClass} flex items-center justify-between gap-3 text-left`}
      >
        <span className={value ? "text-slate-800" : "text-slate-400"}>
          {value || "Select a space type"}
        </span>

        <svg
          className={`h-5 w-5 shrink-0 text-slate-500 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <path
            d="m6 9 6 6 6-6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {isOpen && !disabled && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
          {/* Search */}
          <div className="border-b border-slate-100 p-2">
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Escape") {
                  setIsOpen(false);
                  setSearch("");
                }
              }}
              placeholder="Search space types..."
              autoFocus
              aria-label="Search space types"
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* Fixed-height scrollable list */}
          <div
            role="listbox"
            aria-label="Space types"
            className="max-h-48 overflow-y-auto overscroll-contain p-1"
          >
            {filteredTypes.length > 0 ? (
              filteredTypes.map((type) => (
                <button
                  key={type}
                  type="button"
                  role="option"
                  aria-selected={value === type}
                  onClick={() => selectType(type)}
                  className={`w-full rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                    value === type
                      ? "bg-blue-50 font-semibold text-blue-700"
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <span>{type}</span>

                  {value === type && (
                    <span className="float-right text-blue-600">✓</span>
                  )}
                </button>
              ))
            ) : (
              <p className="px-3 py-4 text-center text-sm text-slate-500">
                No space types found.
              </p>
            )}
          </div>

          <div className="border-t border-slate-100 bg-slate-50 px-3 py-2 text-xs text-slate-500">
            {filteredTypes.length} space types available
          </div>
        </div>
      )}
    </div>
  );
}

function AddSpace() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    organization_id: "1",
    name: "",
    type: "",
    capacity: "",
    location: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((previous) => ({
      ...previous,
      [e.target.name]: e.target.value,
    }));

    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (
      !form.name.trim() ||
      !form.type ||
      !form.capacity ||
      !form.location.trim()
    ) {
      setError("Please complete all required fields.");
      return;
    }

    if (
      !Number.isInteger(Number(form.capacity)) ||
      Number(form.capacity) < 1
    ) {
      setError("Capacity must be a whole number greater than zero.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/spaces", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          organization_id: Number(form.organization_id),
          name: form.name.trim(),
          type: form.type,
          capacity: Number(form.capacity),
          location: form.location.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create space");
      }

      setSuccess("Space created successfully.");

      setTimeout(() => {
        navigate("/manager");
      }, 1000);
    } catch (error) {
      setError(error.message || "Failed to create space");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 hover:border-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100";

  const primaryButton =
    "inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60";

  const secondaryButton =
    "inline-flex flex-1 items-center justify-center rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 disabled:cursor-not-allowed disabled:opacity-60";

  const navLink =
    "rounded-lg px-3 py-2 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400";

  return (
    <div className="min-h-screen w-full bg-slate-100 text-slate-900">
      {/* Navbar */}
      <nav className="sticky top-0 z-20 flex min-h-[64px] w-full items-center justify-between border-b border-slate-800 bg-slate-900 px-5 py-3 text-white shadow-sm md:px-8">
        <button
          type="button"
          onClick={() => navigate("/manager")}
          className="shrink-0 text-xl font-bold tracking-tight transition hover:text-blue-200"
        >
          Smart Space
        </button>

        <div className="flex items-center gap-1 sm:gap-2">
          <button
            type="button"
            onClick={() => navigate("/manager")}
            className={`${navLink} text-slate-300 hover:bg-slate-800 hover:text-white`}
          >
            Dashboard
          </button>

          <span
            aria-current="page"
            className={`${navLink} bg-blue-600 text-white shadow-sm`}
          >
            Add Space
          </span>
        </div>
      </nav>

      <main className="w-full px-5 py-8 md:px-8 md:py-10 lg:px-12">
        {/* Page Heading */}
        <div className="mb-7">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Add Space
          </h1>

          <p className="mt-2 text-sm text-slate-600 sm:text-base">
            Enter the details to add a new space to your organization.
          </p>
        </div>

        {/* Form Card */}
        <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-6 p-5 sm:p-8">
            {error && (
              <div
                role="alert"
                className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
              >
                {error}
              </div>
            )}

            {success && (
              <div
                role="status"
                className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"
              >
                {success} Redirecting to the dashboard...
              </div>
            )}

            {/* Space Name */}
            <div>
              <label
                htmlFor="space-name"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Space Name <span className="text-red-500">*</span>
              </label>

              <input
                id="space-name"
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. Seminar Hall 2"
                maxLength={100}
                required
                disabled={loading || Boolean(success)}
                className={inputClass}
              />
            </div>

            {/* Space Type */}
            <div>
              <label
                htmlFor="space-type"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Space Type <span className="text-red-500">*</span>
              </label>

              <SpaceTypeDropdown
                value={form.type}
                onChange={handleChange}
                disabled={loading || Boolean(success)}
                inputClass={inputClass}
              />
            </div>

            {/* Capacity and Location */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="space-capacity"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Capacity <span className="text-red-500">*</span>
                </label>

                <input
                  id="space-capacity"
                  type="number"
                  name="capacity"
                  value={form.capacity}
                  onChange={handleChange}
                  placeholder="e.g. 50"
                  min="1"
                  step="1"
                  required
                  disabled={loading || Boolean(success)}
                  className={inputClass}
                />

                <p className="mt-1.5 text-xs text-slate-500">
                  Maximum number of people.
                </p>
              </div>

              <div>
                <label
                  htmlFor="space-location"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Location <span className="text-red-500">*</span>
                </label>

                <input
                  id="space-location"
                  type="text"
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  placeholder="e.g. Block B, Floor 2"
                  maxLength={150}
                  required
                  disabled={loading || Boolean(success)}
                  className={inputClass}
                />

                <p className="mt-1.5 text-xs text-slate-500">
                  Building, block, floor, or room.
                </p>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row">
              <button
                type="button"
                onClick={() => navigate("/manager")}
                disabled={loading}
                className={secondaryButton}
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading || Boolean(success)}
                className={primaryButton}
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    Creating Space...
                  </>
                ) : success ? (
                  "Created Successfully"
                ) : (
                  "Create Space"
                )}
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}

export default AddSpace;