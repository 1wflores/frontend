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
            requestId: error.config?.headers['X-Request-ID'],
          });
        }

        // Handle token expiration
        if (error.response?.status === 401 && !originalRequest._retry) {
          if (error.response.data?.code === 'TOKEN_EXPIRED') {
            originalRequest._retry = true;
            
            if (!this.isRefreshing) {
              this.isRefreshing = true;
              
              try {
                // Attempt to refresh token or re-authenticate
                await this.handleTokenRefresh();
                
                // Retry original request
                return this.client(originalRequest);
              } catch (refreshError) {
                await this.handleAuthError();
                return Promise.reject(refreshError);
              } finally {
                this.isRefreshing = false;
              }
            }
            
            // Wait for token refresh to complete
            return new Promise((resolve, reject) => {
              this.subscribers.push({
                resolve: () => resolve(this.client(originalRequest)),
                reject
              });
            });
          } else {
            await this.handleAuthError();
          }
        }

        // Handle network errors with retry
        if (!error.response && !originalRequest._retried) {
          originalRequest._retried = true;
          
          return new Promise((resolve, reject) => {
            this.requestQueue.push({
              config: originalRequest,
              resolve,
              reject
            });
            
            Alert.alert(
              'Network Error',
              'Request queued. Will retry when connection is restored.',
              [{ text: 'OK' }]
            );
          });
        }

        // Handle specific error codes
        if (error.response?.status === 429) {
          Alert.alert(
            'Too Many Requests',
            'Please slow down and try again later.',
            [{ text: 'OK' }]
          );
        }

        return Promise.reject(error);
      }
    );
  }

  async handleTokenRefresh() {
    // Implement token refresh logic here
    // This is a placeholder - implement based on your auth strategy
    throw new Error('Token refresh not implemented');
  }

  async handleAuthError() {
    this.authToken = null;
    await StorageService.clearAuthData();
    
    // Notify subscribers
    this.subscribers.forEach(s => s.reject(new Error('Authentication failed')));
    this.subscribers = [];
    
    Alert.alert(
      'Session Expired',
      'Please log in again.',
      [{ text: 'OK' }]
    );
  }

  generateRequestId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  setAuthToken(token) {
    this.authToken = token;
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