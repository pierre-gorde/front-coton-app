/**
 * Reviewer Report Section Component
 * Wrapper for display/edit modes of reviewer reports
 * Following CLAUDE.md patterns: proper state management, display/edit toggle
 */

import { useState } from 'react';
import type { CandidateReport, ScorecardCriterion } from '@/lib/types';
import { ReviewerEvaluationCard } from './ReviewerEvaluationCard';
import { ReviewerReportForm } from './ReviewerReportForm';

interface ReviewerReportSectionProps {
  report: CandidateReport;
  candidateId: string;
  authorName: string;
  scorecardCriteria: ScorecardCriterion[];
  onReportUpdated: (report: CandidateReport) => void;
  canEdit?: boolean; // Whether the current user can edit this report
}

export function ReviewerReportSection({
  report,
  candidateId,
  authorName,
  scorecardCriteria,
  onReportUpdated,
  canEdit = true,
}: ReviewerReportSectionProps) {
  const [isEditing, setIsEditing] = useState(false);

  const handleEdit = () => {
    if (canEdit) {
      setIsEditing(true);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleSave = (updatedReport: CandidateReport) => {
    onReportUpdated(updatedReport);
    setIsEditing(false);
  };

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
