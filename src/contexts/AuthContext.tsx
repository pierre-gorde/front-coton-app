/**
 * Authentication Context
 * Following CLAUDE.md patterns: proper error handling, service layer usage
 */

import { ReactNode, createContext, useContext, useEffect, useState } from 'react';
import type { RoleEnum, User } from '@/lib/types';

import { authService } from '@/lib/services/authService';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;
  roles: RoleEnum[];
  setRoles: (roles: RoleEnum[]) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [roles, setRoles] = useState<RoleEnum[]>([]);
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

    refreshUser();
  }, []);

  // Listen for user refresh event (triggered after login)
  useEffect(() => {
    const handleRefreshUser = () => {
      refreshUser();
    };

    window.addEventListener('auth:refresh', handleRefreshUser);
    return () => window.removeEventListener('auth:refresh', handleRefreshUser);
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

  const refreshUser = async (): Promise<void> => {
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

  useEffect(() => {
    if (user) {
      setRoles(user.roles?.map(r => r.role?.name ?? '') as RoleEnum[]);
    }
  }, [user, setRoles]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        refreshUser,
        logout,
        roles,
        setRoles,
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
