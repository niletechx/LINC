import { create } from 'zustand'
import { authApi, usersApi } from '../api'

export const useAuthStore = create((set, get) => ({
  user: JSON.parse(localStorage.getItem('linc_user') || 'null'),
  token: localStorage.getItem('linc_token'),
  loading: false,
  initialized: false,

  init: async () => {
    const token = localStorage.getItem('linc_token')
    if (!token) { set({ initialized: true }); return }
    try {
      const user = await authApi.me()
      localStorage.setItem('linc_user', JSON.stringify(user))
      set({ user, token, initialized: true })
    } catch {
      localStorage.removeItem('linc_token')
      localStorage.removeItem('linc_user')
      set({ user: null, token: null, initialized: true })
    }
  },

  login: async (email, password) => {
    set({ loading: true })
    try {
      const { user, token } = await authApi.login({ email, password })
      localStorage.setItem('linc_token', token)
      localStorage.setItem('linc_user', JSON.stringify(user))
      set({ user, token, loading: false })
      return user
    } catch (err) {
      set({ loading: false })
      throw err
    }
  },

  register: async (data) => {
    set({ loading: true })
    try {
      const { user, token } = await authApi.register(data)
      localStorage.setItem('linc_token', token)
      localStorage.setItem('linc_user', JSON.stringify(user))
      set({ user, token, loading: false })
      return user
    } catch (err) {
      set({ loading: false })
      throw err
    }
  },

  logout: async () => {
    try { await authApi.logout() } catch { /* ignore */ }
    localStorage.removeItem('linc_token')
    localStorage.removeItem('linc_user')
    set({ user: null, token: null })
  },

  refreshUser: async () => {
    const user = await usersApi.me()
    localStorage.setItem('linc_user', JSON.stringify(user))
    set({ user })
    return user
  },

  isAdmin: () => !!get().user?.is_admin,
  isAuthenticated: () => !!get().token,
}))
