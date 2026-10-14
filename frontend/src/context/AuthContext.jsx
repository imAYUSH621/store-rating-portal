import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('store_portal_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem('store_portal_token') || null);
  const [loading, setLoading] = useState(true);

  // Validate session on boot
  useEffect(() => {
    async function checkAuth() {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await api.get('/auth/me');
        if (res.success && res.user) {
          setUser(res.user);
          localStorage.setItem('store_portal_user', JSON.stringify(res.user));
        }
      } catch {
        setUser(null);
        setToken(null);
        localStorage.removeItem('store_portal_token');
        localStorage.removeItem('store_portal_user');
      } finally {
        setLoading(false);
      }
    }

    checkAuth();

    const handleSessionExpired = () => {
      setUser(null);
      setToken(null);
    };

    window.addEventListener('auth-session-expired', handleSessionExpired);
    return () => window.removeEventListener('auth-session-expired', handleSessionExpired);
  }, [token]);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.success && res.token) {
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem('store_portal_token', res.token);
      localStorage.setItem('store_portal_user', JSON.stringify(res.user));
    }
    return res;
  };

  const signup = async (userData) => {
    const res = await api.post('/auth/signup', userData);
    if (res.success && res.token) {
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem('store_portal_token', res.token);
      localStorage.setItem('store_portal_user', JSON.stringify(res.user));
    }
    return res;
  };

  const changePassword = async (oldPassword, newPassword) => {
    return await api.post('/auth/change-password', { oldPassword, newPassword });
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('store_portal_token');
    localStorage.removeItem('store_portal_user');
  };

  const value = {
    user,
    token,
    role: user?.role || null,
    isAuthenticated: !!token && !!user,
    loading,
    login,
    signup,
    changePassword,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
