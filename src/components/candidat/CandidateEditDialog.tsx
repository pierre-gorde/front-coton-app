/**
 * Candidate Edit Dialog
 * Dialog for editing candidate information (GitHub username and repo URL)
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
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

interface CandidateEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  candidate: Candidate;
  candidateUser: { firstName?: string; lastName?: string; githubUsername?: string | null } | null;
  onSuccess: () => void;
}

export function CandidateEditDialog({
  open,
  onOpenChange,
  candidate,
  candidateUser,
  onSuccess,
}: CandidateEditDialogProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    githubUsername: '',
    githubRepoUrl: '',
  });

  // Initialize form data when dialog opens
  useEffect(() => {
    if (open) {
      setFormData({
        githubUsername: candidateUser?.githubUsername || '',
        githubRepoUrl: candidate.githubRepoUrl || '',
      });
    }
  }, [open, candidate.githubRepoUrl, candidateUser?.githubUsername]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate GitHub URL format if provided
    if (formData.githubRepoUrl && formData.githubRepoUrl.trim()) {
      const githubUrlRegex = /^https:\/\/github\.com\/[\w-]+\/[\w-]+\/?$/;
      if (!githubUrlRegex.test(formData.githubRepoUrl.trim())) {
        toast({
          title: 'Erreur',
          description: 'URL GitHub invalide. Format attendu: https://github.com/owner/repo',
          variant: 'destructive',
        });
        return;
      }
    }

    try {
      setIsLoading(true);

      // Import dynamically to avoid circular dependencies
      const { updateCandidate } = await import('@/lib/services/checkAdminService');

      await updateCandidate(candidate.id, {
        githubUsername: formData.githubUsername.trim() || null,
        githubRepoUrl: formData.githubRepoUrl.trim() || null,
      });

      toast({
        title: 'Succès',
        description: 'Informations du candidat mises à jour',
        variant: 'success',
      });

      // Call success callback
      onSuccess();

      // Close dialog
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to update candidate:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de mettre à jour les informations',
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
          <DialogTitle>Modifier les informations du candidat</DialogTitle>
          <DialogDescription>
            Mettre à jour le nom d'utilisateur GitHub et le repository
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {/* GitHub Username */}
            <div className="space-y-2">
              <Label htmlFor="githubUsername">
                Nom d'utilisateur GitHub
              </Label>
              <Input
                id="githubUsername"
                placeholder="username"
                value={formData.githubUsername}
                onChange={(e) => setFormData({ ...formData, githubUsername: e.target.value })}
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground">
                Le nom d'utilisateur GitHub du candidat
              </p>
            </div>

            {/* GitHub Repository URL */}
            <div className="space-y-2">
              <Label htmlFor="githubRepoUrl">
                URL du repository GitHub
              </Label>
              <Input
                id="githubRepoUrl"
                placeholder="https://github.com/owner/repo"
                value={formData.githubRepoUrl}
                onChange={(e) => setFormData({ ...formData, githubRepoUrl: e.target.value })}
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground">
                Le repository de test du candidat
              </p>
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
                  Enregistrement...
                </>
              ) : (
                'Enregistrer'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
