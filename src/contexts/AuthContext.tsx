/**
 * Authentication Context
 * Following CLAUDE.md patterns: proper error handling, service layer usage
 */

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '@/lib/services/authService';
import type { User, UserRole } from '@/lib/types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  logout: () => Promise<void>;
  // Legacy props for backward compatibility
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  userName: string;
  userId: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Load user on mount (only if we might be authenticated)
  useEffect(() => {
    // Skip loading user if we're on public pages
    const publicPaths = ['/login', '/auth/verify'];
    const currentPath = window.location.pathname;

    if (publicPaths.some(path => currentPath.startsWith(path))) {
      setIsLoading(false);
      return;
    }

    loadUser();
  }, []);

  // Listen for unauthorized events from API client
  useEffect(() => {
    const handleUnauthorized = () => {
      console.log('Session expired, redirecting to login...');
      setUser(null);
      navigate('/login');
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, [navigate]);

  const loadUser = async () => {
    try {
      setIsLoading(true);
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error('Failed to load user:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      // Force logout even if API call fails
      setUser(null);
      navigate('/login');
    }
  };

  // Legacy compatibility props
  const currentRole: UserRole = user?.role || user?.roles?.[0] || 'ADMIN';
  const userName = user?.firstName && user?.lastName
    ? `${user.firstName} ${user.lastName}`
    : user?.name || '';
  const userId = user?.id || '';

  const setCurrentRole = (role: UserRole) => {
    if (user) {
      setUser({ ...user, roles: [role] });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        setUser,
        logout,
        // Legacy props
        currentRole,
        setCurrentRole,
        userName,
        userId,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
