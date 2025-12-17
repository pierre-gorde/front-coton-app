import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { AlertTriangle, Building2, Calendar, Hash, Loader2, Plus, Users } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { AppBreadcrumb } from '@/components/common/AppBreadcrumb';
import { ScorecardCard } from '@/components/check/ScorecardCard';
import { CandidateCreateDialog } from '@/components/candidat/CandidateCreateDialog';
import { ReviewerAssignmentDialog } from '@/components/check/ReviewerAssignmentDialog';
import { getCheckMissionDetail, listUsers, type CheckMissionDetail } from '@/lib/services/checkAdminService';
import type { User } from '@/lib/types';

const statusLabels: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' }> = {
  DRAFT: { label: 'Brouillon', variant: 'secondary' },
  OPEN: { label: 'Ouvert', variant: 'default' },
  CLOSED: { label: 'Clôturé', variant: 'outline' },
};

function formatDate(dateString: string): string {
  return format(new Date(dateString), 'dd MMM yyyy', { locale: fr });
}

export default function CheckDetailPage() {
  const { checkId } = useParams<{ checkId: string }>();
  const navigate = useNavigate();
  const [detail, setDetail] = useState<CheckMissionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [candidateDialogOpen, setCandidateDialogOpen] = useState(false);
  const [reviewerDialogOpen, setReviewerDialogOpen] = useState(false);
  const [allFreelances, setAllFreelances] = useState<User[]>([]);

  useEffect(() => {
    if (!checkId) return;

    async function loadDetail() {
      setLoading(true);

      const [missionData, users] = await Promise.all([
        getCheckMissionDetail(checkId),
        listUsers(),
      ]);

      setDetail(missionData);
      // Filter only freelances
      setAllFreelances(users.filter(u => u.roles?.includes('FREELANCE') || u.role === 'FREELANCE'));
      setLoading(false);
    }

    loadDetail();
  }, [checkId]);

  const handleCandidateCreated = async () => {
    // Refresh mission detail to show new candidate
    if (!checkId) return;
    const data = await getCheckMissionDetail(checkId);
    setDetail(data);
  };

  const handleReviewersAssigned = async () => {
    // Refresh mission detail to show updated reviewers
    if (!checkId) return;
    const data = await getCheckMissionDetail(checkId);
    setDetail(data);
  };

  const breadcrumbItems = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'COTON Check', href: '/dashboard/admin/check' },
    { label: detail?.mission.title ?? `Poste ${checkId}`, isCurrent: true },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <AppBreadcrumb items={breadcrumbItems} />
        <Card className="rounded-xl shadow-sm">
          <CardContent className="p-6 flex items-center justify-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Chargement des informations du poste...
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="space-y-6">
        <AppBreadcrumb items={breadcrumbItems} />
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>Poste introuvable.</AlertDescription>
        </Alert>
      </div>
    );
  }

  const { mission, client, reviewers, candidates } = detail;
  const statusConfig = statusLabels[mission.status] ?? statusLabels.DRAFT;

  return (
    <div className="space-y-6">
      <AppBreadcrumb items={breadcrumbItems} />

      {/* Mission Header Card */}
      <Card className="rounded-xl shadow-sm">
        <CardHeader className="p-6 pb-4">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-xl font-semibold">{mission.title}</CardTitle>
              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Hash className="h-4 w-4" />
                  {mission.reference}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {formatDate(mission.updatedAt)}
                </span>
              </div>
            </div>
            <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
          </div>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          {client && (
            <Link
              to={`/dashboard/admin/client/${client.id}`}
              className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
            >
              <Building2 className="h-4 w-4" />
              {client.organizationName ?? client.name}
            </Link>
          )}
        </CardContent>
      </Card>

      {/* Scorecard Card */}
      <ScorecardCard technicalTestDetail={mission.technicalTestDetail} />

      {/* Reviewers Card */}
      <Card className="rounded-xl shadow-sm">
        <CardHeader className="p-6 pb-4 flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-semibold">
            Reviewers ({reviewers.length})
          </CardTitle>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setReviewerDialogOpen(true)}
          >
            <Users className="h-4 w-4 mr-2" />
            Gérer les reviewers
          </Button>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          {reviewers.length < 2 && (
            <Alert className="mb-4 border-orange-200 bg-orange-50 text-orange-800 dark:border-orange-800 dark:bg-orange-950 dark:text-orange-200">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Il est recommandé d'avoir au moins 2 reviewers pour cette mission.
              </AlertDescription>
            </Alert>
          )}
          {reviewers.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground mb-4">
                Aucun reviewer assigné.
              </p>
              <Button
                variant="outline"
                onClick={() => setReviewerDialogOpen(true)}
              >
                <Users className="h-4 w-4 mr-2" />
                Assigner des reviewers
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Rôles</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reviewers.map((reviewer) => (
                  <TableRow
                    key={reviewer.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => navigate(`/dashboard/admin/freelance/${reviewer.id}`)}
                  >
                    <TableCell className="font-medium">{reviewer.name}</TableCell>
                    <TableCell>{reviewer.email}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {reviewer.roles.map((role) => (
                          <Badge key={role} variant="outline" className="text-xs">
                            {role}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Candidates Card */}
      <Card className="rounded-xl shadow-sm">
        <CardHeader className="p-6 pb-4 flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Users className="h-5 w-5" />
            Candidats ({candidates.length})
          </CardTitle>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setCandidateDialogOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Ajouter un candidat
          </Button>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          {candidates.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground mb-4">
                Aucun candidat pour cette mission.
              </p>
              <Button
                variant="outline"
                onClick={() => setCandidateDialogOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Ajouter le premier candidat
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>GitHub</TableHead>
                  <TableHead>Statut</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {candidates.map((candidate) => (
                  <TableRow
                    key={candidate.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => navigate(`/dashboard/admin/candidat/${candidate.id}`)}
                  >
                    <TableCell className="font-medium">{candidate.user?.name ?? '—'}</TableCell>
                    <TableCell>{candidate.user?.email ?? '—'}</TableCell>
                    <TableCell>{candidate.githubUsername ?? '—'}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{candidate.status}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Candidate Create Dialog */}
      {checkId && (
        <CandidateCreateDialog
          open={candidateDialogOpen}
          onOpenChange={setCandidateDialogOpen}
          missionId={checkId}
          onSuccess={handleCandidateCreated}
        />
      )}

      {/* Reviewer Assignment Dialog */}
      {detail && (
        <ReviewerAssignmentDialog
          open={reviewerDialogOpen}
          onOpenChange={setReviewerDialogOpen}
          mission={detail.mission}
          allFreelances={allFreelances}
          onSuccess={handleReviewersAssigned}
        />
      )}
    </div>
  );
}
