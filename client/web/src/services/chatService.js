import { api, extractErrorMessage } from './api';
import { MOCK_CONVERSATIONS } from '../data/mockData';

export const chatService = {
  /**
   * Fetch all user conversations
   */
  async getConversations() {
    try {
      const response = await api.get('/messaging/conversations');
      return response.data.data || MOCK_CONVERSATIONS;
    } catch {
      return MOCK_CONVERSATIONS;
    }
  },

  /**
   * Fetch messages for a specific conversation
   */
  async getMessages(conversationId) {
    try {
      const response = await api.get(`/messaging/conversations/${conversationId}/messages`);
      return response.data.data;
    } catch (err) {
      throw new Error(extractErrorMessage(err));
    }
  },

  /**
   * Send a direct message
   */
  async sendMessage(conversationId, text) {
    try {
      const response = await api.post(`/messaging/conversations/${conversationId}/messages`, {
        body: text,
      });
      return response.data.data;
    } catch (err) {
      throw new Error(extractErrorMessage(err));
    }
  },
};
