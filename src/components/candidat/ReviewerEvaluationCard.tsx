import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { CandidateReport, ScorecardCriterion, CriterionGroup } from '@/lib/types';

interface ReviewerEvaluationCardProps {
  report: CandidateReport;
  authorName: string;
  scorecardCriteria: ScorecardCriterion[];
}

const roleLabels: Record<string, string> = {
  PRIMARY_REVIEWER: 'Primary Reviewer',
  SECONDARY_REVIEWER: 'Secondary Reviewer',
};

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
}: ReviewerEvaluationCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border rounded-lg p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="font-medium">{authorName}</span>
          <Badge variant="secondary">{roleLabels[report.role] ?? report.role}</Badge>
        </div>
        <div className={`text-xl font-bold ${getScoreColor(report.finalScore)}`}>
          {report.finalScore}/100
        </div>
      </div>

      {/* Summary */}
      <p className="text-sm text-muted-foreground">{report.summary}</p>

      {/* Collapsible details */}
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm" className="w-full justify-start">
            {isOpen ? (
              <ChevronDown className="h-4 w-4 mr-2" />
            ) : (
              <ChevronRight className="h-4 w-4 mr-2" />
            )}
            Voir les détails
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-4 pt-3">
          {/* Positifs */}
          <div>
            <h4 className="text-sm font-medium text-green-700 dark:text-green-400 mb-1">
              Points positifs
            </h4>
            <p className="text-sm whitespace-pre-line text-muted-foreground">
              {report.positives}
            </p>
          </div>

          {/* Négatifs */}
          <div>
            <h4 className="text-sm font-medium text-red-700 dark:text-red-400 mb-1">
              Points négatifs
            </h4>
            <p className="text-sm whitespace-pre-line text-muted-foreground">
              {report.negatives}
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
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
