/**
 * Login Page - Magic Link Authentication
 * Following CLAUDE.md patterns: proper state management, error handling with toasts
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { authService } from '@/lib/services/authService';
import { AUTH_SUCCESS, AUTH_ERRORS } from '@/lib/constants/auth';
import { Mail, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast({
        title: 'Erreur',
        description: 'Veuillez entrer votre email',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsLoading(true);

      // Request magic link with frontend URL
      // Backend needs to know the frontend URL to construct the magic link
      const frontendUrl = window.location.origin; // http://localhost:8080
      await authService.requestMagicLink(email, frontendUrl);

      setEmailSent(true);

      toast({
        title: 'Email envoyé !',
        description: AUTH_SUCCESS.LOGIN_REQUEST,
      });
    } catch (error) {
      console.error('Failed to request magic link:', error);

      toast({
        title: 'Erreur',
        description: AUTH_ERRORS.NETWORK_ERROR,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl gradient-accent flex items-center justify-center">
              <span className="text-lg font-bold text-primary">C</span>
            </div>
            <span className="text-2xl font-semibold text-foreground tracking-tight">COTON</span>
          </div>

          <Card className="shadow-elevated border-0">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl">Connexion</CardTitle>
              <CardDescription>
                {emailSent
                  ? 'Un email vous a été envoyé'
                  : 'Entrez votre email pour recevoir un lien de connexion'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {emailSent ? (
                <div className="text-center space-y-4 py-4">
                  <div className="flex justify-center">
                    <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                      <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Un email a été envoyé à <strong>{email}</strong>
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Cliquez sur le lien dans l'email pour vous connecter
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Button
                      variant="default"
                      onClick={() => {
                        window.open('https://mail.google.com/mail/u/0/#search/from%3A(Collectif+Coton)', '_blank');
                      }}
                      className="w-full gradient-accent text-accent-foreground"
                    >
                      <Mail className="mr-2 h-4 w-4" />
                      Ouvrir Gmail
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setEmailSent(false);
                        setEmail('');
                      }}
                      className="w-full"
                    >
                      Renvoyer un email
                    </Button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="votre@email.com"
                      className="h-11"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isLoading}
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-11 gradient-accent text-accent-foreground font-medium"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Envoi en cours...
                      </>
                    ) : (
                      <>
                        <Mail className="mr-2 h-4 w-4" />
                        Envoyer le magic link
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>

          <p className="text-center text-sm text-muted-foreground">
            Pas encore de compte ?{' '}
            <Link to="#" className="text-accent hover:underline font-medium">
              Contactez l'administrateur
            </Link>
          </p>
        </div>
      </div>

      {/* Right side - Branding */}
      <div className="hidden lg:flex flex-1 gradient-primary items-center justify-center p-12">
        <div className="max-w-lg text-center text-primary-foreground">
          <h2 className="text-4xl font-bold mb-4">
            Bienvenue sur COTON Dashboard
          </h2>
          <p className="text-lg opacity-80 mb-6">
            La plateforme de gestion pour le collectif de freelances.
            Gérez vos missions, suivez vos candidats et optimisez votre recrutement.
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 backdrop-blur-sm">
            <Mail className="h-5 w-5" />
            <span className="text-sm">Connexion sans mot de passe avec Magic Link</span>
          </div>
        </div>
      </div>
    </div>
  );
}
