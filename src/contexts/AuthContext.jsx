import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
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
  const [initialized, setInitialized] = useState(false);
  
  // Use ref to prevent re-initialization
  const initRef = useRef(false);

  // Memoized initialization function to prevent infinite loops
  const initializeAuth = useCallback(async () => {
    // Prevent multiple initializations
    if (initRef.current) {
      return;
    }
    
    initRef.current = true;
    
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
      setUser(null);
      setToken(null);
    } finally {
      setLoading(false);
      setInitialized(true);
    }
  }, []); // Empty dependency array to prevent recreation

  // Initialize only once
  useEffect(() => {
    if (!initialized) {
      initializeAuth();
    }
  }, [initializeAuth, initialized]);

  // Memoized login function
  const login = useCallback(async (credentials) => {
    try {
      const result = await authService.login(credentials);
      setUser(result.user);
      setToken(result.token);
      return result;
    } catch (error) {
      throw error;
    }
  }, []);

  // Memoized logout function
  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setToken(null);
      // Reset initialization flag to allow re-login
      initRef.current = false;
      setInitialized(false);
    }
  }, []);

  // Memoized refresh function
  const refreshUser = useCallback(async () => {
    try {
      const profile = await authService.getProfile();
      setUser(profile);
      return profile;
    } catch (error) {
      console.error('Error refreshing user:', error);
      await logout();
      throw error;
    }
  }, [logout]);

  // Memoized context value to prevent unnecessary re-renders
  const value = React.useMemo(() => ({
    user,
    token,
    loading,
    initialized,
    login,
    logout,
    refreshUser,
  }), [user, token, loading, initialized, login, logout, refreshUser]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};