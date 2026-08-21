import { api, extractErrorMessage } from './api';
import { CATEGORIES } from '../data/mockData';

export const categoryService = {
  /**
   * Fetch all service categories with fallback to defaults
   */
  async getCategories() {
    try {
      const response = await api.get('/categories');
      const data = response.data.data;
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
      return CATEGORIES;
    } catch {
      return CATEGORIES;
    }
  },

  /**
   * Get single category by ID
   */
  async getCategoryById(id) {
    try {
      const response = await api.get(`/categories/${id}`);
      return response.data.data;
    } catch (err) {
      throw new Error(extractErrorMessage(err));
    }
  },
};
