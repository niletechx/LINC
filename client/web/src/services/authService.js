import { api, extractErrorMessage } from './api';
import { APP_CONFIG } from '../config/constants';

export const authService = {
  /**
   * Log in user with email & password
   */
  async login({ email, password }) {
    try {
      const response = await api.post('/auth/login', {
        email: email.trim(),
        password,
      });

      const { user, token } = response.data.data;
      if (token) {
        localStorage.setItem(APP_CONFIG.storageKeys.token, token);
        localStorage.setItem(APP_CONFIG.storageKeys.user, JSON.stringify(user));
      }
      return { user, token };
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  },

  /**
   * Register new user (Client or Provider)
   */
  async register({
    email,
    password,
    fullName,
    username,
    phone,
    locationCity,
    role = 'client',
    headline,
  }) {
    try {
      const response = await api.post('/auth/register', {
        email: email.trim(),
        password,
        full_name: fullName.trim(),
        username: username.trim(),
        phone: phone ? phone.trim() : undefined,
        location_city: locationCity ? locationCity.trim() : 'Addis Ababa',
        role,
        headline: headline ? headline.trim() : undefined,
      });

      const { user, token } = response.data.data;
      if (token) {
        localStorage.setItem(APP_CONFIG.storageKeys.token, token);
        localStorage.setItem(APP_CONFIG.storageKeys.user, JSON.stringify(user));
      }
      return { user, token };
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  },

  /**
   * Fetch current authenticated user
   */
  async getMe() {
    try {
      const response = await api.get('/auth/me');
      const user = response.data.data;
      localStorage.setItem(APP_CONFIG.storageKeys.user, JSON.stringify(user));
      return user;
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  },

  /**
   * Sign out
   */
  async logout() {
    try {
      await api.post('/auth/logout');
    } catch (_) {
      // Ignore network errors on logout
    } finally {
      localStorage.removeItem(APP_CONFIG.storageKeys.token);
      localStorage.removeItem(APP_CONFIG.storageKeys.user);
    }
  },
};
