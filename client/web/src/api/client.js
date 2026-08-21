import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('linc_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('linc_token')
      localStorage.removeItem('linc_user')
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login'
      }
    }
    return Promise.reject(err)
  },
)

export function extractError(err) {
  const data = err.response?.data
  if (data?.message) return data.message
  if (data?.errors?.[0]?.message) return data.errors[0].message
  if (err.message === 'Network Error') return 'Unable to connect to LINC server.'
  return err.message || 'Something went wrong'
}

export default api
