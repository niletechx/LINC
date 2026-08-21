import { api, extractErrorMessage } from './api';

export const userService = {
  /**
   * Fetch current user profile
   */
  async getMe() {
    try {
      const response = await api.get('/users/me');
      return response.data.data;
    } catch (err) {
      throw new Error(extractErrorMessage(err));
    }
  },

  /**
   * Update profile details
   */
  async updateMe(data) {
    try {
      const response = await api.put('/users/me', data);
      return response.data.data;
    } catch (err) {
      throw new Error(extractErrorMessage(err));
    }
  },

  /**
   * Get user by ID
   */
  async getUserById(id) {
    try {
      const response = await api.get(`/users/${id}`);
      return response.data.data;
    } catch (err) {
      throw new Error(extractErrorMessage(err));
    }
  },

  /**
   * Search users by query string
   */
  async searchUsers(query) {
    try {
      const response = await api.get('/users/search', { params: { q: query } });
      return response.data.data || [];
    } catch (err) {
      throw new Error(extractErrorMessage(err));
    }
  },
};
