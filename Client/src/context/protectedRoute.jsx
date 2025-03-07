import { useContext, useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { AuthContext, useAuth } from "./AuthContext";

const ProtectedRoute = () => {
  const { user, token, login, loading } = useAuth();
  const [routeLoading, setRouteLoading] = useState(true);

  useEffect(() => {
    // Only run this logic if the AuthContext's main loading is complete
    if (!loading) {
      if (token && !user) {
        setRouteLoading(true);
        login(token)
          .then((result) => {
            if (!result.success) {
              console.error("Login failed:", result.error);
            }
          })
          .catch((error) => console.error("Login error:", error))
          .finally(() => setRouteLoading(false));
      } else {
        setRouteLoading(false);
      }
    }
  }, [token, user, loading, login]); 

  // Show loading while either the main AuthContext is loading OR route-specific loading is happening
  if (loading || routeLoading) return <p>Loading...</p>;
  
  return user ? <Outlet /> : <Navigate to="/auth" replace />;
};
export default ProtectedRoute;
