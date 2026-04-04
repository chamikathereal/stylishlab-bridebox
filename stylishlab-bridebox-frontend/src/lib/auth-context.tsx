'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { LoginResponse } from '@/api/generated/model';

interface AuthUser {
  token: string;
  role: string;
  username: string;
  employeeId?: number;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  login: (data: LoginResponse) => void;
  logout: () => void;
  isAdmin: boolean;
  isEmployee: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('bridebox_token');
    const userData = localStorage.getItem('bridebox_user');
    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
      } catch {
        localStorage.removeItem('bridebox_token');
        localStorage.removeItem('bridebox_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = useCallback((data: LoginResponse) => {
    const authUser: AuthUser = {
      token: data.token!,
      role: data.role!,
      username: data.username!,
      employeeId: data.employeeId,
    };
    localStorage.setItem('bridebox_token', data.token!);
    localStorage.setItem('bridebox_user', JSON.stringify(authUser));
    setUser(authUser);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('bridebox_token');
    localStorage.removeItem('bridebox_user');
    setUser(null);
    window.location.href = '/login';
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        logout,
        isAdmin: user?.role === 'ADMIN',
        isEmployee: user?.role === 'EMPLOYEE',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
