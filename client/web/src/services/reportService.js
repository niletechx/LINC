import { api, extractErrorMessage } from './api';

export const reportService = {
  /**
   * Submit a safety / violation report
   * @param {Object} data { entity_type: 'user'|'provider'|'business'|'organization'|'review'|'message', entity_id, reason, description }
   */
  async createReport(data) {
    try {
      const response = await api.post('/reports', data);
      return response.data.data;
    } catch (err) {
      throw new Error(extractErrorMessage(err));
    }
  },

  /**
   * List my submitted reports
   */
  async listMyReports() {
    try {
      const response = await api.get('/reports');
      return response.data.data || [];
    } catch (err) {
      throw new Error(extractErrorMessage(err));
    }
  },

  /**
   * Get single report details by ID
   */
  async getReportById(id) {
    try {
      const response = await api.get(`/reports/${id}`);
      return response.data.data;
    } catch (err) {
      throw new Error(extractErrorMessage(err));
    }
  },
};
