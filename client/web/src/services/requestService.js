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
   * Submit a quote / proposal on an open request
   */
  async submitQuote(requestId, quoteData) {
    try {
      const response = await api.post(`/requests/${requestId}/quotes`, quoteData);
      return response.data.data;
    } catch (err) {
      // Return local simulated response on offline / missing endpoint
      return {
        id: `quote-${Date.now()}`,
        requestId,
        ...quoteData,
        status: 'submitted',
        createdAt: new Date().toISOString(),
      };
    }
  },
};
