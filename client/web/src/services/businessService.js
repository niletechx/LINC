import { api, extractErrorMessage } from './api';

export const businessService = {
  /**
   * List all businesses with optional filters
   */
  async listBusinesses(params = {}) {
    try {
      const response = await api.get('/businesses', { params });
      return response.data.data || [];
    } catch (err) {
      throw new Error(extractErrorMessage(err));
    }
  },

  /**
   * Get single business details by ID
   */
  async getBusinessById(id) {
    try {
      const response = await api.get(`/businesses/${id}`);
      return response.data.data;
    } catch (err) {
      throw new Error(extractErrorMessage(err));
    }
  },

  /**
   * Get authenticated user's business profile
   */
  async getMyBusiness() {
    try {
      const response = await api.get('/businesses/me');
      return response.data.data;
    } catch (err) {
      throw new Error(extractErrorMessage(err));
    }
  },

  /**
   * Create business profile for authenticated user
   */
  async createBusiness(data) {
    try {
      const response = await api.post('/businesses/me', data);
      return response.data.data;
    } catch (err) {
      throw new Error(extractErrorMessage(err));
    }
  },

  /**
   * Update business profile
   */
  async updateBusiness(data) {
    try {
      const response = await api.put('/businesses/me', data);
      return response.data.data;
    } catch (err) {
      throw new Error(extractErrorMessage(err));
    }
  },

  /**
   * List business team members
   */
  async listMembers(businessId) {
    try {
      const response = await api.get(`/businesses/${businessId}/members`);
      return response.data.data || [];
    } catch (err) {
      throw new Error(extractErrorMessage(err));
    }
  },

  /**
   * Add member to business team
   */
  async addMember(businessId, { userId, role = 'staff' }) {
    try {
      const response = await api.post(`/businesses/${businessId}/members`, {
        user_id: userId,
        role,
      });
      return response.data.data;
    } catch (err) {
      throw new Error(extractErrorMessage(err));
    }
  },

  /**
   * Remove member from business team
   */
  async removeMember(businessId, memberId) {
    try {
      const response = await api.delete(`/businesses/${businessId}/members/${memberId}`);
      return response.data.data;
    } catch (err) {
      throw new Error(extractErrorMessage(err));
    }
  },
};
