import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Loader2, User, Briefcase, Building2, Users, ExternalLink, Code2 } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AppBreadcrumb } from '@/components/common/AppBreadcrumb';
import { getCandidateEvaluationView, generateFinalReport } from '@/lib/services/checkAdminService';
import { fetchAllPRsWithComments } from '@/lib/services/githubService';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import type { CandidateEvaluationView, CandidateReport, CandidateReportRole } from '@/lib/types';
import { ReviewerEvaluationCard } from '@/components/candidat/ReviewerEvaluationCard';
import { ReviewerReportForm } from '@/components/candidat/ReviewerReportForm';
import { CreateReportButton } from '@/components/candidat/CreateReportButton';
import { FinalEvaluationCard } from '@/components/candidat/FinalEvaluationCard';
import { FinalReportForm } from '@/components/candidat/FinalReportForm';

export default function CandidatDetailPage() {
  const { candidatId } = useParams<{ candidatId: string }>();
  const { userId } = useAuth();
  const { toast } = useToast();
  const [data, setData] = useState<CandidateEvaluationView | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingReportId, setEditingReportId] = useState<string | null>(null);
  const [editingFinalReport, setEditingFinalReport] = useState(false);
  const [fetchingPRs, setFetchingPRs] = useState(false);

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
    setEditingReportId(null);
  };

  const handleEditReport = (reportId: string) => {
    setEditingReportId(reportId);
  };

  const handleCancelEdit = () => {
    setEditingReportId(null);
  };

  const handleEditFinalReport = () => {
    setEditingFinalReport(true);
  };

  const handleCancelFinalEdit = () => {
    setEditingFinalReport(false);
  };

  const handleFinalReportUpdated = (updatedReport: CandidateReport) => {
    if (!data) return;
    setData({
      ...data,
      reports: data.reports.map(r => r.role === 'FINAL' ? updatedReport : r),
    });
    setEditingFinalReport(false);
  };

  const handleGenerateFinal = async () => {
    if (!candidatId) return;
    const finalReport = await generateFinalReport(candidatId, userId);
    if (!data) return;

    // Update or add the final report
    const existingIndex = data.reports.findIndex(r => r.role === 'FINAL');
    if (existingIndex !== -1) {
      setData({
        ...data,
        reports: data.reports.map(r => r.role === 'FINAL' ? finalReport : r),
      });
    } else {
      setData({
        ...data,
        reports: [...data.reports, finalReport],
      });
    }
  };

  const handleFetchPRComments = async () => {
    if (!candidate.githubRepoUrl) {
      toast({
        title: "Erreur",
        description: "Aucun repository GitHub lié à ce candidat",
        variant: "destructive",
      });
      return;
    }

    setFetchingPRs(true);
    try {
      const prsWithComments = await fetchAllPRsWithComments(
        candidate.githubRepoUrl,
        candidate.githubToken,
        'all'
      );

      // Get last 10 PRs (sorted by most recent)
      const last10PRs = prsWithComments
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 10);

      // Console log all review comments
      console.log('=== Last 10 PRs with Review Comments ===');
      last10PRs.forEach((pr) => {
        console.log(`\nPR #${pr.number}: ${pr.title}`);
        console.log(`URL: ${pr.html_url}`);
        console.log(`State: ${pr.state}`);
        console.log(`Review Comments (${pr.review_comments.length}):`);
        pr.review_comments.forEach((comment) => {
          console.log(`  - [${comment.user.login}] ${comment.path}:${comment.line}`);
          console.log(`    ${comment.body}`);
          console.log(`    ${comment.html_url}`);
        });
      });

      toast({
        title: "Succès",
        description: `${last10PRs.length} PRs récupérées. Voir la console pour les détails.`,
      });
    } catch (error) {
      console.error('Error fetching PR comments:', error);
      toast({
        title: "Erreur",
        description: "Impossible de récupérer les PRs et commentaires",
        variant: "destructive",
      });
    } finally {
      setFetchingPRs(false);
    }
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
  const reviewerReports = reports.filter(r => r.role === 'PRIMARY_REVIEWER' || r.role === 'SECONDARY_REVIEWER');
  const hasReviewerReports = reviewerReports.length > 0;

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

              {candidate.githubRepoUrl && (
                <div className="flex items-center gap-2 text-sm">
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">GitHub:</span>
                  <a
                    href={candidate.githubRepoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline font-medium"
                  >
                    {candidate.githubRepoUrl.replace('https://github.com/', '')}
                  </a>
                </div>
              )}
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

              {candidate.githubRepoUrl && (
                <Button
                  onClick={handleFetchPRComments}
                  disabled={fetchingPRs}
                  variant="outline"
                  size="sm"
                  className="mt-2"
                >
                  {fetchingPRs ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Récupération...
                    </>
                  ) : (
                    <>
                      <Code2 className="h-4 w-4 mr-2" />
                      Récupérer les code reviews
                    </>
                  )}
                </Button>
              )}
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

      {/* Card B: Evaluations par reviewer */}
      {reviewers.length > 0 && (
        <Card className="rounded-xl shadow-sm">
          <CardHeader className="p-6 pb-4">
            <CardTitle>Évaluations reviewers</CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <div className={editingReportId ? "space-y-4" : "grid grid-cols-1 lg:grid-cols-2 gap-4"}>
              {reviewers.map((reviewer, index) => {
                const role = getReviewerRole(index);
                const report = getReviewerReport(reviewer.id, role);

                if (report) {
                  const isEditing = editingReportId === report.id;

                  return isEditing ? (
                    <ReviewerReportForm
                      key={report.id}
                      report={report}
                      authorName={reviewer.name}
                      scorecardCriteria={scorecardCriteria}
                      onReportUpdated={handleReportUpdated}
                      onCancel={handleCancelEdit}
                      reviewer={reviewer}
                      candidate={candidate}
                    />
                  ) : (
                    <ReviewerEvaluationCard
                      key={report.id}
                      report={report}
                      authorName={reviewer.name}
                      scorecardCriteria={scorecardCriteria}
                      onEdit={() => handleEditReport(report.id)}
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
            </div>
          </CardContent>
        </Card>
      )}

      {/* Card C: Évaluation finale */}
      {editingFinalReport && finalReport ? (
        <FinalReportForm
          report={finalReport}
          scorecardCriteria={scorecardCriteria}
          onReportUpdated={handleFinalReportUpdated}
          onCancel={handleCancelFinalEdit}
        />
      ) : (
        <FinalEvaluationCard
          report={finalReport}
          scorecardCriteria={scorecardCriteria}
          hasReviewerReports={hasReviewerReports}
          onGenerateFinal={handleGenerateFinal}
          onEdit={finalReport ? handleEditFinalReport : undefined}
          candidateName={candidateUser.name}
          missionTitle={mission.title}
          clientName={client.name}
        />
      )}
    </div>
  );
}
