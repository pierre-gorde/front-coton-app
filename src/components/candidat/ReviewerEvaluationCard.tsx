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
import type { CandidateReport, ScorecardCriterion } from '@/lib/types';

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

export function ReviewerEvaluationCard({
  report,
  authorName,
  scorecardCriteria,
}: ReviewerEvaluationCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  const getCriterionLabel = (criterionId: string): string => {
    return scorecardCriteria.find(c => c.id === criterionId)?.label ?? criterionId;
  };

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

          {/* Criterion Scores Table */}
          {report.criterionScores.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-2">Scores par critère</h4>
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
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
