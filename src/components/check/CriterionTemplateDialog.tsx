/**
 * Criterion Template Create/Edit Dialog
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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import type { Domain, CriterionTemplate, SkillLevel, CriterionGroup } from '@/lib/types';
import * as scorecardApi from '@/lib/api/scorecardTemplates';

interface CriterionTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template?: CriterionTemplate;
  domains: Domain[];
  onSuccess: () => void;
}

const SKILL_LEVELS: SkillLevel[] = ['JUNIOR', 'MEDIOR', 'SENIOR', 'EXPERT'];
const CRITERION_GROUPS: CriterionGroup[] = ['PRIMARY', 'SECONDARY'];

export function CriterionTemplateDialog({
  open,
  onOpenChange,
  template,
  domains,
  onSuccess,
}: CriterionTemplateDialogProps) {
  const { toast } = useToast();
  const [domainId, setDomainId] = useState('');
  const [minLevel, setMinLevel] = useState<SkillLevel>('JUNIOR');
  const [label, setLabel] = useState('');
  const [group, setGroup] = useState<CriterionGroup>('PRIMARY');
  const [weightPercentage, setWeightPercentage] = useState('10');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const isEdit = !!template;

  useEffect(() => {
    if (template) {
      setDomainId(template.domainId);
      setMinLevel(template.minLevel);
      setLabel(template.label);
      setGroup(template.group);
      setWeightPercentage(template.weightPercentage.toString());
      setDescription(template.description || '');
    } else {
      setDomainId('');
      setMinLevel('JUNIOR');
      setLabel('');
      setGroup('PRIMARY');
      setWeightPercentage('10');
      setDescription('');
    }
  }, [template, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!domainId) {
      toast({
        title: 'Erreur',
        description: 'Le domaine est requis',
        variant: 'destructive',
      });
      return;
    }

    if (!label.trim()) {
      toast({
        title: 'Erreur',
        description: 'Le label est requis',
        variant: 'destructive',
      });
      return;
    }

    const weight = parseFloat(weightPercentage);
    if (isNaN(weight) || weight <= 0 || weight > 100) {
      toast({
        title: 'Erreur',
        description: 'Le poids doit être entre 1 et 100',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsLoading(true);

      if (isEdit) {
        await scorecardApi.updateCriterionTemplate(template.id, {
          minLevel,
          label: label.trim(),
          group,
          weightPercentage: weight,
          description: description.trim() || undefined,
        });
        toast({
          title: 'Succès',
          description: 'Template mis à jour avec succès',
        });
      } else {
        await scorecardApi.createCriterionTemplate({
          domainId,
          minLevel,
          label: label.trim(),
          group,
          weightPercentage: weight,
          description: description.trim() || undefined,
        });
        toast({
          title: 'Succès',
          description: 'Template créé avec succès',
        });
      }

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to save template:', error);
      toast({
        title: 'Erreur',
        description: `Impossible de ${isEdit ? 'mettre à jour' : 'créer'} le template`,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{isEdit ? 'Modifier' : 'Ajouter'} un template de critère</DialogTitle>
            <DialogDescription>
              {isEdit
                ? 'Modifiez les informations du template'
                : 'Ajoutez un nouveau template de critère pour générer les scorecards'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
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
              <Label htmlFor="minLevel">Niveau minimum</Label>
              <Select
                value={minLevel}
                onValueChange={(value) => setMinLevel(value as SkillLevel)}
                disabled={isLoading}
              >
                <SelectTrigger id="minLevel">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SKILL_LEVELS.map((level) => (
                    <SelectItem key={level} value={level}>
                      {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="label">Label du critère</Label>
              <Input
                id="label"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="Ex: Maîtrise de React"
                disabled={isLoading}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="group">Groupe</Label>
              <Select
                value={group}
                onValueChange={(value) => setGroup(value as CriterionGroup)}
                disabled={isLoading}
              >
                <SelectTrigger id="group">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CRITERION_GROUPS.map((g) => (
                    <SelectItem key={g} value={g}>
                      {g}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="weight">Poids (%)</Label>
              <Input
                id="weight"
                type="number"
                min="1"
                max="100"
                step="1"
                value={weightPercentage}
                onChange={(e) => setWeightPercentage(e.target.value)}
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground">
                Le poids sera normalisé lors de la génération du scorecard
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description (optionnel)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description du critère..."
                disabled={isLoading}
                rows={3}
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
