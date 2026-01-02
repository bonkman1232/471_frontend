import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { AuthUser, UserRole } from '../types/auth';

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  userRole: UserRole;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: AuthUser, token: string) => void;
  logout: () => void;
  setUserRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<UserRole>('student');
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!token && !!user;

  useEffect(() => {
    // Check for existing auth on mount
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    const savedRole = localStorage.getItem('userRole');

    if (savedToken && savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        setToken(savedToken);
        setUserRole((savedRole as UserRole) || 'student');
      } catch (error) {
        console.error('Error parsing saved user data:', error);
        // Clear invalid data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('userRole');
      }
    }
    setIsLoading(false);
  }, []);

  const login = (userData: AuthUser, userToken: string) => {
    setUser(userData);
    setToken(userToken);
    setUserRole(userData.roles[0] as UserRole || 'student');
    
    // Save to localStorage
    localStorage.setItem('token', userToken);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('userRole', userData.roles[0] || 'student');
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setUserRole('student');
    
    // Clear localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userRole');
  };

  const handleSetUserRole = (role: UserRole) => {
    setUserRole(role);
    localStorage.setItem('userRole', role);
  };

  const value: AuthContextType = {
    user,
    token,
    userRole,
    isAuthenticated,
    isLoading,
    login,
    logout,
    setUserRole: handleSetUserRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
