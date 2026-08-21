import { create } from 'zustand';
import { bookingService } from '../services/bookingService';
import { paymentService } from '../services/paymentService';
import { MOCK_BOOKINGS } from '../data/mockData';

const ENRICHED_MOCK_BOOKINGS = [
  {
    id: 'b-101',
    serviceTitle: 'Emergency Pipe Leak & Fitting Replacement',
    providerName: 'Abebe Girma',
    providerId: '1',
    initials: 'AG',
    avatarColor: '#0284C7',
    scheduledDate: 'Today, 2:30 PM',
    address: 'Bole Rwanda, Near Edna Mall, Addis Ababa',
    subCity: 'Bole',
    agreedPrice: 650,
    currency: 'ETB',
    paymentMethod: 'telebirr',
    paymentMethodLabel: 'Telebirr 📱',
    paymentPhone: '+251 91 123 4567',
    status: 'in_progress',
    escrowStatus: 'funded_locked', // 'funded_locked' | 'work_completed' | 'released' | 'disputed'
    escrowRef: 'ESC-2026-9812',
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    hours: 2,
    rating: null,
  },
  {
    id: 'b-102',
    serviceTitle: '3-Bedroom Apartment Deep Cleaning & Sanitization',
    providerName: 'Bethlehem Tadesse',
    providerId: '2',
    initials: 'BT',
    avatarColor: '#10B981',
    scheduledDate: 'Tomorrow, 9:00 AM',
    address: 'CMC Michael, Tsehay Real Estate, Addis Ababa',
    subCity: 'CMC / Yeka',
    agreedPrice: 1200,
    currency: 'ETB',
    paymentMethod: 'cbe_birr',
    paymentMethodLabel: 'CBE Birr 🏦',
    paymentPhone: '+251 92 987 6543',
    status: 'scheduled',
    escrowStatus: 'funded_locked',
    escrowRef: 'ESC-2026-9844',
    createdAt: new Date(Date.now() - 3600000 * 18).toISOString(),
    hours: 4,
    rating: null,
  },
  {
    id: 'b-103',
    serviceTitle: 'Laptop Liquid Damage Repair & SSD Recovery',
    providerName: 'Dawit Mengistu',
    providerId: '3',
    initials: 'DM',
    avatarColor: '#D97706',
    scheduledDate: 'Aug 18, 2026',
    address: 'Kazanchis, Supermarket Building #4, Addis Ababa',
    subCity: 'Kazanchis',
    agreedPrice: 850,
    currency: 'ETB',
    paymentMethod: 'awash_birr',
    paymentMethodLabel: 'Awash Birr 🟡',
    paymentPhone: '+251 94 456 7890',
    status: 'completed',
    escrowStatus: 'released',
    escrowRef: 'ESC-2026-9721',
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    hours: 3,
    rating: 5,
    clientReview: 'Excellent technician! Recovered all my work files and laptop runs fast.',
  },
];

export const useBookingStore = create((set, get) => ({
  bookings: ENRICHED_MOCK_BOOKINGS,
  selectedBooking: null,
  activeTab: 'all', // 'all' | 'in_progress' | 'scheduled' | 'completed' | 'disputed'

  // Modals State
  isReleaseModalOpen: false,
  releaseTargetBooking: null,
  isDisputeModalOpen: false,
  disputeTargetBooking: null,
  isReceiptModalOpen: false,
  receiptTargetBooking: null,

  setActiveTab: (tab) => set({ activeTab: tab }),

  openReleaseModal: (booking) => set({ isReleaseModalOpen: true, releaseTargetBooking: booking }),
  closeReleaseModal: () => set({ isReleaseModalOpen: false, releaseTargetBooking: null }),

  openDisputeModal: (booking) => set({ isDisputeModalOpen: true, disputeTargetBooking: booking }),
  closeDisputeModal: () => set({ isDisputeModalOpen: false, disputeTargetBooking: null }),

  openReceiptModal: (booking) => set({ isReceiptModalOpen: true, receiptTargetBooking: booking }),
  closeReceiptModal: () => set({ isReceiptModalOpen: false, receiptTargetBooking: null }),

  /**
   * Create new booking from checkout flow
   */
  createBookingFromCheckout: ({
    provider,
    service,
    scheduledDate,
    scheduledTime,
    subCity,
    address,
    notes,
    paymentMethod,
    paymentPhone,
    agreedPrice,
    hours = 2,
  }) => {
    const methodLabels = {
      telebirr: 'Telebirr 📱',
      cbe_birr: 'CBE Birr 🏦',
      awash_birr: 'Awash Birr 🟡',
      dashen_amole: 'Dashen Amole 🔵',
      bank_card: 'Bank Card (Visa/MC) 💳',
    };

    const newBooking = {
      id: `b-${Date.now()}`,
      serviceTitle: service?.name || provider.headline || 'Specialist Service',
      providerName: provider.name,
      providerId: provider.id,
      initials: provider.initials || provider.name?.slice(0, 2).toUpperCase(),
      avatarColor: provider.avatarColor || '#0284C7',
      scheduledDate: `${scheduledDate}, ${scheduledTime}`,
      address: `${address || 'Neighborhood area'}, ${subCity || 'Addis Ababa'}`,
      subCity: subCity || 'Bole',
      notes: notes || '',
      agreedPrice: Number(agreedPrice) || 500,
      currency: 'ETB',
      paymentMethod: paymentMethod || 'telebirr',
      paymentMethodLabel: methodLabels[paymentMethod] || 'Telebirr 📱',
      paymentPhone: paymentPhone || '+251 91 000 0000',
      status: 'in_progress',
      escrowStatus: 'funded_locked',
      escrowRef: `ESC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: new Date().toISOString(),
      hours: Number(hours) || 2,
      rating: null,
    };

    set((state) => ({
      bookings: [newBooking, ...state.bookings],
    }));

    return newBooking;
  },

  /**
   * Fetch bookings from backend
   */
  loadBookings: async () => {
    try {
      const liveBookings = await bookingService.getBookings();
      if (liveBookings && liveBookings.length > 0) {
        set({ bookings: liveBookings });
      }
    } catch {
      // Retain mock fallback
    }
  },

  /**
   * Client approves delivery and releases funds from Escrow Vault
   */
  releaseEscrowFunds: async (bookingId, rating = 5, review = '') => {
    try {
      await paymentService.confirmDelivery(bookingId);
    } catch {
      // Local optimistic update
    }
    set((state) => ({
      bookings: state.bookings.map((b) =>
        b.id === bookingId
          ? {
              ...b,
              status: 'completed',
              escrowStatus: 'released',
              rating,
              clientReview: review || 'Work completed to satisfaction. Escrow released.',
              releasedAt: new Date().toISOString(),
            }
          : b
      ),
      isReleaseModalOpen: false,
      releaseTargetBooking: null,
    }));
  },

  /**
   * Client raises dispute / requests mediation
   */
  raiseDispute: async (bookingId, reason) => {
    try {
      await paymentService.raiseDispute(bookingId, { reason });
    } catch {
      // Local optimistic update
    }
    set((state) => ({
      bookings: state.bookings.map((b) =>
        b.id === bookingId
          ? {
              ...b,
              status: 'disputed',
              escrowStatus: 'disputed',
              disputeReason: reason || 'Client requested mediation',
              disputedAt: new Date().toISOString(),
            }
          : b
      ),
      isDisputeModalOpen: false,
      disputeTargetBooking: null,
    }));
  },
}));
