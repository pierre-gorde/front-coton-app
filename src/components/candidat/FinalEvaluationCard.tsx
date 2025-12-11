import { Award } from 'lucide-react';

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
import type { CandidateReport, ScorecardCriterion } from '@/lib/types';

interface FinalEvaluationCardProps {
  report: CandidateReport | undefined;
  scorecardCriteria: ScorecardCriterion[];
}

function getScoreColor(score: number): string {
  if (score >= 80) return 'text-green-600 dark:text-green-400';
  if (score >= 60) return 'text-amber-600 dark:text-amber-400';
  return 'text-red-600 dark:text-red-400';
}

export function FinalEvaluationCard({ report, scorecardCriteria }: FinalEvaluationCardProps) {
  const getCriterionLabel = (criterionId: string): string => {
    return scorecardCriteria.find(c => c.id === criterionId)?.label ?? criterionId;
  };

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

            {/* Criterion Scores */}
            {report.criterionScores.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-3">Détail par critère</h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Critère</TableHead>
                      <TableHead className="w-20 text-right">Score</TableHead>
                      <TableHead>Commentaire</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {report.criterionScores.map(cs => (
                      <TableRow key={cs.criterionId}>
                        <TableCell className="font-medium">
                          {getCriterionLabel(cs.criterionId)}
                        </TableCell>
                        <TableCell className={`text-right ${getScoreColor(cs.score)}`}>
                          {cs.score}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {cs.comment ?? '—'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
