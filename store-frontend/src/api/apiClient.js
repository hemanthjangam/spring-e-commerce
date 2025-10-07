/* ========================= src/api/apiClient.js (FINAL FIX) ========================= */
import axios from 'axios';
import { API_BASE_URL } from '../api';
/**
 * Global function to handle 401/403 errors: clears token and forces logout/redirect.
 */
const handleUnauthorized = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');

    console.error("[API Client] Session expired or unauthorized. Clearing authentication data.");

    if (window.location.pathname !== '/login') {
        window.location.href = '/login';
    }
};

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  // CRITICAL FIX: Removed default 'Content-Type: application/json' header
  // to avoid conflicts with multipart/form-data.
  timeout: 10000,
});

// --- 1. Request Interceptor: Attach JWT Token ---
apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, error => {
  return Promise.reject(error);
});

// --- 2. Response Interceptor: Handle 401/403 Errors ---
apiClient.interceptors.response.use(
  response => response,
  error => {
    const status = error.response ? error.response.status : null;

    if (status === 401 || status === 403) {
      console.warn(`[API Client] Unauthorized access detected (${status}).`);
      handleUnauthorized();
    }

    return Promise.reject(error);
  }
);

export default apiClient;