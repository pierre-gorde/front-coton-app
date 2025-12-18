/**
 * Reviewer Side Menu Component
 * Displays list of reviewers with completion status badges
 * Following CLAUDE.md patterns: proper state management, TypeScript typing
 */

import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CandidateReport, User } from '@/lib/types';

interface ReviewerSideMenuProps {
  reviewers: User[];
  reports: CandidateReport[];
  activeReviewerId: string | null;
  onSelectReviewer: (reviewerId: string) => void;
}

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

  return (
    <div className="space-y-2">
      {reviewers.map((reviewer) => {
        const report = getReviewerReport(reviewer.id);
        const isActive = activeReviewerId === reviewer.id;
        const isComplete = report?.isComplete ?? false;

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
                {isComplete ? (
                  <Badge variant="default" className="text-xs">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Terminé
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="text-xs">
                    <Circle className="h-3 w-3 mr-1" />
                    En cours
                  </Badge>
                )}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
