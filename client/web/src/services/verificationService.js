import { api, extractErrorMessage } from './api';

export const verificationService = {
  /**
   * Fetch authenticated user's verification requests
   */
  async getMyRequests() {
    try {
      const response = await api.get('/verification/me');
      return response.data.data || [];
    } catch (err) {
      throw new Error(extractErrorMessage(err));
    }
  },

  /**
   * Submit new KYC verification documents
   * @param {Object} data { entity_type: 'provider'|'business'|'organization', entity_id, documents: [{ type, url, number }] }
   */
  async createRequest(data) {
    try {
      const response = await api.post('/verification', data);
      return response.data.data;
    } catch (err) {
      throw new Error(extractErrorMessage(err));
    }
  },

  /**
   * Get single verification request by ID
   */
  async getRequestById(id) {
    try {
      const response = await api.get(`/verification/${id}`);
      return response.data.data;
    } catch (err) {
      throw new Error(extractErrorMessage(err));
    }
  },
};
