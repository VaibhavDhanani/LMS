import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';
import { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserInfo } from '@/services/user.service';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchUserInfo = async (authToken) => {
    try {
      const response = await getUserInfo(authToken);
      if (response.success) {
        setUser(response.data);
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to fetch user info');
      }
    } catch (error) {
      console.error('Error fetching user info:', error);
      throw error;
    }
  };

  const login = async (authToken) => {
    setLoading(true);
    if (authToken) {
      try {
        jwtDecode(authToken);
        setToken(authToken);
        localStorage.setItem("authToken", authToken);
        Cookies.set("authToken", authToken, { expires: 7 });
        const userData = await fetchUserInfo(authToken);
        setLoading(false);
        return { success: true, user: userData };
      } catch (error) {
        console.error("Login failed:", error);
        logout();
        setLoading(false);
        return { success: false, error: error.message };
      }
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    Cookies.remove('authToken');
    setUser(null);
    setToken(null);
    navigate('/auth');
  };

  useEffect(() => {
    const initializeAuth = async () => {
      setLoading(true);
      const storedToken = localStorage.getItem('authToken') || Cookies.get('authToken');
      if (storedToken) {
        try {
          setToken(storedToken);
          await fetchUserInfo(storedToken);
        } catch (error) {
          console.error("Error initializing auth:", error);
          logout();
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, [token]);

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
