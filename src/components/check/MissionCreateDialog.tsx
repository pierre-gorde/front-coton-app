/**
 * Mission Create Dialog
 * Minimal dialog for creating a new check mission
 * Auto-generates mission name and redirects to detail page
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
import { Loader2, Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface MissionCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MissionCreateDialog({
  open,
  onOpenChange,
}: MissionCreateDialogProps) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsLoading(true);

      // Import dynamically to avoid circular dependencies
      const { createCheckMission } = await import('@/lib/services/checkAdminService');

      // Create mission with auto-generated name
      const newMission = await createCheckMission();

      toast({
        title: 'Succès',
        description: 'Poste créé avec succès',
        variant: 'success',
      });

      // Close dialog
      onOpenChange(false);

      // Navigate to mission detail page
      navigate(`/dashboard/admin/check/missions/${newMission.id}`);
    } catch (error) {
      console.error('Failed to create mission:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de créer le poste',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Nouveau poste</DialogTitle>
          <DialogDescription>
            Créer un nouveau poste COTON Check. Vous pourrez ensuite configurer le client, la scorecard et toutes les informations.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="py-6">
            <div className="flex items-center justify-center">
              <div className="text-center space-y-3">
                <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Plus className="h-6 w-6 text-primary" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Un nouveau poste sera créé avec un nom auto-généré
                </p>
              </div>
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
                'Créer le poste'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
