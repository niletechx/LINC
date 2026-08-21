import { api, extractErrorMessage } from './api';

export const reviewService = {
  /**
   * List reviews for an entity (provider, business, organization)
   */
  async listReviews(entityType, entityId) {
    try {
      const response = await api.get(`/reviews/${entityType}/${entityId}`);
      return response.data.data || [];
    } catch (err) {
      throw new Error(extractErrorMessage(err));
    }
  },

  /**
   * List authenticated user's submitted reviews
   */
  async getMyReviews() {
    try {
      const response = await api.get('/reviews/me');
      return response.data.data || [];
    } catch (err) {
      throw new Error(extractErrorMessage(err));
    }
  },

  /**
   * Create a new review for a completed booking
   * @param {Object} data { booking_id, entity_type, entity_id, rating, comment }
   */
  async createReview(data) {
    try {
      const response = await api.post('/reviews', data);
      return response.data.data;
    } catch (err) {
      throw new Error(extractErrorMessage(err));
    }
  },

  /**
   * Update an existing review
   */
  async updateReview(id, data) {
    try {
      const response = await api.put(`/reviews/${id}`, data);
      return response.data.data;
    } catch (err) {
      throw new Error(extractErrorMessage(err));
    }
  },
};
