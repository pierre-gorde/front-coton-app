/**
 * Protected Route Component
 * Following CLAUDE.md patterns: proper component structure, type safety
 */

import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import type { RoleEnum } from '@/lib/types';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: RoleEnum;
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // Check role if required
  if (requiredRole) {
    const userRoles = user.roles?.map(ur => ur.role?.name) || [];
    const hasRequiredRole = userRoles.includes(requiredRole);

    if (!hasRequiredRole) {
      return (
        <div className="flex min-h-screen items-center justify-center p-8">
          <div className="text-center space-y-4 max-w-md">
            <div className="text-6xl">🚫</div>
            <h1 className="text-2xl font-bold">Accès refusé</h1>
            <p className="text-muted-foreground">
              Vous n'avez pas les permissions nécessaires pour accéder à cette page.
            </p>
            <p className="text-sm text-muted-foreground">
              Rôle requis: <span className="font-semibold">{requiredRole}</span>
              <br />
              Vos rôles: <span className="font-semibold">{userRoles.join(', ') || 'Aucun'}</span>
            </p>
          </div>
        </div>
      );
    }
  }

  // Render children if authenticated and authorized
  return <>{children}</>;
}
