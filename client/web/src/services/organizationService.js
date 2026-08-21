import { api, extractErrorMessage } from './api';

export const organizationService = {
  /**
   * List all organizations with optional filters
   */
  async listOrganizations(params = {}) {
    try {
      const response = await api.get('/organizations', { params });
      return response.data.data || [];
    } catch (err) {
      throw new Error(extractErrorMessage(err));
    }
  },

  /**
   * Get single organization details by ID
   */
  async getOrganizationById(id) {
    try {
      const response = await api.get(`/organizations/${id}`);
      return response.data.data;
    } catch (err) {
      throw new Error(extractErrorMessage(err));
    }
  },

  /**
   * Get authenticated user's organization profile
   */
  async getMyOrganization() {
    try {
      const response = await api.get('/organizations/me');
      return response.data.data;
    } catch (err) {
      throw new Error(extractErrorMessage(err));
    }
  },

  /**
   * Create organization profile for authenticated user
   */
  async createOrganization(data) {
    try {
      const response = await api.post('/organizations/me', data);
      return response.data.data;
    } catch (err) {
      throw new Error(extractErrorMessage(err));
    }
  },

  /**
   * Update organization profile
   */
  async updateOrganization(data) {
    try {
      const response = await api.put('/organizations/me', data);
      return response.data.data;
    } catch (err) {
      throw new Error(extractErrorMessage(err));
    }
  },

  /**
   * List organization team members
   */
  async listMembers(organizationId) {
    try {
      const response = await api.get(`/organizations/${organizationId}/members`);
      return response.data.data || [];
    } catch (err) {
      throw new Error(extractErrorMessage(err));
    }
  },

  /**
   * Add member to organization team
   */
  async addMember(organizationId, { userId, role = 'staff' }) {
    try {
      const response = await api.post(`/organizations/${organizationId}/members`, {
        user_id: userId,
        role,
      });
      return response.data.data;
    } catch (err) {
      throw new Error(extractErrorMessage(err));
    }
  },

  /**
   * Remove member from organization team
   */
  async removeMember(organizationId, memberId) {
    try {
      const response = await api.delete(`/organizations/${organizationId}/members/${memberId}`);
      return response.data.data;
    } catch (err) {
      throw new Error(extractErrorMessage(err));
    }
  },
};
