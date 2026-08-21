import { api, extractErrorMessage } from './api';

export const notificationService = {
  /**
   * Fetch all user notifications
   */
  async getNotifications() {
    try {
      const response = await api.get('/notifications');
      return response.data.data || [];
    } catch (err) {
      throw new Error(extractErrorMessage(err));
    }
  },

  /**
   * Mark single notification as read
   */
  async markAsRead(id) {
    try {
      const response = await api.put(`/notifications/${id}/read`);
      return response.data.data;
    } catch (err) {
      throw new Error(extractErrorMessage(err));
    }
  },

  /**
   * Mark all notifications as read
   */
  async markAllAsRead() {
    try {
      const response = await api.put('/notifications/read-all');
      return response.data.data;
    } catch (err) {
      throw new Error(extractErrorMessage(err));
    }
  },
};
