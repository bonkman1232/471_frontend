export const API_BASE = (import.meta as any).env?.VITE_BASE_API_URL || '/api';

export function apiPath(path: string) {
  if (!path) return API_BASE;
  // ensure path begins with /
  return `${API_BASE}${path.startsWith('/') ? path : `/${path}`}`;
}

export default API_BASE;
