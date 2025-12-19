/**
 * Reviewer Side Menu Component
 * Displays list of reviewers with completion status badges
 * Following CLAUDE.md patterns: proper state management, TypeScript typing
 */

import type { CandidateReport, User } from '@/lib/types';
import { CheckCircle2, Circle } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ReviewerSideMenuProps {
  reviewers: User[];
  reports: CandidateReport[];
  activeReviewerId: string | null;
  onSelectReviewer: (reviewerId: string) => void;
}

export enum ReviewerStatus {
  COMPLETED = 'completed',
  INCOMPLETE = 'incomplete',
  NOT_STARTED = 'not_started',
}

const getReviewerStatusLabel = (status: ReviewerStatus): string => {
  if (status === ReviewerStatus.COMPLETED) return 'Terminé';
  if (status === ReviewerStatus.INCOMPLETE) return 'En cours';
  if (status === ReviewerStatus.NOT_STARTED) return 'Non démarré';
  return 'Inconnu';
};

const getReviewerStatus = (report: CandidateReport): ReviewerStatus => {
  if (!report) return ReviewerStatus.NOT_STARTED;
  if (report.isValidated) return ReviewerStatus.COMPLETED;
  return ReviewerStatus.INCOMPLETE;
};

export function ReviewerSideMenu({
  reviewers,
  reports,
  activeReviewerId,
  onSelectReviewer,
}: ReviewerSideMenuProps) {
  // Get report for a specific reviewer
  const getReviewerReport = (reviewerId: string): CandidateReport | undefined => {
    return reports.find(r => r.authorUserId === reviewerId && r.role !== 'FINAL');
  };

  const getVariant = (status: ReviewerStatus): 'success' | 'default' | 'warning' | 'destructive' => {
    if (status === ReviewerStatus.COMPLETED) return 'success';
    if (status === ReviewerStatus.INCOMPLETE) return 'warning';
    if (status === ReviewerStatus.NOT_STARTED) return 'destructive';
    return 'default';
  };

  return (
    <div className="space-y-2">
      {reviewers.map((reviewer) => {
        const report = getReviewerReport(reviewer.id);
        const isActive = activeReviewerId === reviewer.id;

        return (
          <button
            key={reviewer.id}
            onClick={() => onSelectReviewer(reviewer.id)}
            className={cn(
              'w-full text-left p-3 rounded-lg border transition-colors',
              'hover:bg-muted/50',
              isActive
                ? 'bg-muted border-primary'
                : 'bg-background border-border'
            )}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate">
                  {reviewer.firstName} {reviewer.lastName}
                </div>
                <div className="text-xs text-muted-foreground truncate">
                  {reviewer.email}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                
                  <Badge variant={getVariant(getReviewerStatus(report))} className="text-xs">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    {getReviewerStatusLabel(getReviewerStatus(report))}
                  </Badge>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
