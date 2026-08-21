import { api, extractErrorMessage } from './api';

export const serviceCatalogService = {
  /**
   * List all services with filters
   */
  async getServices(params = {}) {
    try {
      const response = await api.get('/services', { params });
      return response.data.data || [];
    } catch (err) {
      throw new Error(extractErrorMessage(err));
    }
  },

  /**
   * Get single service by ID
   */
  async getServiceById(id) {
    try {
      const response = await api.get(`/services/${id}`);
      return response.data.data;
    } catch (err) {
      throw new Error(extractErrorMessage(err));
    }
  },

  /**
   * Create a new service
   */
  async createService(data) {
    try {
      const response = await api.post('/services', data);
      return response.data.data;
    } catch (err) {
      throw new Error(extractErrorMessage(err));
    }
  },

  /**
   * Update service by ID
   */
  async updateService(id, data) {
    try {
      const response = await api.put(`/services/${id}`, data);
      return response.data.data;
    } catch (err) {
      throw new Error(extractErrorMessage(err));
    }
  },

  /**
   * Delete service by ID
   */
  async deleteService(id) {
    try {
      const response = await api.delete(`/services/${id}`);
      return response.data.data;
    } catch (err) {
      throw new Error(extractErrorMessage(err));
    }
  },
};
