import { createContext, useContext, useState, useEffect } from 'react';
import { getMe, registerUser, loginUser, logoutUser } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  // 'full'      = everything works.
  // 'mfa_setup' = restaurant owner who has not set up two-step sign-in yet: only the setup page works.
  const [scope, setScope] = useState('full');
  const [loading, setLoading] = useState(true);

  // Loads the signed-in user from the server (the server is the source of truth for role, MFA and scope).
  const refreshUser = async () => {
    const token = localStorage.getItem('fo_token');
    if (!token) return;
    try {
      const { data } = await getMe();
      if (data.success) {
        setUser(data.user);
        setScope(data.scope);
      }
    } catch {
      localStorage.removeItem('fo_token');
      setUser(null);
    }
  };

  useEffect(() => {
    refreshUser().finally(() => setLoading(false));
  }, []);

  const register = async (userData) => {
    const { data } = await registerUser(userData);
    return data;
  };

  // Returns { ok, scope, role }. Wrong credentials throw (the server's message says how many attempts are left).
  const login = async (credentials) => {
    const { data } = await loginUser(credentials);
    if (!data.success) return { ok: false };
    localStorage.setItem('fo_token', data.token);
    setUser(data.user);
    setScope(data.scope);
    return { ok: true, scope: data.scope, role: data.user.role };
  };

  // Used after MFA setup, changing the password or turning MFA off: the server hands out a fresh token.
  const applyToken = async (token) => {
    localStorage.setItem('fo_token', token);
    await refreshUser();
  };

  const logout = () => {
    const token = localStorage.getItem('fo_token');
    if (token) logoutUser(token).catch(() => {});   // revoke the token on the server (best effort)
    localStorage.removeItem('fo_token');
    setUser(null);
    setScope('full');
  };

  return (
    <AuthContext.Provider value={{ user, scope, loading, register, login, logout, setUser, applyToken, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};
