import { api, extractErrorMessage } from './api';

export const adminService = {
  /**
   * Fetch platform overview metrics
   */
  async getOverview() {
    try {
      const response = await api.get('/admin/overview');
      return response.data.data;
    } catch (err) {
      throw new Error(extractErrorMessage(err));
    }
  },

  /**
   * List users with optional filter (is_admin, limit)
   */
  async listUsers(filters = {}) {
    try {
      const response = await api.get('/admin/users', { params: filters });
      return response.data.data || [];
    } catch (err) {
      throw new Error(extractErrorMessage(err));
    }
  },

  /**
   * List all user reports
   */
  async listReports() {
    try {
      const response = await api.get('/admin/reports');
      return response.data.data || [];
    } catch (err) {
      throw new Error(extractErrorMessage(err));
    }
  },

  /**
   * Review a report (reviewed, resolved, dismissed)
   */
  async reviewReport(reportId, status) {
    try {
      const response = await api.put(`/reports/${reportId}/review`, { status });
      return response.data.data;
    } catch (err) {
      throw new Error(extractErrorMessage(err));
    }
  },

  /**
   * List pending verification requests
   */
  async listVerificationRequests() {
    try {
      const response = await api.get('/admin/verification-requests');
      return response.data.data || [];
    } catch (err) {
      throw new Error(extractErrorMessage(err));
    }
  },

  /**
   * Review verification request (approved, rejected)
   */
  async reviewVerification(requestId, { status, review_notes }) {
    try {
      const response = await api.put(`/verification/${requestId}/review`, {
        status,
        review_notes,
      });
      return response.data.data;
    } catch (err) {
      throw new Error(extractErrorMessage(err));
    }
  },

  /**
   * List open escrow disputes for admin mediation
   */
  async listDisputes() {
    try {
      const response = await api.get('/payments/admin/disputes');
      return response.data.data || [];
    } catch (err) {
      throw new Error(extractErrorMessage(err));
    }
  },

  /**
   * Resolve an escrow dispute ('refund' to client or 'release' to provider)
   */
  async resolveDispute(disputeId, { resolution, adminNote }) {
    try {
      const response = await api.post(`/payments/admin/disputes/${disputeId}/resolve`, {
        resolution,
        adminNote,
      });
      return response.data.data;
    } catch (err) {
      throw new Error(extractErrorMessage(err));
    }
  },

  /**
   * Seed default platform categories
   */
  async seedCategories() {
    try {
      const response = await api.post('/categories/seed');
      return response.data.data;
    } catch (err) {
      throw new Error(extractErrorMessage(err));
    }
  },
};
