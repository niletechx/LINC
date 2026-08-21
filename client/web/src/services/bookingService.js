import { api, extractErrorMessage } from './api';
import { MOCK_BOOKINGS } from '../data/mockData';

export const bookingService = {
  /**
   * Fetch all user bookings
   */
  async getBookings() {
    try {
      const response = await api.get('/bookings');
      return response.data.data || MOCK_BOOKINGS;
    } catch {
      return MOCK_BOOKINGS;
    }
  },

  /**
   * Create a new booking
   */
  async createBooking(bookingData) {
    try {
      const response = await api.post('/bookings', bookingData);
      return response.data.data;
    } catch (err) {
      throw new Error(extractErrorMessage(err));
    }
  },

  /**
   * Initiate Chapa Escrow for a booking
   */
  async initiateEscrow(bookingId) {
    try {
      const response = await api.post('/payments/escrow/initiate', { bookingId });
      return response.data.data; // { escrowId, checkoutUrl, txRef }
    } catch (err) {
      throw new Error(extractErrorMessage(err));
    }
  },

  /**
   * Provider marks service complete
   */
  async markComplete(bookingId) {
    try {
      const response = await api.post(`/bookings/${bookingId}/complete`);
      return response.data.data;
    } catch (err) {
      throw new Error(extractErrorMessage(err));
    }
  },

  /**
   * Client confirms service delivery (Releases Escrow funds)
   */
  async confirmDelivery(escrowId) {
    try {
      const response = await api.post(`/payments/escrow/${escrowId}/confirm`);
      return response.data.data;
    } catch (err) {
      throw new Error(extractErrorMessage(err));
    }
  },

  /**
   * Client raises dispute on an escrow transaction
   */
  async raiseDispute(escrowId, { reason, evidenceUrls = [] }) {
    try {
      const response = await api.post(`/payments/escrow/${escrowId}/dispute`, {
        reason,
        evidenceUrls,
      });
      return response.data.data;
    } catch (err) {
      throw new Error(extractErrorMessage(err));
    }
  },
};
