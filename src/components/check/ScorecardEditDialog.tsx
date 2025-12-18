/**
 * Scorecard Edit Dialog
 * Dialog for creating/editing technical test detail (domain ratios + generated criteria)
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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Loader2, Plus, RefreshCw, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { CheckMission, DomainRatio, ExpertiseRatio, ScorecardCriterion, SkillLevel } from '@/lib/types';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

interface ScorecardEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mission: CheckMission;
  onSuccess: (updatedMission: CheckMission) => void;
}

const SKILL_LEVELS: SkillLevel[] = ['JUNIOR', 'CONFIRMÉ', 'SENIOR', 'EXPERT'];

const DOMAIN_TEMPLATES = {
  Frontend: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS', 'State Management'],
  Backend: ['Node.js', 'PostgreSQL', 'API Design', 'Authentication', 'Testing'],
  DevOps: ['Docker', 'CI/CD', 'Kubernetes', 'Monitoring', 'Cloud'],
};

interface DomainRatioInput {
  domainName: string;
  percentage: number;
  level: SkillLevel;
  expertiseRatios: ExpertiseRatio[];
}

export function ScorecardEditDialog({
  open,
  onOpenChange,
  mission,
  onSuccess,
}: ScorecardEditDialogProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const [domainRatios, setDomainRatios] = useState<DomainRatioInput[]>([
    {
      domainName: 'Frontend',
      percentage: 60,
      level: 'SENIOR',
      expertiseRatios: [
        { name: 'React', percentage: 40, level: 'SENIOR' },
        { name: 'TypeScript', percentage: 30, level: 'SENIOR' },
        { name: 'Next.js', percentage: 30, level: 'CONFIRMÉ' },
      ],
    },
  ]);

  const [generatedCriteria, setGeneratedCriteria] = useState<ScorecardCriterion[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  // Initialize with existing data if available
  useEffect(() => {
    if (open && mission.technicalTestDetail?.domainRatios) {
      setDomainRatios(mission.technicalTestDetail.domainRatios);
      setGeneratedCriteria(mission.technicalTestDetail.scorecardCriteria || []);
      setShowPreview(true);
    }
  }, [open, mission.technicalTestDetail]);

  const totalPercentage = domainRatios.reduce((sum, d) => sum + d.percentage, 0);
  const isValidTotal = totalPercentage === 100;

  const addDomain = () => {
    const availableDomains = Object.keys(DOMAIN_TEMPLATES).filter(
      name => !domainRatios.some(d => d.domainName === name)
    );

    if (availableDomains.length === 0) {
      toast({
        title: 'Attention',
        description: 'Tous les domaines sont déjà ajoutés',
        variant: 'destructive',
      });
      return;
    }

    const newDomainName = availableDomains[0];
    const templates = DOMAIN_TEMPLATES[newDomainName as keyof typeof DOMAIN_TEMPLATES] || [];

    setDomainRatios([
      ...domainRatios,
      {
        domainName: newDomainName,
        percentage: 0,
        level: 'JUNIOR',
        expertiseRatios: templates.slice(0, 3).map(name => ({
          name,
          percentage: 33,
          level: 'JUNIOR' as SkillLevel,
        })),
      },
    ]);
  };

  const removeDomain = (index: number) => {
    setDomainRatios(domainRatios.filter((_, i) => i !== index));
  };

  const updateDomain = (index: number, field: keyof DomainRatioInput, value: any) => {
    const updated = [...domainRatios];
    updated[index] = { ...updated[index], [field]: value };
    setDomainRatios(updated);
  };

  const addExpertise = (domainIndex: number) => {
    const updated = [...domainRatios];
    const domain = updated[domainIndex];
    const templates = DOMAIN_TEMPLATES[domain.domainName as keyof typeof DOMAIN_TEMPLATES] || [];
    const usedNames = domain.expertiseRatios.map(e => e.name);
    const available = templates.filter(name => !usedNames.includes(name));

    if (available.length === 0) {
      toast({
        title: 'Attention',
        description: 'Toutes les expertises sont déjà ajoutées pour ce domaine',
        variant: 'destructive',
      });
      return;
    }

    domain.expertiseRatios.push({
      name: available[0],
      percentage: 0,
      level: domain.level,
    });
    setDomainRatios(updated);
  };

  const removeExpertise = (domainIndex: number, expertiseIndex: number) => {
    const updated = [...domainRatios];
    updated[domainIndex].expertiseRatios = updated[domainIndex].expertiseRatios.filter(
      (_, i) => i !== expertiseIndex
    );
    setDomainRatios(updated);
  };

  const updateExpertise = (
    domainIndex: number,
    expertiseIndex: number,
    field: keyof ExpertiseRatio,
    value: any
  ) => {
    const updated = [...domainRatios];
    updated[domainIndex].expertiseRatios[expertiseIndex] = {
      ...updated[domainIndex].expertiseRatios[expertiseIndex],
      [field]: value,
    };
    setDomainRatios(updated);
  };

  const generateCriteria = async () => {
    if (!isValidTotal) {
      toast({
        title: 'Erreur',
        description: 'Le total des pourcentages doit être égal à 100%',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsGenerating(true);

      // Import generation function
      const { generateScorecardFromDomains } = await import('@/lib/utils/scorecardGenerator');

      const criteria = generateScorecardFromDomains(domainRatios);
      setGeneratedCriteria(criteria);
      setShowPreview(true);

      toast({
        title: 'Succès',
        description: `${criteria.length} critères générés avec succès`,
        variant: 'success',
      });
    } catch (error) {
      console.error('Failed to generate criteria:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de générer les critères',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!isValidTotal) {
      toast({
        title: 'Erreur',
        description: 'Le total des pourcentages doit être égal à 100%',
        variant: 'destructive',
      });
      return;
    }

    if (generatedCriteria.length === 0) {
      toast({
        title: 'Erreur',
        description: 'Veuillez générer les critères avant de sauvegarder',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsLoading(true);

      const { updateCheckMission } = await import('@/lib/services/checkAdminService');

      const updatedMission = await updateCheckMission(mission.id, {
        technicalTestDetail: {
          id: mission.technicalTestDetail?.id || `ttd_${Date.now()}`,
          checkMissionId: mission.id,
          domainRatios: domainRatios as DomainRatio[],
          scorecardCriteria: generatedCriteria,
          createdAt: mission.technicalTestDetail?.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          archived: false,
        },
      });

      toast({
        title: 'Succès',
        description: 'Scorecard enregistrée avec succès',
        variant: 'success',
      });

      onSuccess(updatedMission);
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to save scorecard:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de sauvegarder la scorecard',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Configurer la scorecard technique</DialogTitle>
          <DialogDescription>
            Définissez les domaines d'évaluation, leurs poids et les expertises requises.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Total Percentage Warning */}
          {!isValidTotal && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Le total des pourcentages doit être égal à 100%. Actuellement: {totalPercentage}%
              </AlertDescription>
            </Alert>
          )}

          {/* Domain Ratios Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Domaines d'évaluation</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addDomain}
                disabled={domainRatios.length >= 3}
              >
                <Plus className="h-4 w-4 mr-2" />
                Ajouter un domaine
              </Button>
            </div>

            {domainRatios.map((domain, domainIndex) => (
              <div key={domainIndex} className="border rounded-lg p-4 space-y-4">
                <div className="flex items-start gap-4">
                  <div className="flex-1 grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Domaine</Label>
                      <Select
                        value={domain.domainName}
                        onValueChange={(value) => updateDomain(domainIndex, 'domainName', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.keys(DOMAIN_TEMPLATES).map((name) => (
                            <SelectItem key={name} value={name}>
                              {name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Pourcentage</Label>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={domain.percentage}
                        onChange={(e) => updateDomain(domainIndex, 'percentage', parseInt(e.target.value) || 0)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Niveau requis</Label>
                      <Select
                        value={domain.level}
                        onValueChange={(value) => updateDomain(domainIndex, 'level', value)}
                      >
                        <SelectTrigger>
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
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeDomain(domainIndex)}
                    disabled={domainRatios.length === 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                {/* Expertise Ratios */}
                <div className="ml-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm text-muted-foreground">Expertises</Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => addExpertise(domainIndex)}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Ajouter
                    </Button>
                  </div>

                  {domain.expertiseRatios.map((expertise, expertiseIndex) => (
                    <div key={expertiseIndex} className="flex items-center gap-2">
                      <Input
                        placeholder="Nom de l'expertise"
                        value={expertise.name}
                        onChange={(e) =>
                          updateExpertise(domainIndex, expertiseIndex, 'name', e.target.value)
                        }
                        className="flex-1"
                      />
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={expertise.percentage}
                        onChange={(e) =>
                          updateExpertise(domainIndex, expertiseIndex, 'percentage', parseInt(e.target.value) || 0)
                        }
                        className="w-20"
                      />
                      <Select
                        value={expertise.level}
                        onValueChange={(value) =>
                          updateExpertise(domainIndex, expertiseIndex, 'level', value)
                        }
                      >
                        <SelectTrigger className="w-32">
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
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeExpertise(domainIndex, expertiseIndex)}
                        disabled={domain.expertiseRatios.length === 1}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Generate Button */}
          <div className="flex justify-center">
            <Button
              type="button"
              onClick={generateCriteria}
              disabled={!isValidTotal || isGenerating}
              className="gradient-accent text-accent-foreground"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Génération...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Générer les critères
                </>
              )}
            </Button>
          </div>

          {/* Criteria Preview */}
          {showPreview && generatedCriteria.length > 0 && (
            <div className="space-y-4 border-t pt-4">
              <h3 className="font-medium">Aperçu des critères générés</h3>
              <div className="grid grid-cols-2 gap-4">
                {/* Primary Criteria */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">CRITÈRES PRIMAIRES</h4>
                  {generatedCriteria
                    .filter((c) => c.group === 'PRIMARY')
                    .map((criterion) => (
                      <div key={criterion.id} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                        <span className="text-sm">{criterion.label}</span>
                        <Badge>{criterion.weightPercentage}%</Badge>
                      </div>
                    ))}
                </div>

                {/* Secondary Criteria */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">CRITÈRES SECONDAIRES</h4>
                  {generatedCriteria
                    .filter((c) => c.group === 'SECONDARY')
                    .map((criterion) => (
                      <div key={criterion.id} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                        <span className="text-sm">{criterion.label}</span>
                        <Badge variant="secondary">{criterion.weightPercentage}%</Badge>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}
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
            type="button"
            onClick={handleSave}
            disabled={isLoading || !isValidTotal || generatedCriteria.length === 0}
            className="gradient-accent text-accent-foreground"
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
      </DialogContent>
    </Dialog>
  );
}
