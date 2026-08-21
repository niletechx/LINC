import api from './client'

const get = async (url, params) => (await api.get(url, { params })).data.data
const post = async (url, body) => (await api.post(url, body)).data.data
const put = async (url, body) => (await api.put(url, body)).data.data
const del = async (url) => (await api.delete(url)).data.data

export const authApi = {
  register: (body) => post('/auth/register', body),
  login: (body) => post('/auth/login', body),
  logout: () => post('/auth/logout'),
  me: () => get('/auth/me'),
}

export const usersApi = {
  me: () => get('/users/me'),
  updateMe: (body) => put('/users/me', body),
}

export const providersApi = {
  list: (params) => get('/providers', params),
  get: (id) => get(`/providers/${id}`),
  me: () => get('/providers/me'),
  create: (body) => post('/providers/me', body),
  update: (body) => put('/providers/me', body),
}

export const businessesApi = {
  list: (params) => get('/businesses', params),
  get: (id) => get(`/businesses/${id}`),
  me: () => get('/businesses/me'),
  create: (body) => post('/businesses/me', body),
  update: (body) => put('/businesses/me', body),
}

export const organizationsApi = {
  list: (params) => get('/organizations', params),
  get: (id) => get(`/organizations/${id}`),
  me: () => get('/organizations/me'),
  create: (body) => post('/organizations/me', body),
  update: (body) => put('/organizations/me', body),
}

export const servicesApi = {
  list: (params) => get('/services', params),
  get: (id) => get(`/services/${id}`),
  create: (body) => post('/services', body),
  update: (id, body) => put(`/services/${id}`, body),
  delete: (id) => del(`/services/${id}`),
}

export const categoriesApi = {
  list: () => get('/categories'),
}

export const requestsApi = {
  list: (params) => get('/requests', params),
  get: (id) => get(`/requests/${id}`),
  create: (body) => post('/requests', body),
  update: (id, body) => put(`/requests/${id}`, body),
}

export const matchingApi = {
  list: (requestId) => get(`/matching/requests/${requestId}`),
  create: (requestId, body) => post(`/matching/requests/${requestId}`, body),
  updateStatus: (id, status) => put(`/matching/${id}`, { status }),
}

export const aiApi = {
  chat: (body) => post('/ai/chat', body),
}

export const bookingsApi = {
  list: () => get('/bookings'),
  get: (id) => get(`/bookings/${id}`),
  create: (body) => post('/bookings', body),
  update: (id, body) => put(`/bookings/${id}`, body),
  complete: (id) => post(`/bookings/${id}/complete`),
}

export const messagingApi = {
  conversations: () => get('/messaging/conversations'),
  createConversation: (body) => post('/messaging/conversations', body),
  messages: (id) => get(`/messaging/conversations/${id}`),
  sendMessage: (id, body) => post(`/messaging/conversations/${id}/messages`, body),
  markRead: (id) => put(`/messaging/conversations/${id}/read`),
}

export const reviewsApi = {
  list: (entityType, entityId) => get(`/reviews/${entityType}/${entityId}`),
  myReviews: () => get('/reviews/me'),
  create: (body) => post('/reviews', body),
}

export const verificationApi = {
  myRequests: () => get('/verification/me'),
  create: (body) => post('/verification', body),
  review: (id, body) => put(`/verification/${id}/review`, body),
}

export const reportsApi = {
  create: (body) => post('/reports', body),
}

export const adminApi = {
  overview: () => get('/admin/overview'),
  users: (params) => get('/admin/users', params),
  reports: () => get('/admin/reports'),
  verificationRequests: () => get('/admin/verification-requests'),
}

export const notificationsApi = {
  list: () => get('/notifications'),
  markRead: (id) => put(`/notifications/${id}/read`),
  markAllRead: () => put('/notifications/read-all'),
}
