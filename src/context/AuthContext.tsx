import React, { useEffect, useState, useCallback } from 'react';
import { User } from '../types';
import axios from 'axios';
import { useQueryClient } from '@tanstack/react-query';
import { authApi } from '../api/auth.api';

import { AuthContext } from './useAuth';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshUser = useCallback(async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setUser(null);
        return;
      }
      const response = await authApi.getMe();
      if (response.data?.user) {
        setUser(response.data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      if (axios.isAxiosError(error) && [401, 403].includes(error.response?.status || 0)) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      }
      setUser(null);
    }
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true);
      await refreshUser();
      setIsLoading(false);
    };
    initAuth();
  }, [refreshUser]);

  const login = async (data: { email: string; password: string }) => {
    const res = await authApi.login(data);
    if (res.data?.accessToken && res.data.refreshToken && res.data.user) {
      localStorage.setItem('accessToken', res.data.accessToken);
      if (res.data.refreshToken) {
        localStorage.setItem('refreshToken', res.data.refreshToken);
      }
      queryClient.clear();
      setUser(res.data.user);
    } else {
      throw new Error('সার্ভার থেকে সঠিক সেশন পাওয়া যায়নি।');
    }
  };

  const register = async (data: {
    name: string;
    email: string;
    phone?: string;
    password: string;
    confirmPassword: string;
    dateOfBirth: string;
  }) => {
    const res = await authApi.register(data);
    if (res.data?.accessToken && res.data.refreshToken && res.data.user) {
      localStorage.setItem('accessToken', res.data.accessToken);
      if (res.data.refreshToken) {
        localStorage.setItem('refreshToken', res.data.refreshToken);
      }
      queryClient.clear();
      setUser(res.data.user);
    } else {
      throw new Error('সার্ভার থেকে সঠিক সেশন পাওয়া যায়নি।');
    }
  };

  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken') || undefined;
      await authApi.logout(refreshToken);
    } catch {
      // Ignore network errors on logout
    } finally {
      queryClient.clear();
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

