
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

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
        fetch("http://localhost:5000/api/admin/users", {
          credentials: "include",
        }),
        fetch("http://localhost:5000/api/admin/organizations", {
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
      setError(err.message);
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
        `http://localhost:5000/api/admin/users/${userId}/role`,
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
      setError(err.message);
    } finally {
      setSavingUser(null);
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-100 text-slate-900">
      <nav className="flex min-h-[72px] items-center justify-between border-b border-slate-700 bg-slate-900 px-5 py-4 sm:px-8 lg:px-12">
        <button
          onClick={() => navigate("/admin")}
          className="text-xl font-bold text-white sm:text-2xl"
        >
          Smart Space Admin
        </button>

        <button
          onClick={() => navigate("/admin")}
          className="rounded-lg bg-blue-600 px-4 py-2.5 font-semibold text-white transition hover:bg-blue-700 sm:px-5"
        >
          Dashboard
        </button>
      </nav>

      <main className="w-full px-5 py-8 sm:px-8 sm:py-10 lg:px-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            User Management
          </h1>
          <p className="mt-2 text-slate-500">
            Manage user roles and assign organizations to managers.
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

        {message && (
          <div
            role="status"
            className="mb-5 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700"
          >
            {message}
          </div>
        )}

        {loading ? (
          <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">
            <p className="text-slate-500">Loading users...</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full text-left">
              <thead className="bg-slate-900 text-white">
                <tr>
                  <th className="whitespace-nowrap px-5 py-4 text-sm font-semibold">
                    Name
                  </th>
                  <th className="whitespace-nowrap px-5 py-4 text-sm font-semibold">
                    Email
                  </th>
                  <th className="whitespace-nowrap px-5 py-4 text-sm font-semibold">
                    Current Role
                  </th>
                  <th className="whitespace-nowrap px-5 py-4 text-sm font-semibold">
                    Role
                  </th>
                  <th className="whitespace-nowrap px-5 py-4 text-sm font-semibold">
                    Organization
                  </th>
                  <th className="whitespace-nowrap px-5 py-4 text-sm font-semibold">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {users.map((user) => {
                  const role = selectedRoles[user.user_id];
                  const organizationId =
                    selectedOrganizations[user.user_id];

                  return (
                    <tr
                      key={user.user_id}
                      className="border-t border-slate-100 transition hover:bg-slate-50"
                    >
                      <td className="whitespace-nowrap px-5 py-4 font-semibold">
                        {user.name}
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-600">
                        {user.email}
                      </td>

                      <td className="px-5 py-4">
                        <span className="inline-block rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">
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
                          className="rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none focus:border-blue-500"
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
                          className="rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none focus:border-blue-500 disabled:bg-slate-100 disabled:text-slate-400"
                        >
                          <option value="">
                            {role === "manager"
                              ? "Select organization"
                              : "Not applicable"}
                          </option>

                          {organizations.map((organization) => (
                            <option
                              key={organization.organization_id}
                              value={String(organization.organization_id)}
                            >
                              {organization.name}
                            </option>
                          ))}
                        </select>
                      </td>

                      <td className="px-5 py-4">
                        <button
                          onClick={() => saveUser(user.user_id)}
                          disabled={savingUser === user.user_id}
                          className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
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
                    <td
                      colSpan="6"
                      className="px-5 py-10 text-center text-slate-500"
                    >
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}

export default AdminUsers;
