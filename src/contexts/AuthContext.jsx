import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient } from '../services/apiClient';
import { logger } from '../utils/logger';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  // Initialize auth state on app start
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      setLoading(true);
      console.log('🔄 Initializing auth...');
      
      // Get stored token and user data
      const [token, userData] = await Promise.all([
        AsyncStorage.getItem('authToken'),
        AsyncStorage.getItem('userData')
      ]);

      if (token && userData) {
        try {
          const parsedUser = JSON.parse(userData);
          console.log('✅ Found stored auth data for user:', parsedUser.username);
          
          // Set the token in API client
          apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          // Verify token is still valid by making a test request
          await apiClient.get('/api/auth/verify');
          
          // Token is valid, set user
          setUser(parsedUser);
          console.log('✅ Auth initialization successful');
        } catch (verifyError) {
          console.warn('⚠️ Token verification failed, clearing auth data');
          await clearAuthData();
        }
      } else {
        console.log('ℹ️ No stored auth data found');
      }
    } catch (error) {
      console.error('❌ Auth initialization error:', error);
      await clearAuthData();
    } finally {
      setLoading(false);
      setInitialized(true);
    }
  };

  const login = async (credentials) => {
    try {
      console.log('🔄 Attempting login for:', credentials.username);
      
      const response = await apiClient.post('/api/auth/login', credentials);
      const { token, user: userData } = response.data;

      if (!token || !userData) {
        throw new Error('Invalid response from server');
      }

      // Store auth data
      await Promise.all([
        AsyncStorage.setItem('authToken', token),
        AsyncStorage.setItem('userData', JSON.stringify(userData))
      ]);

      // Set authorization header
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      // Update state
      setUser(userData);
      
      console.log('✅ Login successful for:', userData.username);
      return userData;
    } catch (error) {
      console.error('❌ Login error:', error);
      
      // Clean up on login failure
      await clearAuthData();
      
      throw error;
    }
  };

  // FIXED: Enhanced logout with proper cleanup and navigation reset
  const logout = async () => {
    try {
      console.log('🔄 Starting logout process...');
      setLoading(true);

      // Call logout endpoint if user is logged in
      if (user) {
        try {
          await apiClient.post('/api/auth/logout');
          console.log('✅ Server logout successful');
        } catch (logoutError) {
          console.warn('⚠️ Server logout failed (continuing with local logout):', logoutError.message);
          // Continue with local logout even if server logout fails
        }
      }

      // Clear all auth data
      await clearAuthData();
      
      console.log('✅ Logout completed successfully');
    } catch (error) {
      console.error('❌ Logout error:', error);
      // Even if logout fails, clear local data
      await clearAuthData();
    } finally {
      setLoading(false);
    }
  };

  // FIXED: Enhanced clearAuthData with better error handling
  const clearAuthData = async () => {
    try {
      console.log('🧹 Clearing auth data...');
      
      // Clear state first (immediate UI update)
      setUser(null);
      
      // Remove authorization header
      delete apiClient.defaults.headers.common['Authorization'];
      
      // Clear storage
      await Promise.all([
        AsyncStorage.removeItem('authToken'),
        AsyncStorage.removeItem('userData'),
        // Clear any other auth-related storage items
        AsyncStorage.removeItem('refreshToken'),
        AsyncStorage.removeItem('lastLoginTime')
      ]);
      
      console.log('✅ Auth data cleared');
    } catch (error) {
      console.error('❌ Error clearing auth data:', error);
      // Force clear state even if storage clearing fails
      setUser(null);
    }
  };

  const updateUser = async (updatedUserData) => {
    try {
      const newUserData = { ...user, ...updatedUserData };
      
      // Update storage
      await AsyncStorage.setItem('userData', JSON.stringify(newUserData));
      
      // Update state
      setUser(newUserData);
      
      return newUserData;
    } catch (error) {
      console.error('❌ Update user error:', error);
      throw error;
    }
  };

  const refreshUser = async () => {
    try {
      if (!user) return null;
      
      const response = await apiClient.get('/api/auth/profile');
      const updatedUser = response.data;
      
      await updateUser(updatedUser);
      return updatedUser;
    } catch (error) {
      console.error('❌ Refresh user error:', error);
      throw error;
    }
  };

  // Check if user has specific role
  const hasRole = (role) => {
    return user?.role === role;
  };

  // Check if user is admin
  const isAdmin = () => {
    return hasRole('admin');
  };

  // Check if user is active
  const isActive = () => {
    return user?.isActive === true;
  };

  const value = {
    // State
    user,
    loading,
    initialized,
    
    // Methods
    login,
    logout,
    updateUser,
    refreshUser,
    clearAuthData,
    
    // Utility methods
    hasRole,
    isAdmin,
    isActive,
    
    // Auth status
    isAuthenticated: !!user,
    isInitialized: initialized,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};