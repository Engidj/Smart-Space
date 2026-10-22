import { Link } from "react-router-dom";

function About() {
  const features = [
    {
      icon: "🔍",
      title: "Search Spaces",
      description:
        "Find suitable spaces based on your preferred location, date, time, and capacity.",
    },
    {
      icon: "📅",
      title: "Easy Booking",
      description:
        "Book available spaces and keep track of your reservations in one place.",
    },
    {
      icon: "🏢",
      title: "Facility Management",
      description:
        "Manage facilities and discover the amenities available in different spaces.",
    },
    {
      icon: "📊",
      title: "Admin Dashboard",
      description:
        "Monitor users, organizations, spaces, bookings, and platform activity.",
    },
  ];

  const steps = [
    {
      number: "01",
      title: "Search",
      description: "Choose your location, date, time, and required capacity.",
    },
    {
      number: "02",
      title: "Select",
      description: "Explore the available spaces and choose the right one.",
    },
    {
      number: "03",
      title: "Book",
      description: "Submit your booking request for the selected space.",
    },
    {
      number: "04",
      title: "Manage",
      description: "Keep track of your bookings whenever you need to.",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      {/* Navbar */}
      <nav className="flex w-full items-center justify-between bg-slate-900 px-5 py-4 text-white md:px-8">
        <Link to="/home" className="text-xl font-bold">
          Smart Space
        </Link>

        <Link
          to="/home"
          className="rounded-lg px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          Home
        </Link>
      </nav>

      <main className="mx-auto max-w-6xl px-5 py-10 md:px-8 md:py-14">
        {/* About Introduction */}
        <section className="rounded-2xl bg-white p-7 shadow-sm ring-1 ring-slate-200 md:p-12">
          <span className="inline-flex rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700">
            About Our Platform
          </span>

          <h1 className="mt-5 text-3xl font-bold tracking-tight text-slate-900 md:text-5xl">
            Making Space Management
            <span className="block text-blue-600">Simple and Efficient</span>
          </h1>

          <p className="mt-5 max-w-3xl text-base leading-7 text-slate-600 md:text-lg">
            Smart Space is a platform designed to make finding, booking, and
            managing spaces easier. It helps users discover suitable spaces
            based on their requirements while providing tools to manage
            bookings and facilities efficiently.
          </p>
        </section>

        {/* Mission */}
        <section className="mt-10 grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm md:p-9">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-2xl">
              🎯
            </div>

            <h2 className="text-2xl font-bold text-slate-900">
              Our Mission
            </h2>

            <p className="mt-3 leading-7 text-slate-600">
              Our mission is to simplify space discovery and booking through
              an organized platform that saves time, improves accessibility,
              and makes resource management more convenient.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm md:p-9">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-2xl">
              🌱
            </div>

            <h2 className="text-2xl font-bold text-slate-900">
              Our Goal
            </h2>

            <p className="mt-3 leading-7 text-slate-600">
              We aim to make better use of available spaces by helping users
              identify suitable options and helping administrators organize
              spaces, facilities, and bookings effectively.
            </p>
          </div>
        </section>

        {/* Features */}
        <section className="mt-14">
          <div className="mb-7">
           

            <h2 className="mt-2 text-3xl font-bold text-slate-900">
              Key Features
            </h2>

            <p className="mt-3 max-w-2xl leading-7 text-slate-600">
              Everything is organized in one place to make space discovery
              and management more convenient.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-2xl">
                  {feature.icon}
                </div>

                <h3 className="mt-5 text-lg font-bold text-slate-900">
                  {feature.title}
                </h3>

                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* How It Works */}
        <section className="mt-14 rounded-2xl bg-slate-900 p-7 text-white md:p-10">
          <p className="text-sm font-semibold uppercase tracking-wider text-blue-300">
            Simple Process
          </p>

          <h2 className="mt-2 text-3xl font-bold">How It Works</h2>

          <p className="mt-3 max-w-2xl leading-7 text-slate-300">
            Finding and booking a suitable space can be completed in four
            straightforward steps.
          </p>

          <div className="mt-9 grid gap-7 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step) => (
              <div
                key={step.number}
                className="border-l-2 border-blue-500 pl-5"
              >
                <span className="text-sm font-bold text-blue-300">
                  STEP {step.number}
                </span>

                <h3 className="mt-3 text-xl font-bold">{step.title}</h3>

                <p className="mt-2 text-sm leading-6 text-slate-300">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

export default About;