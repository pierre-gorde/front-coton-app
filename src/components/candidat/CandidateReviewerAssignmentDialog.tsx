/**
 * Candidate Reviewer Assignment Dialog
 * Dialog for assigning/unassigning reviewers to a specific candidate
 * Following CLAUDE.md patterns: proper state management, error handling with toasts
 */

import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Loader2 } from 'lucide-react';
import type { Candidate, User } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface CandidateReviewerAssignmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  candidate: Candidate;
  currentAssignedReviewers: User[];
  allFreelances: User[];
  onSuccess: (updatedCandidate: Candidate) => void;
}

export function CandidateReviewerAssignmentDialog({
  open,
  onOpenChange,
  candidate,
  currentAssignedReviewers,
  allFreelances,
  onSuccess,
}: CandidateReviewerAssignmentDialogProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedReviewerIds, setSelectedReviewerIds] = useState<string[]>([]);

  // Initialize selected reviewers when dialog opens
  useEffect(() => {
    if (open) {
      setSelectedReviewerIds(currentAssignedReviewers.map(r => r.id));
    }
  }, [open, currentAssignedReviewers]);

  const toggleReviewer = (userId: string) => {
    setSelectedReviewerIds(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation: at least 2 reviewers recommended
    if (selectedReviewerIds.length < 2) {
      toast({
        title: 'Attention',
        description: 'Il est recommandé d\'assigner au moins 2 reviewers',
        variant: 'destructive',
      });
      // Don't block submission, just warn
    }

    try {
      setIsLoading(true);

      // Import dynamically to avoid circular dependencies
      const { updateCandidate } = await import('@/lib/services/checkAdminService');

      const updatedCandidate = await updateCandidate(candidate.id, {
        assignedReviewers: selectedReviewerIds.map(id => allFreelances.find(f => f.id === id)),
      });

      toast({
        title: 'Succès',
        description: 'Reviewers assignés avec succès',
        variant: 'success',
      });

      // Call success callback
      onSuccess(updatedCandidate);

      // Close dialog
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to assign reviewers:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible d\'assigner les reviewers',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const selectedCount = selectedReviewerIds.length;
  const hasChanges = JSON.stringify([...selectedReviewerIds].sort()) !==
                     JSON.stringify([...currentAssignedReviewers.map(r => r.id)].sort());

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Assigner des reviewers au candidat</DialogTitle>
          <DialogDescription>
            Sélectionnez les freelances qui vont évaluer ce candidat.
            Il est recommandé d'avoir au moins 2 reviewers.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {/* Warning if less than 2 reviewers */}
            {selectedCount < 2 && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  {selectedCount === 0
                    ? 'Aucun reviewer assigné. Sélectionnez au moins 2 reviewers.'
                    : 'Seulement 1 reviewer assigné. Il est recommandé d\'en avoir au moins 2.'}
                </AlertDescription>
              </Alert>
            )}

            {/* Freelances list */}
            {allFreelances.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground">
                  Aucun freelance disponible
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                {allFreelances.map((freelance) => (
                  <div
                    key={freelance.id}
                    className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <Checkbox
                      id={`reviewer-${freelance.id}`}
                      checked={selectedReviewerIds.includes(freelance.id)}
                      onCheckedChange={() => toggleReviewer(freelance.id)}
                      disabled={isLoading}
                    />
                    <div className="flex-1 space-y-1">
                      <Label
                        htmlFor={`reviewer-${freelance.id}`}
                        className="text-sm font-medium leading-none cursor-pointer"
                      >
                        {freelance.firstName} {freelance.lastName}
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        {freelance.email}
                      </p>
                      {freelance.githubUsername && (
                        <p className="text-xs text-muted-foreground">
                          GitHub: @{freelance.githubUsername}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Summary */}
            <div className="text-sm text-muted-foreground">
              {selectedCount === 0
                ? 'Aucun reviewer sélectionné'
                : `${selectedCount} reviewer${selectedCount > 1 ? 's' : ''} sélectionné${selectedCount > 1 ? 's' : ''}`}
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
              disabled={isLoading || !hasChanges}
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
