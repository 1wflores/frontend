import AsyncStorage from '@react-native-async-storage/async-storage';

export class StorageService {
  static AUTH_TOKEN_KEY = 'authToken';
  static USER_KEY = 'user';

  static async setAuthToken(token) {
    try {
      await AsyncStorage.setItem(this.AUTH_TOKEN_KEY, token);
    } catch (error) {
      console.error('Error storing auth token:', error);
      throw error;
    }
  }

  static async getAuthToken() {
    try {
      return await AsyncStorage.getItem(this.AUTH_TOKEN_KEY);
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  }

  static async setUser(user) {
    try {
      await AsyncStorage.setItem(this.USER_KEY, JSON.stringify(user));
    } catch (error) {
      console.error('Error storing user:', error);
      throw error;
    }
  }

  static async getUser() {
    try {
      const userString = await AsyncStorage.getItem(this.USER_KEY);
      return userString ? JSON.parse(userString) : null;
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  }

  static async clearAuthData() {
    try {
      await AsyncStorage.multiRemove([this.AUTH_TOKEN_KEY, this.USER_KEY]);
    } catch (error) {
      console.error('Error clearing auth data:', error);
      throw error;
    }
  }

  static async clearAll() {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Error clearing all storage:', error);
      throw error;
    }
  }
}