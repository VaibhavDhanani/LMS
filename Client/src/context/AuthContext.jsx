import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';
import { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const navigate = useNavigate();

  const login = (token) => {
    const decodedUser = jwtDecode(token);
    setUser(decodedUser);
    setToken(token);
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    Cookies.remove('authToken');
    setUser(null);
    setToken(null);
    navigate('/auth');
  };

  useEffect(() => {
    const localToken = localStorage.getItem('authToken');
    const cookieToken = Cookies.get('authToken');
    const storedToken = localToken || cookieToken;

    if (storedToken) {
      try {
        const decodedUser = jwtDecode(storedToken);
        setUser(decodedUser);
        setToken(storedToken);
      } catch {
        logout();
      }
    }
  }, [navigate]);

  return (
    <AuthContext.Provider value={{ user, token,login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
