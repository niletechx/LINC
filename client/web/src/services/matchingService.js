import { api, extractErrorMessage } from './api';

export const matchingService = {
  /**
   * Fetch matching engine results for a request
   */
  async listMatches(requestId) {
    try {
      const response = await api.get(`/matching/requests/${requestId}`);
      return response.data.data || [];
    } catch (err) {
      throw new Error(extractErrorMessage(err));
    }
  },

  /**
   * Trigger / create a match for a request
   */
  async createMatch(requestId, data) {
    try {
      const response = await api.post(`/matching/requests/${requestId}`, data);
      return response.data.data;
    } catch (err) {
      throw new Error(extractErrorMessage(err));
    }
  },

  /**
   * Update match status ('viewed', 'contacted', 'rejected')
   */
  async updateMatchStatus(matchId, status) {
    try {
      const response = await api.put(`/matching/${matchId}`, { status });
      return response.data.data;
    } catch (err) {
      throw new Error(extractErrorMessage(err));
    }
  },
};
