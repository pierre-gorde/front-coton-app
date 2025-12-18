/**
 * Reviewer Report Section Component
 * Wrapper for display/edit modes of reviewer reports
 * Following CLAUDE.md patterns: proper state management, display/edit toggle
 */

import { useState } from 'react';
import type { CandidateReport, ScorecardCriterion } from '@/lib/types';
import { ReportRole } from '@/lib/types';
import { ReviewerEvaluationCard } from './ReviewerEvaluationCard';
import { ReviewerReportForm } from './ReviewerReportForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ReviewerReportSectionProps {
  report?: CandidateReport; // Optional - undefined if no report exists yet
  candidateId: string;
  reviewerUserId: string;
  authorName: string;
  scorecardCriteria: ScorecardCriterion[];
  onReportUpdated: (report: CandidateReport) => void;
  canEdit?: boolean; // Whether the current user can edit this report
}

export function ReviewerReportSection({
  report,
  candidateId,
  reviewerUserId,
  authorName,
  scorecardCriteria,
  onReportUpdated,
  canEdit = true,
}: ReviewerReportSectionProps) {
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [createdReport, setCreatedReport] = useState<CandidateReport | null>(null);

  const handleEdit = () => {
    if (canEdit) {
      setIsEditing(true);
    }
  };

  const handleCreate = async () => {
    if (!canEdit) return;

    setIsCreating(true);
    try {
      // Import dynamically to avoid circular dependencies
      const { createReviewerReport } = await import('@/lib/services/checkAdminService');

      // Create the report via API immediately
      const newReport = await createReviewerReport({
        candidateId,
        reviewerUserId,
        role: ReportRole.REVIEWER,
        criterionScores: scorecardCriteria.map(c => ({
          criterionId: c.id,
          score: 0,
          comment: '',
        })),
      });

      setCreatedReport(newReport);
      toast({
        title: 'Rapport créé',
        description: 'Vous pouvez maintenant remplir votre évaluation',
      });
    } catch (error) {
      console.error('Failed to create report:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de créer le rapport',
        variant: 'destructive',
      });
      setIsCreating(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (createdReport) {
      // If we created a report but user cancels, reload to show it in display mode
      onReportUpdated(createdReport);
      setCreatedReport(null);
    }
    setIsCreating(false);
  };

  const handleSave = (updatedReport: CandidateReport) => {
    onReportUpdated(updatedReport);
    setIsEditing(false);
    setIsCreating(false);
    setCreatedReport(null);
  };

  // Use created report if it exists, otherwise use the prop report
  const activeReport = createdReport || report;

  // If no report exists and user can edit, show create button
  if (!activeReport) {
    // Show "Create report" button
    if (canEdit) {
      return (
        <Card className="rounded-xl shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Rapport reviewer - {authorName}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground mb-4">
              Vous n'avez pas encore créé de rapport pour ce candidat.
            </p>
            <Button
              onClick={handleCreate}
              disabled={isCreating}
              className="gradient-accent text-accent-foreground"
            >
              {isCreating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Création...
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4 mr-2" />
                  Créer mon rapport
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      );
    }

    // User cannot edit - show message
    return (
      <Card className="rounded-xl shadow-sm">
        <CardContent className="text-center py-8">
          <p className="text-muted-foreground">
            Ce reviewer n'a pas encore créé de rapport.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Report exists (either from prop or just created) - show form or card
  // If we just created the report or user clicked edit, show form
  if (isCreating || isEditing) {
    return (
      <ReviewerReportForm
        report={activeReport}
        authorName={authorName}
        candidateId={candidateId}
        reviewerUserId={activeReport.authorUserId}
        scorecardCriteria={scorecardCriteria}
        onReportUpdated={handleSave}
        onCancel={handleCancel}
      />
    );
  }

  // Otherwise show display card
  return (
    <ReviewerEvaluationCard
      report={activeReport}
      authorName={authorName}
      scorecardCriteria={scorecardCriteria}
      onEdit={canEdit ? handleEdit : undefined}
    />
  );
}
