import { createContext, useContext, useState, ReactNode } from 'react';
import type { UserRole } from '@/lib/types';

interface AuthContextType {
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  userName: string;
  userId: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentRole, setCurrentRole] = useState<UserRole>('ADMIN');
  
  // Mock user - Alice Martin is ADMIN (usr_001)
  const userName = 'Alice Martin';
  const userId = 'usr_001';

  return (
    <AuthContext.Provider value={{ currentRole, setCurrentRole, userName, userId }}>
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
