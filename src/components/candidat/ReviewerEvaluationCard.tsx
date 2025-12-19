import type { CandidateReport, CriterionGroup, ScorecardCriterion } from '@/lib/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Pencil } from 'lucide-react';

interface ReviewerEvaluationCardProps {
  report: CandidateReport;
  authorName: string;
  scorecardCriteria: ScorecardCriterion[];
  onEdit?: () => void;
}

function getScoreColor(score: number): string {
  if (score >= 8) return 'text-green-600 dark:text-green-400';
  if (score >= 6) return 'text-amber-600 dark:text-amber-400';
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

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <h5 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
          {title}
        </h5>
        <Badge variant={group === 'PRIMARY' ? 'default' : 'secondary'} className="text-xs">
          {groupCriteria.length} critères
        </Badge>
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

export function ReviewerEvaluationCard({
  report,
  authorName,
  scorecardCriteria,
  onEdit,
}: ReviewerEvaluationCardProps) {
  return (
    <div className="border rounded-lg p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="font-medium">{authorName}</span>
          <Badge variant="secondary">{report.role}</Badge>
        </div>
        <div className="flex items-center gap-3">
          {onEdit && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onEdit}
              className="h-8 w-8"
            >
              <Pencil className="h-4 w-4" />
            </Button>
          )}
          <div className={`text-xl font-bold ${getScoreColor(report.finalScore)}`}>
            {report.finalScore}/10
          </div>
        </div>
      </div>

      {/* Summary */}
      <p className="text-sm text-muted-foreground">{report.summary}</p>

      {/* Details - always visible */}
      <div className="space-y-4 pt-3">
        {/* Positifs */}
        <div>
          <h4 className="text-sm font-medium text-green-700 dark:text-green-400 mb-1">
            Points positifs
          </h4>
          <p className="text-sm whitespace-pre-line text-muted-foreground">
            {report.positivePoints}
          </p>
        </div>

        {/* Négatifs */}
        <div>
          <h4 className="text-sm font-medium text-red-700 dark:text-red-400 mb-1">
            Points négatifs
          </h4>
          <p className="text-sm whitespace-pre-line text-muted-foreground">
            {report.negativePoints}
          </p>
        </div>

        {/* Remarques */}
        <div>
          <h4 className="text-sm font-medium mb-1">Remarques</h4>
          <p className="text-sm whitespace-pre-line text-muted-foreground">
            {report.remarks}
          </p>
        </div>

        {/* Criterion Scores by Group */}
        {report.criterionScores.length > 0 && (
          <div className="space-y-4 pt-2">
            <h4 className="text-sm font-medium">Scores par critère</h4>
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
    </div>
  );
}
