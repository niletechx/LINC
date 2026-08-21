import { api, extractErrorMessage } from './api';

export const paymentService = {
  /**
   * Initiate Chapa Escrow transaction for a booking
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
   * Verify Chapa payment transaction
   */
  async verifyPayment(txRef) {
    try {
      const response = await api.get(`/payments/chapa/verify/${txRef}`);
      return response.data.data;
    } catch (err) {
      throw new Error(extractErrorMessage(err));
    }
  },

  /**
   * Confirm service delivery and release escrow funds to provider
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
   * Raise dispute on an escrow transaction
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

  /**
   * Get single escrow details
   */
  async getEscrow(escrowId) {
    try {
      const response = await api.get(`/payments/escrow/${escrowId}`);
      return response.data.data;
    } catch (err) {
      throw new Error(extractErrorMessage(err));
    }
  },

  /**
   * List all escrows for current user
   */
  async listEscrows() {
    try {
      const response = await api.get('/payments/escrow');
      return response.data.data || [];
    } catch (err) {
      throw new Error(extractErrorMessage(err));
    }
  },
};
