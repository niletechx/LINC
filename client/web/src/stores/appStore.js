import { create } from 'zustand';
import { MOCK_NOTIFICATIONS } from '../data/mockData';

export const useAppStore = create((set, get) => ({
  // App Mode: 'client' | 'provider'
  appMode: 'client',
  setAppMode: (mode) => set({ appMode: mode }),
  toggleAppMode: () =>
    set((state) => ({
      appMode: state.appMode === 'client' ? 'provider' : 'client',
    })),

  // Current selected location in Addis Ababa
  currentLocation: 'Bole, Addis Ababa',
  setCurrentLocation: (loc) => set({ currentLocation: loc }),

  // Notifications
  notifications: MOCK_NOTIFICATIONS,
  unreadNotificationsCount: MOCK_NOTIFICATIONS.filter((n) => !n.read).length,
  markAllNotificationsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
      unreadNotificationsCount: 0,
    })),

  // Modals state
  isPostRequestOpen: false,
  setPostRequestOpen: (open) => set({ isPostRequestOpen: open }),

  isLocationPickerOpen: false,
  setLocationPickerOpen: (open) => set({ isLocationPickerOpen: open }),

  isNotificationsOpen: false,
  setNotificationsOpen: (open) => set({ isNotificationsOpen: open }),

  // Active selected provider for modal view
  selectedProviderForDetails: null,
  setSelectedProviderForDetails: (provider) =>
    set({ selectedProviderForDetails: provider }),

  // Auth Prompt Modal
  isAuthModalOpen: false,
  authModalReason: '',
  openAuthModal: (reason = 'Please sign in or create an account to continue.') =>
    set({ isAuthModalOpen: true, authModalReason: reason }),
  closeAuthModal: () => set({ isAuthModalOpen: false, authModalReason: '' }),

  // Toasts
  toast: null,
  showToast: (message, type = 'info') => {
    set({ toast: { message, type, id: Date.now() } });
    setTimeout(() => {
      set((state) => (state.toast?.id ? { toast: null } : state));
    }, 4000);
  },
  hideToast: () => set({ toast: null }),
}));
