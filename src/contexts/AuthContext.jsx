import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService } from '../services/authService';

export const AuthContext = createContext(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      setLoading(true);
      
      const isAuthenticated = await authService.checkAuthStatus();
      if (isAuthenticated) {
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
        setToken('authenticated'); // We don't store the actual token in state
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
      await authService.clearLocalAuth();
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      const result = await authService.login(credentials);
      setUser(result.user);
      setToken(result.token);
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setToken(null);
    }
  };

  const refreshUser = async () => {
    try {
      const profile = await authService.getProfile();
      setUser(profile);
    } catch (error) {
      console.error('Error refreshing user:', error);
      await logout();
    }
  };

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};