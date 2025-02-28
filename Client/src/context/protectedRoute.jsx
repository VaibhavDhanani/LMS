import { useContext, useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { AuthContext } from "./AuthContext";

const ProtectedRoute = () => {
  const { user, token, login } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (token && !user) {
      login(token).finally(() => setIsLoading(false)); // Ensure loading ends after login
    } else {
      setIsLoading(false); // No token or already logged in
    }
  }, [token, user, login]);

  if (isLoading) return <p>Loading...</p>; // Replace with a better loading spinner/UI if needed
  
  return user ? <Outlet /> : <Navigate to="/auth" replace />;
};

export default ProtectedRoute;
