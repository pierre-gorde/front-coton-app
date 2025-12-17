/**
 * Mission Create Dialog
 * Dialog for creating a new check mission
 * Following CLAUDE.md patterns: proper state management, error handling with toasts
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import type { Client, CheckMission } from '@/lib/types';

interface MissionCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clients: Client[];
  onSuccess: (mission: CheckMission) => void;
}

export function MissionCreateDialog({
  open,
  onOpenChange,
  clients,
  onSuccess,
}: MissionCreateDialogProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    reference: '',
    clientId: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.title.trim()) {
      toast({
        title: 'Erreur',
        description: 'Le titre est requis',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.reference.trim()) {
      toast({
        title: 'Erreur',
        description: 'La référence est requise',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.clientId) {
      toast({
        title: 'Erreur',
        description: 'Le client est requis',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsLoading(true);

      // Import dynamically to avoid circular dependencies
      const { createCheckMission } = await import('@/lib/services/checkAdminService');

      const newMission = await createCheckMission(
        formData.title,
        formData.reference,
        formData.clientId
      );

      toast({
        title: 'Succès',
        description: 'Mission créée avec succès',
      });

      // Reset form
      setFormData({ title: '', reference: '', clientId: '' });

      // Call success callback
      onSuccess(newMission);

      // Close dialog
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to create mission:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de créer la mission',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateReference = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `CHK-${year}${month}-${random}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Nouveau poste</DialogTitle>
          <DialogDescription>
            Créer un nouveau poste COTON Check pour évaluer des candidats
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">
                Titre du poste <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                placeholder="Ex: Développeur React Senior"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                disabled={isLoading}
                required
              />
            </div>

            {/* Reference */}
            <div className="space-y-2">
              <Label htmlFor="reference">
                Référence <span className="text-destructive">*</span>
              </Label>
              <div className="flex gap-2">
                <Input
                  id="reference"
                  placeholder="Ex: CHK-2024-001"
                  value={formData.reference}
                  onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                  disabled={isLoading}
                  required
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setFormData({ ...formData, reference: generateReference() })}
                  disabled={isLoading}
                >
                  Générer
                </Button>
              </div>
            </div>

            {/* Client */}
            <div className="space-y-2">
              <Label htmlFor="client">
                Client <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.clientId}
                onValueChange={(value) => setFormData({ ...formData, clientId: value })}
                disabled={isLoading}
              >
                <SelectTrigger id="client">
                  <SelectValue placeholder="Sélectionner un client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.length === 0 ? (
                    <div className="p-2 text-sm text-muted-foreground">
                      Aucun client disponible
                    </div>
                  ) : (
                    clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
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
