import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import type { TechnicalTestDetail, SkillLevel, StackEvaluation, DomainRatio } from '@/lib/types';

interface ScorecardCardProps {
  technicalTestDetail?: TechnicalTestDetail;
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

export function ScorecardCard({ technicalTestDetail }: ScorecardCardProps) {
  if (!technicalTestDetail) {
    return (
      <Card className="rounded-xl shadow-sm">
        <CardHeader className="p-6 pb-4">
          <CardTitle className="text-lg font-semibold">Scorecard technique</CardTitle>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          <p className="text-sm text-muted-foreground">
            Aucune scorecard configurée pour ce poste.
          </p>
        </CardContent>
      </Card>
    );
  }

  const { domainRatios, scoreCard } = technicalTestDetail;

  return (
    <Card className="rounded-xl shadow-sm">
      <CardHeader className="p-6 pb-4">
        <CardTitle className="text-lg font-semibold">Scorecard technique</CardTitle>
      </CardHeader>
      <CardContent className="p-6 pt-0 space-y-6">
        {/* Domains Section */}
        <div className="space-y-4">
          <h3 className="font-medium">Domaines</h3>
          <div className="space-y-6">
            {domainRatios.map((domain) => (
              <DomainSection key={domain.domainName} domain={domain} />
            ))}
          </div>
        </div>

        {/* ScoreCard Evaluations */}
        {scoreCard && (
          <div className="border-t pt-6">
            <h3 className="font-medium mb-4">Évaluations</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <EvaluationList
                evaluations={scoreCard.primaryEvaluations}
                title="Primary evaluations"
              />
              <EvaluationList
                evaluations={scoreCard.secondaryEvaluations}
                title="Secondary evaluations"
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
