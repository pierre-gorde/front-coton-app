import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Loader2, User, Briefcase, Building2, Users } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AppBreadcrumb } from '@/components/common/AppBreadcrumb';
import { getCandidateEvaluationView } from '@/lib/services/checkAdminService';
import type { CandidateEvaluationView } from '@/lib/types';
import { ReviewerEvaluationCard } from '@/components/candidat/ReviewerEvaluationCard';
import { FinalEvaluationCard } from '@/components/candidat/FinalEvaluationCard';

export default function CandidatDetailPage() {
  const { candidatId } = useParams<{ candidatId: string }>();
  const [data, setData] = useState<CandidateEvaluationView | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!candidatId) return;

    setLoading(true);
    getCandidateEvaluationView(candidatId)
      .then(setData)
      .finally(() => setLoading(false));
  }, [candidatId]);

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
  const reviewerReports = reports.filter(r => r.role === 'PRIMARY_REVIEWER' || r.role === 'SECONDARY_REVIEWER');
  const finalReport = reports.find(r => r.role === 'FINAL');

  // Map reviewer IDs to their roles based on reports
  const reviewerRoles = new Map<string, string>();
  reports.forEach(r => {
    if (r.role === 'PRIMARY_REVIEWER') {
      reviewerRoles.set(r.authorUserId, 'Primary');
    } else if (r.role === 'SECONDARY_REVIEWER') {
      reviewerRoles.set(r.authorUserId, 'Secondary');
    }
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
                {reviewers.map(reviewer => {
                  const role = reviewerRoles.get(reviewer.id);
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

          {reports.length === 0 && (
            <Alert>
              <AlertDescription>
                Aucune évaluation n'a encore été soumise pour ce candidat.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Card B: Evaluations par reviewer */}
      {reviewerReports.length > 0 && (
        <Card className="rounded-xl shadow-sm">
          <CardHeader className="p-6 pb-4">
            <CardTitle>Évaluations reviewers</CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-0 space-y-4">
            {reviewerReports.map(report => {
              const author = reviewers.find(r => r.id === report.authorUserId);
              return (
                <ReviewerEvaluationCard
                  key={report.id}
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
