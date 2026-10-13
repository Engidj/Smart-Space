
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
          credentials: "include"
        }),
        fetch("http://localhost:5000/api/admin/organizations", {
          credentials: "include"
        })
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
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            role,
            organization_id:
              role === "manager" ? Number(organizationId) : null
          })
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
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-slate-200 px-8 py-5 flex justify-between items-center">
        <button
          onClick={() => navigate("/admin")}
          className="text-2xl font-bold text-slate-900"
        >
          Smart Space Admin
        </button>

        <button
          onClick={() => navigate("/admin")}
          className="text-blue-600 font-semibold"
        >
          Dashboard
        </button>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold text-slate-900">
          User Management
        </h1>

        <p className="text-slate-500 mt-2 mb-8">
          Manage user roles and assign organizations to managers.
        </p>

        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-5">
            {error}
          </div>
        )}

        {message && (
          <div className="bg-green-50 text-green-700 p-4 rounded-lg mb-5">
            {message}
          </div>
        )}

        {loading ? (
          <p className="text-slate-500">Loading users...</p>
        ) : (
          <div className="bg-white border border-slate-200 rounded-xl overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-100">
                <tr>
                  <th className="p-4">Name</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Current Role</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Organization</th>
                  <th className="p-4">Action</th>
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
                      className="border-t border-slate-100"
                    >
                      <td className="p-4 font-medium">{user.name}</td>

                      <td className="p-4 text-slate-600">
                        {user.email}
                      </td>

                      <td className="p-4">
                        <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
                          {user.role}
                        </span>
                      </td>

                      <td className="p-4">
                        <select
                          value={role || "user"}
                          onChange={(e) =>
                            setSelectedRoles((previous) => ({
                              ...previous,
                              [user.user_id]: e.target.value
                            }))
                          }
                          className="border border-slate-300 rounded-lg px-3 py-2"
                        >
                          <option value="user">User</option>
                          <option value="manager">Manager</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>

                      <td className="p-4">
                        <select
                          value={organizationId || ""}
                          disabled={role !== "manager"}
                          onChange={(e) =>
                            setSelectedOrganizations((previous) => ({
                              ...previous,
                              [user.user_id]: e.target.value
                            }))
                          }
                          className="border border-slate-300 rounded-lg px-3 py-2 disabled:bg-slate-100 disabled:text-slate-400"
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

                      <td className="p-4">
                        <button
                          onClick={() => saveUser(user.user_id)}
                          disabled={savingUser === user.user_id}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg disabled:opacity-50"
                        >
                          {savingUser === user.user_id
                            ? "Saving..."
                            : "Save"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {users.length === 0 && (
              <p className="p-6 text-slate-500">No users found.</p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default AdminUsers;
