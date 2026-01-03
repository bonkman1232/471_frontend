export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  studentId?: string;
  department?: string;
  phone?: string;
}

import apiClient from './apiClient';

class AuthService {
  private getAuthToken(): string | null {
    return localStorage.getItem('token');
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const token = this.getAuthToken();
      if (!token) return null;

      const response = await apiClient.get('/auth/me');
      const data = response.data;
      if (!data || !data.success) {
        throw new Error(data?.error || 'Failed to fetch user');
      }
      return data.user;
    } catch (error) {
      // If 401, clear token
      // axios errors expose response
      if ((error as any)?.response?.status === 401) {
        localStorage.removeItem('token');
        return null;
      }
      console.error('Error fetching current user:', error);
      return null;
    }
  }
}

export const authService = new AuthService();
