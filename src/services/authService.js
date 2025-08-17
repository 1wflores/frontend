import { apiClient } from './apiClient';
import { StorageService } from './storageService';

export class AuthService {
  async login(credentials) {
    try {
      const response = await apiClient.post('/api/auth/login', credentials); // ✅ Added /api
      const { token, user } = response.data.data;

      // Store credentials
      await StorageService.setAuthToken(token);
      await StorageService.setUser(user);
      
      // Set token for future requests
      apiClient.setAuthToken(token);

      return { token, user };
    } catch (error) {
      throw error;
    }
  }

  async logout() {
    try {
      await apiClient.post('/api/auth/logout'); // ✅ Added /api
    } catch (error) {
      console.error('Logout API error:', error);
      // Continue with local logout even if API fails
    } finally {
      await this.clearLocalAuth();
    }
  }

  async clearLocalAuth() {
    apiClient.setAuthToken(null);
    await StorageService.clearAuthData();
  }

  async getProfile() {
    try {
      const response = await apiClient.get('/api/auth/profile'); // ✅ Added /api
      return response.data.data.user;
    } catch (error) {
      throw error;
    }
  }

  async checkAuthStatus() {
    try {
      const token = await StorageService.getAuthToken();
      if (!token) return false;

      // Verify token is still valid
      await this.getProfile();
      apiClient.setAuthToken(token);
      return true;
    } catch (error) {
      await this.clearLocalAuth();
      return false;
    }
  }

  async getCurrentUser() {
    try {
      return await StorageService.getUser();
    } catch (error) {
      return null;
    }
  }
}

export const authService = new AuthService();