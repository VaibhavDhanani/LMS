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

  // Fetch full user info from backend
  const fetchUserInfo = async (authToken) => {
    try {
      const response = await getUserInfo(authToken);
      if (response.success) {
        const userData = response.data;
        setUser(userData); // Store full user data in context
        return userData; // Return the user data for chaining
      } else {
        throw new Error(response.message || 'Failed to fetch user info');
      }
    } catch (error) {
      console.error('Error fetching user info:', error);
      throw error; // Re-throw to be caught by the caller
    }
  };

  // Login function
  const login = async (authToken) => {
    setLoading(true);
    if(authToken){

      try {
        // Verify the token is valid by decoding it
        const decodedUser = jwtDecode(authToken);
        
        // Set token in state and storage
        setToken(authToken);
        localStorage.setItem("authToken", authToken);
      Cookies.set("authToken", authToken, { expires: 7 });
      
      // Fetch user info and wait for it to complete
      const userData = await fetchUserInfo(authToken);
      
      setLoading(false);
      return { success: true, user: userData }; // Return success with user data
    } catch (error) {
      console.error("Login failed:", error);
      logout();
      setLoading(false);
      return { success: false, error: error.message }; // Return failure with error message
    }
  }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('authToken');
    Cookies.remove('authToken');
    setUser(null);
    setToken(null);
    navigate('/auth');
  };
  // On app load, check for stored token & fetch user info
  useEffect(() => {
    const initializeAuth = async () => {
      setLoading(true);
      const localToken = localStorage.getItem('authToken');
      const cookieToken = Cookies.get('authToken');
      const storedToken = localToken || cookieToken;
      
      if (storedToken) {
        try {
          setToken(storedToken);
          await fetchUserInfo(storedToken); // Wait for user info fetch

        } catch (error) {
          console.error("Error initializing auth:", error);
          logout();
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);