import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

function GuestRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    let active = true;

    const checkSession = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/api/auth/profile",
          { credentials: "include" }
        );

        if (!response.ok) {
          if (active) setUser(null);
          return;
        }

        const data = await response.json();

        if (active) {
          setUser(data.user || null);
        }
      } catch {
        if (active) setUser(null);
      } finally {
        if (active) setLoading(false);
      }
    };

    checkSession();

    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Checking your session...
      </div>
    );
  }

  if (user?.role === "admin") {
    return <Navigate to="/admin" replace />;
  }

  if (user?.role === "manager") {
    return <Navigate to="/manager" replace />;
  }

  if (user?.role === "user") {
    return <Navigate to="/home" replace />;
  }

  return children;
}

export default GuestRoute;