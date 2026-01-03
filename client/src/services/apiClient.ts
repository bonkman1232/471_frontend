import axios from 'axios';
import { API_BASE } from '../config/api';

export const apiClient = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' }
});

// Attach auth token automatically when present
apiClient.interceptors.request.use((config: any) => {
  try {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers = config.headers || {};
      if (!config.headers['Authorization']) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    }
  } catch (e) {
    // ignore in non-browser environments
  }
  return config;
});

export default apiClient;
