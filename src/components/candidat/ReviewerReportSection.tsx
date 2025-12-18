/**
 * Reviewer Report Section Component
 * Wrapper for display/edit modes of reviewer reports
 * Following CLAUDE.md patterns: proper state management, display/edit toggle
 */

import { useState } from 'react';
import type { CandidateReport, ScorecardCriterion } from '@/lib/types';
import { ReviewerEvaluationCard } from './ReviewerEvaluationCard';
import { ReviewerReportForm } from './ReviewerReportForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText } from 'lucide-react';

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
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const handleEdit = () => {
    if (canEdit) {
      setIsEditing(true);
    }
  };

  const handleCreate = () => {
    if (canEdit) {
      setIsCreating(true);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setIsCreating(false);
  };

  const handleSave = (updatedReport: CandidateReport) => {
    onReportUpdated(updatedReport);
    setIsEditing(false);
    setIsCreating(false);
  };

  // If no report exists and user can edit, show create form or button
  if (!report) {
    if (isCreating) {
      // Create a minimal report structure for the form
      const emptyReport: CandidateReport = {
        id: '',
        candidateId,
        authorUserId: reviewerUserId,
        role: 'PRIMARY_REVIEWER',
        criterionScores: scorecardCriteria.map(c => ({
          criterionId: c.id,
          score: 0,
          comment: '',
        })),
        finalScore: 0,
        summary: '',
        positivePoints: [],
        negativePoints: [],
        remarks: '',
        prReviewComments: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        archived: false,
      };

      return (
        <ReviewerReportForm
          report={emptyReport}
          authorName={authorName}
          candidateId={candidateId}
          reviewerUserId={reviewerUserId}
          scorecardCriteria={scorecardCriteria}
          onReportUpdated={handleSave}
          onCancel={handleCancel}
        />
      );
    }

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
            <Button onClick={handleCreate} className="gradient-accent text-accent-foreground">
              <FileText className="h-4 w-4 mr-2" />
              Créer mon rapport
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

  // Report exists - show form or card
  if (isEditing) {
    return (
      <ReviewerReportForm
        report={report}
        authorName={authorName}
        candidateId={candidateId}
        reviewerUserId={report.authorUserId}
        scorecardCriteria={scorecardCriteria}
        onReportUpdated={handleSave}
        onCancel={handleCancel}
      />
    );
  }

  return (
    <ReviewerEvaluationCard
      report={report}
      authorName={authorName}
      scorecardCriteria={scorecardCriteria}
      onEdit={canEdit ? handleEdit : undefined}
    />
  );
}
