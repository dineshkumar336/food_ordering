import { createContext, useContext, useState, useEffect } from 'react';
import { getMe, registerUser, loginUser } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('fo_token');
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const { data } = await getMe();
      if (data.success) {
        setUser(data.user);
      }
    } catch (err) {
      localStorage.removeItem('fo_token');
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      const { data } = await registerUser(userData);
      if (data.success) {
        localStorage.setItem('fo_token', data.token);
        setUser(data.user);
        return true;
      }
      return false;
    } catch (error) {
      throw error;
    }
  };

  const login = async (credentials) => {
    try {
      const { data } = await loginUser(credentials);
      if (data.success) {
        localStorage.setItem('fo_token', data.token);
        setUser(data.user);
        return true;
      }
      return false;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('fo_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, register, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};
