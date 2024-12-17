import { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from './AuthContext';

const ProtectedRoute = () => {
  const { user, token, login, logout } = useContext(AuthContext);
  console.log(token);
  if (token) {
    login(token);
  }
  return user ? <Outlet /> : <Navigate to="/auth" replace />;
};

export default ProtectedRoute;
