import axios from 'axios';
import { Alert } from 'react-native';
import { API_CONFIG } from '../utils/constants';
import { StorageService } from './storageService';

class ApiClient {
  constructor() {
    this.client = null;
    this.authToken = null;

    this.client = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      timeout: API_CONFIG.TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
    this.initializeAuth();
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
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        if (this.authToken) {
          config.headers.Authorization = `Bearer ${this.authToken}`;
        }
        
        if (__DEV__) {
          console.log('🚀 API Request:', {
            method: config.method?.toUpperCase(),
            url: config.url,
            data: config.data,
          });
        }
        
        return config;
      },
      (error) => {
        console.error('Request interceptor error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        if (__DEV__) {
          console.log('✅ API Response:', {
            status: response.status,
            url: response.config.url,
            data: response.data,
          });
        }
        return response;
      },
      async (error) => {
        if (__DEV__) {
          console.log('❌ API Error:', {
            status: error.response?.status,
            url: error.config?.url,
            data: error.response?.data,
          });
        }

        // Handle 401 errors (unauthorized)
        if (error.response?.status === 401) {
          await this.handleAuthError();
        }

        // Handle network errors
        if (!error.response) {
          Alert.alert(
            'Network Error',
            'Please check your internet connection and try again.',
            [{ text: 'OK' }]
          );
        }

        return Promise.reject(error);
      }
    );
  }

  async handleAuthError() {
    this.authToken = null;
    await StorageService.clearAuthData();
    
    Alert.alert(
      'Session Expired',
      'Please log in again.',
      [{ text: 'OK' }]
    );
  }

  setAuthToken(token) {
    this.authToken = token;
  }

  // HTTP Methods
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

  // Health check
  async healthCheck() {
    return this.client.get('/api/health'); // ✅ Added /api
  }
}

export const apiClient = new ApiClient();