import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API = "http://localhost:5000/api";

function AdminUsers() {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [selectedRoles, setSelectedRoles] = useState({});
  const [selectedOrganizations, setSelectedOrganizations] = useState({});
  const [loading, setLoading] = useState(true);
  const [savingUser, setSavingUser] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadData = async () => {
    setError("");

    try {
      const [usersResponse, orgsResponse] = await Promise.all([
        fetch(`${API}/admin/users`, {
          credentials: "include",
        }),
        fetch(`${API}/admin/organizations`, {
          credentials: "include",
        }),
      ]);

      const usersData = await usersResponse.json();
      const orgsData = await orgsResponse.json();

      if (!usersResponse.ok) {
        throw new Error(usersData.message || "Failed to load users");
      }

      if (!orgsResponse.ok) {
        throw new Error(
          orgsData.message || "Failed to load organizations"
        );
      }

      const loadedUsers = usersData.users || [];
      const loadedOrganizations = orgsData.organizations || [];

      setUsers(loadedUsers);
      setOrganizations(loadedOrganizations);

      const roles = {};
      const orgIds = {};

      loadedUsers.forEach((user) => {
        roles[user.user_id] = user.role;
        orgIds[user.user_id] =
          user.organization_id == null
            ? ""
            : String(user.organization_id);
      });

      setSelectedRoles(roles);
      setSelectedOrganizations(orgIds);
    } catch (err) {
      setError(err.message || "Something went wrong while loading data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const saveUser = async (userId) => {
    setError("");
    setMessage("");

    const role = selectedRoles[userId];
    const organizationId = selectedOrganizations[userId];

    if (role === "manager" && !organizationId) {
      setError("Please select an organization for this manager.");
      return;
    }

    setSavingUser(userId);

    try {
      const response = await fetch(
        `${API}/admin/users/${userId}/role`,
        {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            role,
            organization_id:
              role === "manager" ? Number(organizationId) : null,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update user");
      }

      setMessage(data.message || "User updated successfully.");
      await loadData();
    } catch (err) {
      setError(err.message || "Failed to update user.");
    } finally {
      setSavingUser(null);
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-100 text-slate-900">
      {/* Navbar */}
      <nav className="flex min-h-[72px] items-center justify-between border-b border-slate-700 bg-slate-900 px-5 py-4 sm:px-8 lg:px-12">
        <button
          onClick={() => navigate("/admin")}
          className="text-xl font-bold text-white transition hover:text-blue-300 sm:text-2xl"
        >
          Smart Space
        </button>

        <div className="flex items-center gap-3">
          <span className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white sm:px-4">
            Admin
          </span>

          <button
            onClick={() => navigate("/admin")}
            className="rounded-lg bg-slate-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-600 sm:px-5"
          >
            Dashboard
          </button>
        </div>
      </nav>

      <main className="w-full px-5 py-8 sm:px-8 sm:py-10 lg:px-12">
        {/* Page heading */}
        <div className="mb-8">
          <div className="mb-3 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.8}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17 20h5v-2a4 4 0 00-5.5-3.72M17 20H7m10 0v-2c0-.7-.14-1.37-.39-1.98M7 20H2v-2a4 4 0 015.5-3.72M7 20v-2c0-.7.14-1.37.39-1.98m0 0a5 5 0 019.22 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm5 3a2 2 0 11-4 0 2 2 0 014 0zM6 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>

            <div>
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                User Management
              </h1>
              <p className="mt-1 text-sm text-slate-500 sm:text-base">
                Manage user roles and organization assignments.
              </p>
            </div>
          </div>
        </div>

        {/* Feedback messages */}
        {error && (
          <div
            role="alert"
            className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="mt-0.5 h-5 w-5 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
              />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {message && (
          <div
            role="status"
            className="mb-6 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="mt-0.5 h-5 w-5 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
            <span>{message}</span>
          </div>
        )}

        {/* Users section */}
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-violet-100 bg-violet-50 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div>
              <h2 className="text-lg font-bold text-violet-950">
                All Users
              </h2>
              <p className="mt-1 text-sm text-violet-700">
                Update roles and assign organizations to managers.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="rounded-lg border border-violet-200 bg-white px-3 py-2 text-sm font-semibold text-violet-800">
                {loading ? "Loading..." : `${users.length} users`}
              </span>

              <button
                onClick={loadData}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 4v5h5M20 20v-5h-5M5.64 18.36A8 8 0 004 12a8 8 0 0114.9-4M18.36 5.64A8 8 0 0120 12a8 8 0 01-14.9 4"
                  />
                </svg>
                Refresh
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center px-6 py-16">
              <div className="h-9 w-9 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />
              <p className="mt-4 font-medium text-slate-700">
                Loading users...
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Please wait while we retrieve the user list.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px] text-left">
                <thead className="bg-slate-50">
                  <tr className="border-b border-slate-200">
                    <th className="whitespace-nowrap px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                      Name
                    </th>
                    <th className="whitespace-nowrap px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                      Email
                    </th>
                    <th className="whitespace-nowrap px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                      Current Role
                    </th>
                    <th className="whitespace-nowrap px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                      New Role
                    </th>
                    <th className="whitespace-nowrap px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                      Organization
                    </th>
                    <th className="whitespace-nowrap px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {users.map((user) => {
                    const role = selectedRoles[user.user_id];
                    const organizationId =
                      selectedOrganizations[user.user_id];

                    return (
                      <tr
                        key={user.user_id}
                        className="transition hover:bg-blue-50/40"
                      >
                        <td className="whitespace-nowrap px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold uppercase text-blue-700">
                              {(user.name || "U")
                                .trim()
                                .charAt(0)}
                            </div>
                            <span className="font-semibold text-slate-900">
                              {user.name}
                            </span>
                          </div>
                        </td>

                        <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600">
                          {user.email}
                        </td>

                        <td className="whitespace-nowrap px-5 py-4">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                              user.role === "admin"
                                ? "bg-red-50 text-red-700"
                                : user.role === "manager"
                                ? "bg-violet-50 text-violet-700"
                                : "bg-blue-50 text-blue-700"
                            }`}
                          >
                            {user.role}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <select
                            value={role || "user"}
                            onChange={(e) =>
                              setSelectedRoles((previous) => ({
                                ...previous,
                                [user.user_id]: e.target.value,
                              }))
                            }
                            className="w-32 rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                          >
                            <option value="user">User</option>
                            <option value="manager">Manager</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>

                        <td className="px-5 py-4">
                          <select
                            value={organizationId || ""}
                            disabled={role !== "manager"}
                            onChange={(e) =>
                              setSelectedOrganizations((previous) => ({
                                ...previous,
                                [user.user_id]: e.target.value,
                              }))
                            }
                            className="w-48 rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                          >
                            <option value="">
                              {role === "manager"
                                ? "Select organization"
                                : "Not applicable"}
                            </option>

                            {organizations.map((organization) => (
                              <option
                                key={organization.organization_id}
                                value={String(
                                  organization.organization_id
                                )}
                              >
                                {organization.name}
                              </option>
                            ))}
                          </select>
                        </td>

                        <td className="whitespace-nowrap px-5 py-4">
                          <button
                            onClick={() => saveUser(user.user_id)}
                            disabled={savingUser === user.user_id}
                            className="inline-flex min-w-[90px] items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {savingUser === user.user_id && (
                              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                            )}
                            {savingUser === user.user_id
                              ? "Saving..."
                              : "Save"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}

                  {users.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-5 py-16 text-center">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-7 w-7"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={1.7}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M17 20h5v-2a4 4 0 00-5.5-3.72M17 20H7m10 0v-2c0-.7-.14-1.37-.39-1.98M7 20H2v-2a4 4 0 015.5-3.72M7 20v-2c0-.7.14-1.37.39-1.98m0 0a5 5 0 019.22 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                        </div>
                        <h3 className="mt-4 font-semibold text-slate-800">
                          No users found
                        </h3>
                        <p className="mt-1 text-sm text-slate-500">
                          Users will appear here when they are available.
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default AdminUsers;