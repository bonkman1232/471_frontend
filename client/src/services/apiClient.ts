import axios from 'axios';
import { API_BASE } from '../config/api';

export const apiClient = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000
});

// Attach auth token automatically when present and log requests
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

  try {
    const fullUrl = `${config.baseURL || ''}${config.url || ''}`;
    // eslint-disable-next-line no-console
    console.debug('[apiClient] Request:', config.method?.toUpperCase(), fullUrl, config);
  } catch (e) {}

  return config;
});

// Log responses and surface useful error details
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    try {
      const cfg = error?.config || {};
      const fullUrl = `${cfg.baseURL || ''}${cfg.url || ''}`;
      const status = error?.response?.status;
      const data = error?.response?.data;
      // eslint-disable-next-line no-console
      console.error('[apiClient] Error:', cfg.method?.toUpperCase(), fullUrl, 'status=', status, 'data=', data, error?.message);
    } catch (e) {
      // ignore logging errors
    }
    return Promise.reject(error);
  }
);

export default apiClient;
