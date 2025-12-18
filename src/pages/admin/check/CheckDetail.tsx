import { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AlertTriangle, Loader2, Plus, Users } from 'lucide-react';

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
import { MissionHeader } from '@/components/check/MissionHeader';
import { getCheckMissionDetail, listUsers, type CheckMissionDetail } from '@/lib/services/checkAdminService';
import { type User, type CheckMission, RoleEnum } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

export default function CheckDetailPage() {
  const { checkId } = useParams<{ checkId: string }>();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [detail, setDetail] = useState<CheckMissionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [candidateDialogOpen, setCandidateDialogOpen] = useState(false);
  const [reviewerDialogOpen, setReviewerDialogOpen] = useState(false);
  const [allFreelances, setAllFreelances] = useState<User[]>([]);

  const loadDetail = useCallback(async () => {
    try {
    if (!checkId) return;

    setLoading(true);

    const [missionData, users] = await Promise.all([
      getCheckMissionDetail(checkId),
      listUsers(),
    ]);

    setDetail(missionData);
    // Filter only freelances
    setAllFreelances(users.filter(u => u.roles?.some(r => r.role?.name === RoleEnum.FREELANCE)))
    } catch (error) {
      console.error('Failed to load detail:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger le poste',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [checkId, toast]);

  useEffect(() => {
    loadDetail();
  }, [loadDetail]);

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

  const handleMissionUpdate = async (updatedMission: CheckMission) => {
    // Refresh mission detail to show updated mission
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

  return (
    <div className="space-y-6">
      <AppBreadcrumb items={breadcrumbItems} />

      {/* Mission Header and Reviewers - Side by side on large screens */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mission Header with Edit Capabilities */}
        <MissionHeader
          mission={mission}
          client={client}
          onUpdate={handleMissionUpdate}
        />

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
                    <TableCell className="font-medium">{reviewer.firstName} {reviewer.lastName}</TableCell>
                    <TableCell>{reviewer.email}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {reviewer.roles.map(({role,id}) => (
                          <Badge key={id} variant="outline" className="text-xs">
                            {role.name}
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
      </div>

      {/* Scorecard Card */}
      <ScorecardCard mission={mission} onUpdate={handleMissionUpdate} />

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
                    <TableCell className="font-medium">{candidate.user?.firstName} {candidate.user?.lastName ?? '—'}</TableCell>
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
