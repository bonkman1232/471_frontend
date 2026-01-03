const rawBase = (import.meta as any).env?.VITE_BASE_API_URL || '';

// If a custom base is provided, ensure it points to the backend API mount
// (many backends mount their routes under /api). If the provided base
// already contains '/api' we keep it; otherwise we append '/api'.
export const API_BASE = rawBase
  ? rawBase.replace(/\/$/, '') + (rawBase.includes('/api') ? '' : '/api')
  : '/api';

export function apiPath(path: string) {
  if (!path) return API_BASE;
  return `${API_BASE}${path.startsWith('/') ? path : `/${path}`}`;
}

export default API_BASE;
