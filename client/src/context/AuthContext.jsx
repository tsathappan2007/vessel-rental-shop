import React, { createContext, useContext, useState, useEffect } from 'react';
import { verifyAdminToken } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      verifyAdminToken()
        .then(() => setIsAdmin(true))
        .catch(() => {
          localStorage.removeItem('admin_token');
          setIsAdmin(false);
        })
        .finally(() => setLoading(false));
    } else {
      setIsAdmin(false);
      setLoading(false);
    }
  }, []);

  const login = (token) => {
    localStorage.setItem('admin_token', token);
    setIsAdmin(true);
  };

  const logout = () => {
    localStorage.removeItem('admin_token');
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider value={{ isAdmin, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
