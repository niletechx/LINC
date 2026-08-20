import { create } from 'zustand';
import { MOCK_BOOKINGS } from '../data/mockData';

export const useBookingStore = create((set, get) => ({
  bookings: MOCK_BOOKINGS,
  selectedBooking: null,
  activeTab: 'all', // 'all' | 'active' | 'upcoming' | 'completed'

  // Booking Modal Flow State
  isCreateBookingModalOpen: false,
  targetProviderForBooking: null,
  targetServiceForBooking: null,

  // Escrow Payment Modal State
  isPaymentModalOpen: false,
  paymentBookingTarget: null,

  // Dispute Modal State
  isDisputeModalOpen: false,
  disputeBookingTarget: null,

  setActiveTab: (tab) => set({ activeTab: tab }),

  openCreateBooking: (provider, service = null) => {
    set({
      isCreateBookingModalOpen: true,
      targetProviderForBooking: provider,
      targetServiceForBooking: service || (provider.services ? provider.services[0] : null),
    });
  },

  closeCreateBooking: () => {
    set({
      isCreateBookingModalOpen: false,
      targetProviderForBooking: null,
      targetServiceForBooking: null,
    });
  },

  openPaymentModal: (booking) => {
    set({ isPaymentModalOpen: true, paymentBookingTarget: booking });
  },

  closePaymentModal: () => {
    set({ isPaymentModalOpen: false, paymentBookingTarget: null });
  },

  openDisputeModal: (booking) => {
    set({ isDisputeModalOpen: true, disputeBookingTarget: booking });
  },

  closeDisputeModal: () => {
    set({ isDisputeModalOpen: false, disputeBookingTarget: null });
  },

  /**
   * Create a new booking
   */
  createBooking: ({ provider, service, scheduledDate, address, agreedPrice }) => {
    const newBooking = {
      id: `b-${Date.now()}`,
      serviceTitle: service?.name || 'Custom Service',
      providerName: provider.name,
      providerId: provider.id,
      initials: provider.initials || provider.name.split(' ').map((n) => n[0]).join(''),
      avatarColor: provider.avatarColor || '#7EC8E3',
      scheduledDate,
      address,
      agreedPrice: Number(agreedPrice) || 500,
      currency: 'ETB',
      status: 'awaiting_payment',
      escrowStatus: 'awaiting_payment',
      chapaTxRef: `LINC-${Date.now().toString().slice(-6)}`,
      createdAt: new Date().toISOString(),
    };

    set((state) => ({
      bookings: [newBooking, ...state.bookings],
      isCreateBookingModalOpen: false,
      isPaymentModalOpen: true,
      paymentBookingTarget: newBooking,
    }));

    return newBooking;
  },

  /**
   * Pay via Chapa Escrow simulation / integration
   */
  completeEscrowPayment: (bookingId) => {
    set((state) => ({
      bookings: state.bookings.map((b) =>
        b.id === bookingId
          ? { ...b, status: 'paid_escrow', escrowStatus: 'funds_held' }
          : b
      ),
      isPaymentModalOpen: false,
      paymentBookingTarget: null,
    }));
  },

  /**
   * Provider marks service complete
   */
  markServiceComplete: (bookingId) => {
    set((state) => ({
      bookings: state.bookings.map((b) =>
        b.id === bookingId
          ? { ...b, status: 'pending_confirmation', escrowStatus: 'pending_confirmation' }
          : b
      ),
    }));
  },

  /**
   * Client confirms delivery (Releases Escrow funds to Provider)
   */
  confirmDelivery: (bookingId) => {
    set((state) => ({
      bookings: state.bookings.map((b) =>
        b.id === bookingId
          ? { ...b, status: 'completed', escrowStatus: 'released' }
          : b
      ),
    }));
  },

  /**
   * Client raises dispute
   */
  raiseDispute: (bookingId, reason) => {
    set((state) => ({
      bookings: state.bookings.map((b) =>
        b.id === bookingId
          ? { ...b, status: 'disputed', escrowStatus: 'disputed', disputeReason: reason }
          : b
      ),
      isDisputeModalOpen: false,
      disputeBookingTarget: null,
    }));
  },
}));
