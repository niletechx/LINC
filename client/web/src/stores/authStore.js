import { create } from 'zustand';
import { authService } from '../services/authService';
import { APP_CONFIG, DEMO_ACCOUNTS } from '../config/constants';

const getInitialUser = () => {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(APP_CONFIG.storageKeys.user);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

const getInitialToken = () => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(APP_CONFIG.storageKeys.token) || null;
};

export const useAuthStore = create((set, get) => ({
  user: getInitialUser(),
  token: getInitialToken(),
  isAuthenticated: !!getInitialToken() || !!getInitialUser(),
  isLoading: false,
  error: null,
  isDemoMode: false,

  clearError: () => set({ error: null }),

  /**
   * Standard Login
   */
  login: async ({ email, password }) => {
    set({ isLoading: true, error: null });
    try {
      const { user, token } = await authService.login({ email, password });
      set({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
        isDemoMode: false,
      });
      return { user, token };
    } catch (err) {
      set({ isLoading: false, error: err.message });
      throw err;
    }
  },

  /**
   * Standard Registration
   */
  register: async (registerData) => {
    set({ isLoading: true, error: null });
    try {
      const { user, token } = await authService.register(registerData);
      set({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
        isDemoMode: false,
      });
      return { user, token };
    } catch (err) {
      set({ isLoading: false, error: err.message });
      throw err;
    }
  },

  setUser: (user) => {
    localStorage.setItem(APP_CONFIG.storageKeys.user, JSON.stringify(user));
    set({ user });
  },

  /**
   * Fast 1-Click Demo Login
   */
  loginAsDemo: (demoAccountKey) => {
    const demo = DEMO_ACCOUNTS.find(
      (a) => a.id === demoAccountKey || a.role === demoAccountKey
    ) || DEMO_ACCOUNTS[0];

    const mockUser = {
      id: `demo-${demo.role}-${Date.now()}`,
      full_name: demo.name,
      email: demo.email,
      username: demo.name.toLowerCase().replace(/\s+/g, '_'),
      role: demo.role,
      location_city: demo.city,
      headline: demo.headline,
      is_verified: true,
      is_admin: demo.is_admin || demo.role === 'admin',
      avatar_url: null,
    };

    const mockToken = `demo-token-${demo.role}`;
    localStorage.setItem(APP_CONFIG.storageKeys.token, mockToken);
    localStorage.setItem(APP_CONFIG.storageKeys.user, JSON.stringify(mockUser));

    set({
      user: mockUser,
      token: mockToken,
      isAuthenticated: true,
      isLoading: false,
      error: null,
      isDemoMode: true,
    });
  },

  /**
   * Fetch current authenticated user
   */
  fetchMe: async () => {
    const { token, isDemoMode } = get();
    if (!token || isDemoMode) return;
    try {
      const user = await authService.getMe();
      set({ user, isAuthenticated: true });
    } catch {
      // If fetching fails, clear invalid session
      get().logout();
    }
  },

  /**
   * Sign Out
   */
  logout: async () => {
    set({ isLoading: true });
    try {
      await authService.logout();
    } finally {
      localStorage.removeItem(APP_CONFIG.storageKeys.token);
      localStorage.removeItem(APP_CONFIG.storageKeys.user);
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        isDemoMode: false,
      });
    }
  },
}));
