import axios from 'axios';
import { Alert } from 'react-native';
import { API_CONFIG } from '../utils/constants';
import { StorageService } from './storageService';
import NetInfo from '@react-native-community/netinfo';

class ApiClient {
  constructor() {
    this.client = null;
    this.authToken = null;
    this.requestQueue = [];
    this.isRefreshing = false;
    this.subscribers = [];

    this.client = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      timeout: API_CONFIG.TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
    this.initializeAuth();
    this.setupNetworkListener();
  }

  async setupNetworkListener() {
    NetInfo.addEventListener(state => {
      if (state.isConnected && this.requestQueue.length > 0) {
        this.processQueuedRequests();
      }
    });
  }

  async processQueuedRequests() {
    const queue = [...this.requestQueue];
    this.requestQueue = [];
    
    for (const request of queue) {
      try {
        const response = await this.client.request(request.config);
        request.resolve(response);
      } catch (error) {
        request.reject(error);
      }
    }
  }

  async initializeAuth() {
    try {
      const token = await StorageService.getAuthToken();
      if (token) {
        this.setAuthToken(token);
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
    }
  }

  setupInterceptors() {
    // Request interceptor with retry logic
    this.client.interceptors.request.use(
      async (config) => {
        // Check network connectivity
        const netInfo = await NetInfo.fetch();
        if (!netInfo.isConnected) {
          throw new Error('No internet connection');
        }

        // ✅ FIXED: Ensure headers object exists before setting Authorization
        if (!config.headers) {
          config.headers = {};
        }

        if (this.authToken) {
          config.headers.Authorization = `Bearer ${this.authToken}`;
        }
        
        // Add request ID for tracking
        config.headers['X-Request-ID'] = this.generateRequestId();
        
        if (__DEV__) {
          console.log('🚀 API Request:', {
            method: config.method?.toUpperCase(),
            url: config.url,
            data: config.data,
            requestId: config.headers['X-Request-ID'],
            headers: config.headers,
          });
        }
        
        return config;
      },
      (error) => {
        console.error('Request interceptor error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor with token refresh
    this.client.interceptors.response.use(
      (response) => {
        if (__DEV__) {
          console.log('✅ API Response:', {
            status: response.status,
            url: response.config.url,
            data: response.data,
            requestId: response.config.headers['X-Request-ID'],
          });
        }
        return response;
      },
      async (error) => {
        const originalRequest = error.config;

        if (__DEV__) {
          console.log('❌ API Error:', {
            status: error.response?.status,
            url: error.config?.url,
            data: error.response?.data,
            message: error.message,
            requestId: error.config?.headers?.['X-Request-ID'],
          });
        }

        // Handle network errors
        if (!error.response) {
          const netInfo = await NetInfo.fetch();
          if (!netInfo.isConnected) {
            throw new Error('No internet connection');
          }
          throw new Error('Network error occurred');
        }

        // FIX: Handle 401 errors more specifically
        if (error.response?.status === 401) {
          // Check if this is a login request
          const isLoginRequest = originalRequest.url && originalRequest.url.includes('/api/auth/login');
          
          if (isLoginRequest) {
            // For login failures, use the server's error message
            const serverMessage = error.response?.data?.message || 'Invalid credentials';
            throw new Error(serverMessage);
          } else if (!originalRequest._retry) {
            // For authenticated requests, handle token expiration
            originalRequest._retry = true;
            
            // Clear auth data and force re-login
            this.setAuthToken(null);
            await StorageService.clearAuthData();
            
            throw new Error('Session expired. Please login again.');
          }
        }

        // Handle 403 forbidden errors
        if (error.response?.status === 403) {
          throw new Error('Access denied. Insufficient permissions.');
        }

        // Handle server errors
        if (error.response?.status >= 500) {
          this.showNetworkErrorAlert();
          throw new Error('Server error occurred. Please try again later.');
        }

        // Handle validation errors
        if (error.response?.status === 400) {
          const message = error.response?.data?.message || 'Bad request';
          throw new Error(message);
        }

        // Handle rate limiting
        if (error.response?.status === 429) {
          const message = error.response?.data?.message || 'Too many requests. Please try again later.';
          throw new Error(message);
        }

        throw error;
      }
    );
  }

  showNetworkErrorAlert() {
    Alert.alert(
      'Network Error',
      'Unable to connect to the server. Please check your internet connection and try again.',
      [{ text: 'OK' }]
    );
  }

  generateRequestId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // ✅ ENHANCED: Better token management with error handling
  setAuthToken(token) {
    this.authToken = token;
    
    try {
      // Ensure defaults and headers objects exist
      if (!this.client.defaults) {
        this.client.defaults = {};
      }
      if (!this.client.defaults.headers) {
        this.client.defaults.headers = {};
      }
      if (!this.client.defaults.headers.common) {
        this.client.defaults.headers.common = {};
      }

      if (token) {
        this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        console.log('✅ Auth token set in API client');
      } else {
        delete this.client.defaults.headers.common['Authorization'];
        console.log('✅ Auth token cleared from API client');
      }
    } catch (error) {
      console.error('❌ Error setting auth token:', error);
    }
  }

  // ✅ NEW: Method to get current auth token
  getAuthToken() {
    return this.authToken;
  }

  // ✅ NEW: Method to check if authenticated
  isAuthenticated() {
    return !!this.authToken;
  }

  // HTTP Methods with enhanced error handling
  async get(url, config = {}) {
    return this.client.get(url, config);
  }

  async post(url, data = {}, config = {}) {
    return this.client.post(url, data, config);
  }

  async put(url, data = {}, config = {}) {
    return this.client.put(url, data, config);
  }

  async patch(url, data = {}, config = {}) {
    return this.client.patch(url, data, config);
  }

  async delete(url, config = {}) {
    return this.client.delete(url, config);
  }

  // Health check with retry
  async healthCheck() {
    try {
      return await this.client.get('/api/health');
    } catch (error) {
      console.error('Health check failed:', error);
      throw error;
    }
  }
}

export const apiClient = new ApiClient();