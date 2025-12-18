/**
 * Candidate Create Dialog
 * Dialog for creating a new candidate (creates User + Candidate)
 * Following CLAUDE.md patterns: proper state management, error handling with toasts
 */

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import { Button } from '@/components/ui/button';
import type { Candidate } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface CandidateCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  missionId: string;
  onSuccess: (candidate: Candidate) => void;
}

export function CandidateCreateDialog({
  open,
  onOpenChange,
  missionId,
  onSuccess,
}: CandidateCreateDialogProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: null,
    email: '',
    githubUsername: null,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      toast({
        title: 'Erreur',
        description: 'Le prénom et le nom sont requis',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.email.trim()) {
      toast({
        title: 'Erreur',
        description: "L'email est requis",
        variant: 'destructive',
      });
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast({
        title: 'Erreur',
        description: 'Email invalide',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsLoading(true);

      // Import dynamically to avoid circular dependencies
      const { createCandidate } = await import('@/lib/services/checkAdminService');

      const newCandidate = await createCandidate(
        {
          firstName: formData.firstName,
          lastName: formData.lastName || null,
          email: formData.email,
          githubUsername: formData.githubUsername || null,
        },
        missionId,
      );

      toast({
        title: 'Succès',
        description: 'Candidat créé avec succès',
        variant: 'success',
      });

      // Reset form
      setFormData({
        firstName: '',
        lastName: null,
        email: '',
        githubUsername: null,
      });

      // Call success callback
      onSuccess(newCandidate);

      // Close dialog
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to create candidate:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de créer le candidat',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Nouveau candidat</DialogTitle>
          <DialogDescription>
            Ajouter un nouveau candidat à évaluer pour ce poste
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {/* First Name */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">
                  Prénom <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="firstName"
                  placeholder="Jean"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  disabled={isLoading}
                  required
                />
              </div>

              {/* Last Name */}
              <div className="space-y-2">
                <Label htmlFor="lastName">
                  Nom
                </Label>
                <Input
                  id="lastName"
                  placeholder="Dupont"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">
                Email <span className="text-destructive">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="jean.dupont@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                disabled={isLoading}
                required
              />
            </div>

            {/* GitHub Username */}
            <div className="space-y-2">
              <Label htmlFor="githubUsername">
                Nom d'utilisateur GitHub <span className="text-muted-foreground">(optionnel)</span>
              </Label>
              <Input
                id="githubUsername"
                placeholder="jdupont"
                value={formData.githubUsername}
                onChange={(e) => setFormData({ ...formData, githubUsername: e.target.value })}
                disabled={isLoading}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              className="gradient-accent text-accent-foreground"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Création...
                </>
              ) : (
                'Créer le candidat'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
