import { createContext, useContext, useState, ReactNode } from 'react';
import type { UserRole } from '@/lib/types';

interface AuthContextType {
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  userName: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentRole, setCurrentRole] = useState<UserRole>('ADMIN');
  
  const userName = 'Marie Dupont'; // Mock user

  return (
    <AuthContext.Provider value={{ currentRole, setCurrentRole, userName }}>
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
