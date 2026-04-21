import { createContext, useContext, useMemo, useState } from 'react';
import api from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('xp_token'));
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('xp_user');
    return raw ? JSON.parse(raw) : null;
  });

  const syncAuth = (nextToken, nextUser) => {
    setToken(nextToken);
    setUser(nextUser);
    localStorage.setItem('xp_token', nextToken);
    localStorage.setItem('xp_user', JSON.stringify(nextUser));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('xp_token');
    localStorage.removeItem('xp_user');
  };

  const refreshMe = async () => {
    if (!token) return;
    const res = await api.get('/auth/me');
    setUser(res.data.data);
    localStorage.setItem('xp_user', JSON.stringify(res.data.data));
  };

  const value = useMemo(
    () => ({ token, user, setUser: syncAuth, logout, refreshMe, isAuthenticated: Boolean(token) }),
    [token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
