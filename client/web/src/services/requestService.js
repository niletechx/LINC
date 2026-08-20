import { api, extractErrorMessage } from './api';
import { MOCK_OPEN_REQUESTS } from '../data/mockData';

export const requestService = {
  /**
   * Fetch open work requests
   */
  async getRequests(params = {}) {
    try {
      const response = await api.get('/requests', { params });
      return response.data.data || MOCK_OPEN_REQUESTS;
    } catch {
      return MOCK_OPEN_REQUESTS;
    }
  },

  /**
   * Create a new client work request
   */
  async createRequest(data) {
    try {
      const response = await api.post('/requests', data);
      return response.data.data;
    } catch (err) {
      throw new Error(extractErrorMessage(err));
    }
  },

  /**
   * Fetch my own requests
   */
  async getMyRequests() {
    try {
      const response = await api.get('/requests/my');
      return response.data.data;
    } catch (err) {
      throw new Error(extractErrorMessage(err));
    }
  },
};
