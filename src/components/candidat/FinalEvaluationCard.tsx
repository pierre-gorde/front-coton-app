import { Award } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { CandidateReport, ScorecardCriterion, CriterionGroup } from '@/lib/types';

interface FinalEvaluationCardProps {
  report: CandidateReport | undefined;
  scorecardCriteria: ScorecardCriterion[];
}

function getScoreColor(score: number): string {
  if (score >= 80) return 'text-green-600 dark:text-green-400';
  if (score >= 60) return 'text-amber-600 dark:text-amber-400';
  return 'text-red-600 dark:text-red-400';
}

interface GroupedScoresTableProps {
  report: CandidateReport;
  scorecardCriteria: ScorecardCriterion[];
  group: CriterionGroup;
  title: string;
}

function GroupedScoresTable({ report, scorecardCriteria, group, title }: GroupedScoresTableProps) {
  const groupCriteria = scorecardCriteria.filter(c => c.group === group);
  const groupScores = report.criterionScores.filter(cs => 
    groupCriteria.some(c => c.id === cs.criterionId)
  );

  if (groupScores.length === 0) return null;

  const getCriterion = (criterionId: string) => 
    scorecardCriteria.find(c => c.id === criterionId);

  const totalWeight = groupCriteria.reduce((sum, c) => sum + c.weightPercentage, 0);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h5 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            {title}
          </h5>
          <Badge variant={group === 'PRIMARY' ? 'default' : 'secondary'} className="text-xs">
            {groupCriteria.length} critères
          </Badge>
        </div>
        <span className="text-xs text-muted-foreground">Poids total: {totalWeight}%</span>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Critère</TableHead>
            <TableHead className="w-16 text-center">Poids</TableHead>
            <TableHead className="w-16 text-right">Score</TableHead>
            <TableHead>Commentaire</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {groupScores.map(cs => {
            const criterion = getCriterion(cs.criterionId);
            return (
              <TableRow key={cs.criterionId}>
                <TableCell className="font-medium">
                  {criterion?.label ?? cs.criterionId}
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant="outline" className="text-xs">
                    {criterion?.weightPercentage ?? 0}%
                  </Badge>
                </TableCell>
                <TableCell className={`text-right font-semibold ${getScoreColor(cs.score)}`}>
                  {cs.score}
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {cs.comment ?? '—'}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

export function FinalEvaluationCard({ report, scorecardCriteria }: FinalEvaluationCardProps) {
  return (
    <Card className="rounded-xl shadow-sm">
      <CardHeader className="p-6 pb-4">
        <CardTitle className="flex items-center gap-2">
          <Award className="h-5 w-5" />
          Évaluation finale
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 pt-0">
        {!report ? (
          <Alert>
            <AlertDescription>
              Évaluation finale non encore créée.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-6">
            {/* Big Score */}
            <div className="flex items-center justify-center">
              <div className="text-center">
                <div className={`text-5xl font-bold ${getScoreColor(report.finalScore)}`}>
                  {report.finalScore}
                </div>
                <div className="text-sm text-muted-foreground mt-1">Score final / 100</div>
              </div>
            </div>

            {/* Summary */}
            <div className="bg-muted/50 rounded-lg p-4">
              <h4 className="text-sm font-medium mb-2">Avis global</h4>
              <p className="text-sm">{report.summary}</p>
            </div>

            {/* Positifs / Négatifs / Remarques */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-green-700 dark:text-green-400">
                  Points positifs
                </h4>
                <p className="text-sm whitespace-pre-line text-muted-foreground">
                  {report.positives}
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-medium text-red-700 dark:text-red-400">
                  Points négatifs
                </h4>
                <p className="text-sm whitespace-pre-line text-muted-foreground">
                  {report.negatives}
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-medium">Remarques</h4>
                <p className="text-sm whitespace-pre-line text-muted-foreground">
                  {report.remarks}
                </p>
              </div>
            </div>

            {/* Criterion Scores by Group */}
            {report.criterionScores.length > 0 && (
              <div className="space-y-4 border-t pt-4">
                <h4 className="text-sm font-medium">Détail par critère</h4>
                <GroupedScoresTable
                  report={report}
                  scorecardCriteria={scorecardCriteria}
                  group="PRIMARY"
                  title="Critères primaires"
                />
                <GroupedScoresTable
                  report={report}
                  scorecardCriteria={scorecardCriteria}
                  group="SECONDARY"
                  title="Critères secondaires"
                />
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
