import axios from 'axios';
import { APP_CONFIG } from '../config/constants';

// Get active API base URL (allows dynamic override from ServerConfig)
export const getApiBaseUrl = () => {
  if (typeof window !== 'undefined') {
    const customUrl = localStorage.getItem(APP_CONFIG.storageKeys.apiUrl);
    if (customUrl) return customUrl;
  }
  return APP_CONFIG.defaultApiUrl;
};

// Create Axios Instance
export const api = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Request Interceptor: Attach JWT Token if present
api.interceptors.request.use(
  (config) => {
    config.baseURL = getApiBaseUrl();
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem(APP_CONFIG.storageKeys.token);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle 401 Unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(APP_CONFIG.storageKeys.token);
        localStorage.removeItem(APP_CONFIG.storageKeys.user);
      }
    }
    return Promise.reject(error);
  }
);

// Error Message Extractor (matches backend format & flutter client)
export const extractErrorMessage = (error) => {
  if (!error) return 'An unexpected error occurred';

  if (error.response && error.response.data) {
    const data = error.response.data;
    if (data.message) return data.message;
    if (data.error) return data.error;
    if (Array.isArray(data.errors) && data.errors.length > 0) {
      const first = data.errors[0];
      return typeof first === 'object' && first.message ? first.message : String(first);
    }
  }

  if (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')) {
    return `Cannot reach LINC server at ${getApiBaseUrl()}. Please check if the server is running or configure the Server IP.`;
  }

  return error.message || String(error);
};
