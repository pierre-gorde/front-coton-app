/**
 * Expertise Create/Edit Dialog
 */

import { useState, useEffect } from 'react';
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
import type { Domain, Expertise } from '@/lib/types';
import * as scorecardApi from '@/lib/api/scorecardTemplates';

interface ExpertiseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expertise?: Expertise;
  domains: Domain[];
  onSuccess: () => void;
}

export function ExpertiseDialog({
  open,
  onOpenChange,
  expertise,
  domains,
  onSuccess,
}: ExpertiseDialogProps) {
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [domainId, setDomainId] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const isEdit = !!expertise;

  useEffect(() => {
    if (expertise) {
      setName(expertise.name);
      setDomainId(expertise.domainId);
    } else {
      setName('');
      setDomainId('');
    }
  }, [expertise, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast({
        title: 'Erreur',
        description: "Le nom de l'expertise est requis",
        variant: 'destructive',
      });
      return;
    }

    if (!domainId) {
      toast({
        title: 'Erreur',
        description: 'Le domaine est requis',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsLoading(true);

      if (isEdit) {
        await scorecardApi.updateExpertise(expertise.id, name.trim());
        toast({
          title: 'Succès',
          description: 'Expertise mise à jour avec succès',
        });
      } else {
        await scorecardApi.createExpertise(domainId, name.trim());
        toast({
          title: 'Succès',
          description: 'Expertise créée avec succès',
        });
      }

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to save expertise:', error);
      toast({
        title: 'Erreur',
        description: `Impossible de ${isEdit ? 'mettre à jour' : 'créer'} l'expertise`,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{isEdit ? 'Modifier' : 'Ajouter'} une expertise</DialogTitle>
            <DialogDescription>
              {isEdit
                ? "Modifiez les informations de l'expertise"
                : 'Ajoutez une nouvelle expertise liée à un domaine (ex: React, Node.js)'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="domain">Domaine</Label>
              <Select value={domainId} onValueChange={setDomainId} disabled={isLoading || isEdit}>
                <SelectTrigger id="domain">
                  <SelectValue placeholder="Sélectionner un domaine" />
                </SelectTrigger>
                <SelectContent>
                  {domains.map((domain) => (
                    <SelectItem key={domain.id} value={domain.id}>
                      {domain.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {isEdit && (
                <p className="text-xs text-muted-foreground">
                  Le domaine ne peut pas être modifié
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="name">Nom de l'expertise</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: React"
                disabled={isLoading}
                autoFocus
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
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {isEdit ? 'Mettre à jour' : 'Créer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
