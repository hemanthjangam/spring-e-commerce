import axios from 'axios';
import { API_BASE_URL } from '../api';

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
  timeout: 10000,
});

apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, error => {
  return Promise.reject(error);
});

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

export const createCategory = (formData) => {
    return apiClient.post('/categories', formData);
};

export default apiClient;