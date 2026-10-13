import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";

function ProtectedRoute({ children, allowedRoles }) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch("http://localhost:5000/api/auth/profile", {
      credentials: "include",
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("Authentication failed");
        }

        const data = await response.json();
        setUser(data.user);
      })
      .catch(() => {
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Checking authentication...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const roleHome = {
    admin: "/admin",
    manager: "/manager",
    user: "/home",
  };

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={roleHome[user.role] || "/login"} replace />;
  }

  if (!allowedRoles && user.role !== "user") {
    return <Navigate to={roleHome[user.role] || "/login"} replace />;
  }

  return children;
}

export default ProtectedRoute;