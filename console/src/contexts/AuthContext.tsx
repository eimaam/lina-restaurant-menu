import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../lib/api';
import { UserRole, type UserResponse } from '@lina/types';

interface AuthContextType {
  user: UserResponse | null;
  token: string | null;
  loading: boolean;
  login: (token: string, user: UserResponse) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isStaff: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('lina_auth_token'));
  const [user, setUser] = useState<UserResponse | null>(() => {
    try {
      const saved = localStorage.getItem('lina_auth_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const res = await api.get('/auth/me');
          if (res.data.success) {
            setUser(res.data.data.user);
            localStorage.setItem('lina_auth_user', JSON.stringify(res.data.data.user));
          }
        } catch (err) {
          console.warn('Token validation failed, logging out...');
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, [token]);

  const login = (newToken: string, newUser: UserResponse) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('lina_auth_token', newToken);
    localStorage.setItem('lina_auth_user', JSON.stringify(newUser));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('lina_auth_token');
    localStorage.removeItem('lina_auth_user');
  };

  const isAuthenticated = !!token && !!user;
  const isAdmin = user?.role === UserRole.Admin;
  const isStaff = user?.role === UserRole.Staff;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        logout,
        isAuthenticated,
        isAdmin,
        isStaff,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
