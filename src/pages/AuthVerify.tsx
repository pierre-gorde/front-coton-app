/**
 * Auth Verification Page
 * Handles magic link token verification
 * Following CLAUDE.md patterns: error handling with toasts, proper component structure
 */

import { AUTH_ERRORS, AUTH_SUCCESS } from '@/lib/constants/auth';
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { Loader2 } from 'lucide-react';
import { authService } from '@/lib/services/authService';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export function AuthVerify() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const { toast } = useToast();
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    const verifyToken = async () => {
      const token = searchParams.get('token');

      if (!token) {
        toast({
          title: 'Erreur',
          description: 'Token manquant dans l\'URL',
          variant: 'destructive',
        });
        navigate('/login');
        return;
      }

      try {
        setIsVerifying(true);
        const user = await authService.verifyAndLogin(token);

        // Set user in context
        setUser(user);

        // Trigger user refresh to ensure latest data is loaded
        window.dispatchEvent(new CustomEvent('auth:refresh'));

        toast({
          title: 'Succès',
          description: AUTH_SUCCESS.LOGIN_VERIFIED,
          variant: 'success',
        });

        // Redirect to dashboard or specified redirect URL
        const redirect = searchParams.get('redirect') || '/dashboard';
        navigate(redirect);
      } catch (error) {
        console.error('Magic link verification failed:', error);

        toast({
          title: 'Erreur',
          description: AUTH_ERRORS.INVALID_TOKEN,
          variant: 'destructive',
        });

        navigate('/login');
      } finally {
        setIsVerifying(false);
      }
    };

    verifyToken();
  }, [searchParams, navigate, setUser, toast]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-background to-muted">
      <div className="text-center space-y-4">
        <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
        <h1 className="text-2xl font-semibold">Vérification en cours...</h1>
        <p className="text-muted-foreground">
          Veuillez patienter pendant que nous vérifions votre magic link
        </p>
      </div>
    </div>
  );
}
