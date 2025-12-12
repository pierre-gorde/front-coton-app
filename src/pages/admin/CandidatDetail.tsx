import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Loader2, User, Briefcase, Building2, Users } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AppBreadcrumb } from '@/components/common/AppBreadcrumb';
import { getCandidateEvaluationView } from '@/lib/services/checkAdminService';
import type { CandidateEvaluationView, CandidateReport, CandidateReportRole } from '@/lib/types';
import { ReviewerEvaluationCard } from '@/components/candidat/ReviewerEvaluationCard';
import { ReviewerReportForm } from '@/components/candidat/ReviewerReportForm';
import { CreateReportButton } from '@/components/candidat/CreateReportButton';
import { FinalEvaluationCard } from '@/components/candidat/FinalEvaluationCard';

export default function CandidatDetailPage() {
  const { candidatId } = useParams<{ candidatId: string }>();
  const [data, setData] = useState<CandidateEvaluationView | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!candidatId) return;
    setLoading(true);
    const result = await getCandidateEvaluationView(candidatId);
    setData(result ?? null);
    setLoading(false);
  }, [candidatId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleReportCreated = (newReport: CandidateReport) => {
    if (!data) return;
    setData({
      ...data,
      reports: [...data.reports, newReport],
    });
  };

  const handleReportUpdated = (updatedReport: CandidateReport) => {
    if (!data) return;
    setData({
      ...data,
      reports: data.reports.map(r => r.id === updatedReport.id ? updatedReport : r),
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!data) {
    return (
      <Alert variant="destructive">
        <AlertDescription>Candidat introuvable.</AlertDescription>
      </Alert>
    );
  }

  const { candidate, candidateUser, mission, client, reviewers, scorecardCriteria, reports } = data;

  const breadcrumbItems = [
    { label: 'Admin', href: '/dashboard' },
    { label: 'COTON Check', href: '/dashboard/admin/check' },
    { label: mission.title, href: `/dashboard/admin/check/${mission.id}` },
    { label: candidateUser.name },
  ];

  // Separate reports by role
  const finalReport = reports.find(r => r.role === 'FINAL');

  // Get reports for each reviewer with their assigned role
  const getReviewerRole = (reviewerIndex: number): CandidateReportRole => {
    // First reviewer is PRIMARY, second is SECONDARY
    return reviewerIndex === 0 ? 'PRIMARY_REVIEWER' : 'SECONDARY_REVIEWER';
  };

  const getReviewerReport = (reviewerId: string, role: CandidateReportRole): CandidateReport | undefined => {
    return reports.find(r => r.authorUserId === reviewerId && r.role === role);
  };

  // Map reviewer IDs to their roles based on position
  const reviewerRolesMap = new Map<string, string>();
  reviewers.forEach((reviewer, index) => {
    reviewerRolesMap.set(reviewer.id, index === 0 ? 'Primary' : 'Secondary');
  });

  return (
    <div className="space-y-6">
      <AppBreadcrumb items={breadcrumbItems} />

      {/* Card A: Candidate Header */}
      <Card className="rounded-xl shadow-sm">
        <CardHeader className="p-6 pb-4">
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {candidateUser.name}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 pt-0 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              {candidateUser.email && (
                <p className="text-sm text-muted-foreground">{candidateUser.email}</p>
              )}
              
              <div className="flex items-center gap-2 text-sm">
                <Briefcase className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Mission:</span>
                <Link
                  to={`/dashboard/admin/check/${mission.id}`}
                  className="text-primary hover:underline font-medium"
                >
                  {mission.title}
                </Link>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Client:</span>
                <Link
                  to={`/dashboard/admin/client/${client.id}`}
                  className="text-primary hover:underline font-medium"
                >
                  {client.name}
                </Link>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Reviewers:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {reviewers.map((reviewer, index) => {
                  const role = reviewerRolesMap.get(reviewer.id);
                  return (
                    <div key={reviewer.id} className="flex items-center gap-1">
                      <span className="text-sm">{reviewer.name}</span>
                      {role && (
                        <Badge variant="outline" className="text-xs">
                          {role}
                        </Badge>
                      )}
                    </div>
                  );
                })}
                {reviewers.length === 0 && (
                  <span className="text-sm text-muted-foreground">Aucun reviewer assigné</span>
                )}
              </div>
            </div>
          </div>

          {reviewers.length === 0 && scorecardCriteria.length === 0 && (
            <Alert>
              <AlertDescription>
                Aucun reviewer assigné et aucun critère de scorecard configuré pour cette mission.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Card B: Evaluations par reviewer - Editable */}
      {reviewers.length > 0 && (
        <Card className="rounded-xl shadow-sm">
          <CardHeader className="p-6 pb-4">
            <CardTitle>Évaluations reviewers</CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-0 space-y-4">
            {reviewers.map((reviewer, index) => {
              const role = getReviewerRole(index);
              const report = getReviewerReport(reviewer.id, role);

              if (report) {
                return (
                  <ReviewerReportForm
                    key={report.id}
                    report={report}
                    authorName={reviewer.name}
                    scorecardCriteria={scorecardCriteria}
                    onReportUpdated={handleReportUpdated}
                  />
                );
              }

              return (
                <CreateReportButton
                  key={`create-${reviewer.id}`}
                  candidateId={candidate.id}
                  reviewer={reviewer}
                  role={role}
                  scorecardCriteria={scorecardCriteria}
                  onReportCreated={handleReportCreated}
                />
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Read-only view of completed reports (for reference) */}
      {reports.filter(r => r.role !== 'FINAL').length > 0 && (
        <Card className="rounded-xl shadow-sm">
          <CardHeader className="p-6 pb-4">
            <CardTitle className="text-muted-foreground">Rapports soumis (lecture seule)</CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-0 space-y-4">
            {reports
              .filter(r => r.role === 'PRIMARY_REVIEWER' || r.role === 'SECONDARY_REVIEWER')
              .map(report => {
                const author = reviewers.find(r => r.id === report.authorUserId);
                return (
                  <ReviewerEvaluationCard
                    key={`readonly-${report.id}`}
                    report={report}
                    authorName={author?.name ?? 'Reviewer'}
                    scorecardCriteria={scorecardCriteria}
                  />
                );
              })}
          </CardContent>
        </Card>
      )}

      {/* Card C: Évaluation finale */}
      <FinalEvaluationCard report={finalReport} scorecardCriteria={scorecardCriteria} />
    </div>
  );
}
