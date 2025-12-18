import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { CheckMission, CriterionGroup, DomainRatio, ScorecardCriterion, SkillLevel, StackEvaluation, Scorecard } from '@/lib/types';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Pencil, Plus } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { ScorecardEditDialog } from './ScorecardEditDialog';
import { useState } from 'react';

interface ScorecardCardProps {
  mission: CheckMission;
  onUpdate: (updatedMission: CheckMission) => void;
}

const levelColors: Record<SkillLevel, string> = {
  JUNIOR: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  CONFIRMÉ: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  SENIOR: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  EXPERT: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
};

function LevelBadge({ level }: { level: SkillLevel }) {
  return (
    <Badge className={`${levelColors[level]} border-0 text-xs font-medium`}>
      {level}
    </Badge>
  );
}

function DomainSection({ domain }: { domain: DomainRatio }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-medium">{domain.domainName}</span>
          <LevelBadge level={domain.level} />
        </div>
        <span className="text-sm text-muted-foreground">{domain.percentage}%</span>
      </div>
      <Progress value={domain.percentage} className="h-2" />
      <div className="ml-4 space-y-2">
        {domain.expertiseRatios.map((expertise) => (
          <div key={expertise.name} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">{expertise.name}</span>
              <LevelBadge level={expertise.level} />
            </div>
            <span className="text-muted-foreground">{expertise.percentage}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function EvaluationList({ evaluations, title }: { evaluations: StackEvaluation[]; title: string }) {
  return (
    <div className="space-y-3">
      <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
        {title}
      </h4>
      <div className="space-y-2">
        {evaluations.map((evaluation) => (
          <div key={evaluation.stackName} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm">{evaluation.stackName}</span>
              <LevelBadge level={evaluation.level} />
            </div>
            <span className="text-sm text-muted-foreground">{evaluation.percentage}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function CriteriaList({ criteria, title, group }: { criteria: ScorecardCriterion[]; title: string; group: CriterionGroup }) {
  const filteredCriteria = criteria.filter(c => c.group === group);
  const totalWeight = filteredCriteria.reduce((sum, c) => sum + c.weightPercentage, 0);

  if (filteredCriteria.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
          {title}
        </h4>
        <Badge variant="outline" className="text-xs">
          Total: {totalWeight}%
        </Badge>
      </div>
      <div className="space-y-2">
        {filteredCriteria.map((criterion) => (
          <div key={criterion.id} className="flex items-center justify-between py-1.5 border-b border-border/50 last:border-0">
            <div className="flex-1">
              <span className="text-sm">{criterion.label}</span>
              {criterion.description && (
                <p className="text-xs text-muted-foreground mt-0.5">{criterion.description}</p>
              )}
            </div>
            <Badge 
              variant={group === 'PRIMARY' ? 'default' : 'secondary'} 
              className="ml-2 text-xs font-semibold"
            >
              {criterion.weightPercentage}%
            </Badge>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ScorecardCard({ mission, onUpdate }: ScorecardCardProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const scorecard = mission.scorecard;

  if (!scorecard) {
    return (
      <>
        <Card className="rounded-xl shadow-sm">
          <CardHeader className="p-6 pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold">Scorecard technique</CardTitle>
              <Button
                size="sm"
                onClick={() => setIsEditDialogOpen(true)}
                className="gradient-accent text-accent-foreground"
              >
                <Plus className="h-4 w-4 mr-2" />
                Configurer
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <p className="text-sm text-muted-foreground">
              Aucune scorecard configurée pour ce poste.
            </p>
          </CardContent>
        </Card>

        <ScorecardEditDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          mission={mission}
          onSuccess={onUpdate}
        />
      </>
    );
  }

  const { domainRatios, scorecardCriteria } = scorecard;

  return (
    <>
      <Card className="rounded-xl shadow-sm">
        <CardHeader className="p-6 pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">Scorecard technique</CardTitle>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsEditDialogOpen(true)}
            >
              <Pencil className="h-4 w-4 mr-2" />
              Éditer
            </Button>
          </div>
        </CardHeader>
      <CardContent className="p-6 pt-0">
        <div className="flex flex-wrap gap-6">
          {/* Domains Section */}
          <div className="flex-1 min-w-[250px] space-y-4">
            <h3 className="font-medium">Domaines</h3>
            <div className="space-y-6">
              {domainRatios.map((domain) => (
                <DomainSection key={domain.domainName} domain={domain} />
              ))}
            </div>
          </div>

          {/* Scorecard Criteria - Primary vs Secondary */}
          {scorecardCriteria && scorecardCriteria.length > 0 && (
            <>
              <div className="flex-1 min-w-[250px]">
                <CriteriaList
                  criteria={scorecardCriteria}
                  title="Critères primaires"
                  group="PRIMARY"
                />
              </div>
              <div className="flex-1 min-w-[250px]">
                <CriteriaList
                  criteria={scorecardCriteria}
                  title="Critères secondaires"
                  group="SECONDARY"
                />
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>

    <ScorecardEditDialog
      open={isEditDialogOpen}
      onOpenChange={setIsEditDialogOpen}
      mission={mission}
      onSuccess={onUpdate}
    />
    </>
  );
}
