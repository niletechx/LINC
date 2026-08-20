import { api, extractErrorMessage } from './api';
import { MOCK_PROVIDERS } from '../data/mockData';

export const providerService = {
  /**
   * Fetch list of providers with optional filters
   */
  async getProviders(params = {}) {
    try {
      const response = await api.get('/providers', { params });
      return response.data.data || MOCK_PROVIDERS;
    } catch {
      // Return mock providers on network/backend failure
      let result = [...MOCK_PROVIDERS];
      if (params.category && params.category !== 'all') {
        result = result.filter((p) => p.category === params.category);
      }
      if (params.search) {
        const q = params.search.toLowerCase();
        result = result.filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.headline.toLowerCase().includes(q) ||
            p.about.toLowerCase().includes(q)
        );
      }
      return result;
    }
  },

  /**
   * Fetch single provider details by ID
   */
  async getProviderById(id) {
    try {
      const response = await api.get(`/providers/${id}`);
      return response.data.data;
    } catch {
      const found = MOCK_PROVIDERS.find((p) => String(p.id) === String(id));
      if (found) return found;
      return MOCK_PROVIDERS[0];
    }
  },

  /**
   * Fetch current provider's own profile
   */
  async getMyProfile() {
    try {
      const response = await api.get('/providers/me');
      return response.data.data;
    } catch (err) {
      throw new Error(extractErrorMessage(err));
    }
  },

  /**
   * Update or create provider profile
   */
  async updateMyProfile(data) {
    try {
      const response = await api.put('/providers/me', data);
      return response.data.data;
    } catch (err) {
      throw new Error(extractErrorMessage(err));
    }
  },
};
