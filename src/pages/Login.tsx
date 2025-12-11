import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);

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
                Entrez vos identifiants pour accéder au dashboard
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="votre@email.com"
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="h-11 pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-11 w-11 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Checkbox id="remember" />
                  <Label htmlFor="remember" className="text-sm text-muted-foreground cursor-pointer">
                    Se souvenir de moi
                  </Label>
                </div>
                <Link to="#" className="text-sm text-accent hover:underline">
                  Mot de passe oublié ?
                </Link>
              </div>
              <Link to="/dashboard">
                <Button className="w-full h-11 gradient-accent text-accent-foreground font-medium">
                  Se connecter
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
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
          <p className="text-lg opacity-80">
            La plateforme de gestion pour le collectif de freelances. 
            Gérez vos missions, suivez vos candidats et optimisez votre recrutement.
          </p>
        </div>
      </div>
    </div>
  );
}
