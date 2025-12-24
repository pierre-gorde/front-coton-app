/**
 * Domain Create/Edit Dialog
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
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import type { Domain } from '@/lib/types';
import * as scorecardApi from '@/lib/api/scorecardTemplates';

interface DomainDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  domain?: Domain;
  onSuccess: () => void;
}

export function DomainDialog({ open, onOpenChange, domain, onSuccess }: DomainDialogProps) {
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const isEdit = !!domain;

  useEffect(() => {
    if (domain) {
      setName(domain.name);
    } else {
      setName('');
    }
  }, [domain, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast({
        title: 'Erreur',
        description: 'Le nom du domaine est requis',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsLoading(true);

      if (isEdit) {
        await scorecardApi.updateDomain(domain.id, name.trim());
        toast({
          title: 'Succès',
          description: 'Domaine mis à jour avec succès',
        });
      } else {
        await scorecardApi.createDomain(name.trim());
        toast({
          title: 'Succès',
          description: 'Domaine créé avec succès',
        });
      }

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to save domain:', error);
      toast({
        title: 'Erreur',
        description: `Impossible de ${isEdit ? 'mettre à jour' : 'créer'} le domaine`,
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
            <DialogTitle>{isEdit ? 'Modifier' : 'Ajouter'} un domaine</DialogTitle>
            <DialogDescription>
              {isEdit
                ? 'Modifiez les informations du domaine'
                : 'Ajoutez un nouveau domaine technique (ex: Frontend, Backend, DevOps)'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nom du domaine</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Frontend"
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
