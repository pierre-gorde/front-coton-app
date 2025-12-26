/**
 * Candidate Detail Page
 * Displays candidate evaluation with tab structure: Reviewer Reports + Final Report
 * Following CLAUDE.md patterns: proper state management, error handling
 */

import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Briefcase, Building2, Edit, ExternalLink, FileText, GitPullRequest, Loader2, User as UserIcon, UserMinus, UserPlus, Users } from 'lucide-react';
import { type CandidateEvaluationView } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link, useParams } from 'react-router-dom';
import { getCandidateEvaluationView } from '@/lib/services/checkAdminService';
import { inviteCandidateToRepo, excludeCandidateFromRepo } from '@/lib/services/githubService';
import { useCallback, useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { AppBreadcrumb } from '@/components/common/AppBreadcrumb';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ReviewerSideMenu } from '@/components/candidat/ReviewerSideMenu';
import { ReviewerReportSection } from '@/components/candidat/ReviewerReportSection';
import { FinalReportSection } from '@/components/candidat/FinalReportSection';
import { CandidateReviewerAssignmentDialog } from '@/components/candidat/CandidateReviewerAssignmentDialog';
import { CandidateEditDialog } from '@/components/candidat/CandidateEditDialog';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { RoleEnum, type User } from '@/lib/types';

export default function CandidatDetailPage() {
  const { candidateId } = useParams<{ candidateId: string }>();
  const { user, roles } = useAuth();
  const { toast } = useToast();
  const [data, setData] = useState<CandidateEvaluationView | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'reviewers' | 'final'>('reviewers');
  const [selectedReviewerId, setSelectedReviewerId] = useState<string | null>(null);
  const [invitingGithub, setInvitingGithub] = useState(false);
  const [excludingGithub, setExcludingGithub] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [allFreelances, setAllFreelances] = useState<User[]>([]);

  const isAdmin = roles.includes(RoleEnum.ADMIN);
  const isReviewer = roles.includes(RoleEnum.FREELANCE);

  const loadData = useCallback(async () => {
    if (!candidateId) return;
    setLoading(true);

    try {
      const result = await getCandidateEvaluationView(candidateId);
      setData(result ?? null);

      // Auto-select first reviewer or current user if reviewer
      if (result) {
        if (isReviewer && !isAdmin) {
          // Reviewer sees only their own report
          setSelectedReviewerId(user?.id || null);
        } else if (result.assignedReviewers.length > 0) {
          // Admin/others see first reviewer by default
          setSelectedReviewerId(result.assignedReviewers[0].id);
        }
      }
    } catch (error) {
      console.error('Failed to load candidate data:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les données du candidat',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [candidateId, isAdmin, isReviewer, user?.id, toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Load all freelances for reviewer assignment (admin only)
  useEffect(() => {
    if (isAdmin) {
      const loadFreelances = async () => {
        try {
          const { listUsers } = await import('@/lib/services/checkAdminService');
          const users = await listUsers();
          // Filter to only freelances (FREELANCE role)
          const freelances = users.filter(u =>
            u.roles?.some(r => r.role.name === RoleEnum.FREELANCE)
          );
          setAllFreelances(freelances);
        } catch (error) {
          console.error('Failed to load freelances:', error);
        }
      };
      loadFreelances();
    }
  }, [isAdmin]);

  const handleInviteToGithub = async () => {
    if (!candidateId) return;

    try {
      setInvitingGithub(true);
      await inviteCandidateToRepo(candidateId);

      toast({
        title: 'Succès',
        description: 'Invitation envoyée au candidat',
        variant: 'success',
      });
    } catch (error) {
      console.error('Failed to invite candidate:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible d\'inviter le candidat au repository',
        variant: 'destructive',
      });
    } finally {
      setInvitingGithub(false);
    }
  };

  const handleExcludeFromGithub = async () => {
    if (!candidateId) return;

    try {
      setExcludingGithub(true);
      await excludeCandidateFromRepo(candidateId);

      toast({
        title: 'Succès',
        description: 'Candidat retiré du repository',
        variant: 'success',
      });
    } catch (error) {
      console.error('Failed to exclude candidate:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de retirer le candidat du repository',
        variant: 'destructive',
      });
    } finally {
      setExcludingGithub(false);
    }
  };

  const handleAssignmentSuccess = () => {
    // Reload data to get updated reviewer list
    loadData();
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

  const { candidate, user: candidateUser, mission, client, assignedReviewers, scorecardCriteria, reports } = data;

  const breadcrumbItems = [
    { label: 'Admin', href: '/dashboard' },
    { label: 'COTON Check', href: '/dashboard/admin/check/mission' },
    { label: mission.title, href: `/dashboard/admin/check/mission/${mission.id}` },
    { label: `${candidateUser?.firstName} ${candidateUser?.lastName}`, isCurrent: true },
  ];

  // Separate reports by role
  const finalReport = reports.find(r => r.role === 'FINAL');
  const reviewerReports = reports.filter(r => r.role !== 'FINAL');

  // Get selected reviewer's report
  const selectedReport = selectedReviewerId
    ? reports.find(r => r.authorUserId === selectedReviewerId && r.role !== 'FINAL')
    : undefined;

  const selectedReviewer = selectedReviewerId
    ? assignedReviewers.find(r => r.id === selectedReviewerId)
    : undefined;

  // Check if current user can edit reports
  const canEditReports = isAdmin || (isReviewer && user?.id === selectedReviewerId);

  // Filter reviewers if not admin (show only self)
  const visibleReviewers = isAdmin ? assignedReviewers : assignedReviewers.filter(r => r.id === user?.id);

  return (
    <div className="space-y-6">
      <AppBreadcrumb items={breadcrumbItems} />

      {/* Candidate Header Card */}
      <Card className="rounded-xl shadow-sm">
        <CardHeader className="p-6 pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <UserIcon className="h-5 w-5" />
              {candidateUser?.firstName} {candidateUser?.lastName}
            </CardTitle>
            {isAdmin && (
              <Button
                onClick={() => setEditDialogOpen(true)}
                variant="outline"
                size="sm"
              >
                <Edit className="h-4 w-4 mr-2" />
                Modifier les infos
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-6 pt-0 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left Column */}
            <div className="space-y-3">
              {candidateUser?.email && (
                <p className="text-sm text-muted-foreground">{candidateUser.email}</p>
              )}

              <div className="flex items-center gap-2 text-sm">
                <ExternalLink className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">GitHub:</span>
                {candidateUser?.githubUsername ? (
                  <span className="font-medium">@{candidateUser.githubUsername}</span>
                ) : (
                  <span className="text-muted-foreground italic">Non renseigné</span>
                )}
              </div>

              <div className="flex items-center gap-2 text-sm">
                <Briefcase className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Mission:</span>
                <Link
                  to={`/dashboard/admin/check/mission/${mission.id}`}
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

              <div className="flex items-center gap-2 text-sm">
                <ExternalLink className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Repository:</span>
                {candidate.githubRepoUrl ? (
                  <a
                    href={candidate.githubRepoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline font-medium flex items-center gap-1"
                  >
                    {candidate.githubRepoUrl.replace('https://github.com/', '')}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                ) : (
                  <span className="text-muted-foreground italic">Non renseigné</span>
                )}
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Reviewers ({assignedReviewers.length}):</span>
              </div>

              {assignedReviewers.length < 2 && (
                <Alert className="border-orange-200 bg-orange-50 text-orange-800 dark:border-orange-800 dark:bg-orange-950 dark:text-orange-200">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Il est recommandé d'avoir au moins 2 reviewers.
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex flex-wrap gap-2">
                {assignedReviewers.map((reviewer) => (
                  <Badge key={reviewer.id} variant="outline">
                    {reviewer.firstName} {reviewer.lastName}
                  </Badge>
                ))}
                {assignedReviewers.length === 0 && (
                  <span className="text-sm text-muted-foreground">Aucun reviewer assigné</span>
                )}
              </div>

              {/* Admin: Assign Reviewers Button */}
              {isAdmin && (
                <div className="flex gap-2">
                  <Button
                    onClick={() => setAssignDialogOpen(true)}
                    variant="outline"
                    size="sm"
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Assigner reviewers
                  </Button>
                </div>
              )}

              {/* GitHub Admin Actions */}
              {isAdmin && candidate.githubRepoUrl && (
                <div className="flex gap-2 mt-2">
                  <Button
                    onClick={handleInviteToGithub}
                    disabled={invitingGithub}
                    variant="outline"
                    size="sm"
                  >
                    {invitingGithub ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <UserPlus className="h-4 w-4 mr-2" />
                    )}
                    Inviter au repo
                  </Button>

                  <Button
                    onClick={handleExcludeFromGithub}
                    disabled={excludingGithub}
                    variant="outline"
                    size="sm"
                  >
                    {excludingGithub ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <UserMinus className="h-4 w-4 mr-2" />
                    )}
                    Retirer du repo
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs: Reviewer Reports + Final Report */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'reviewers' | 'final')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="reviewers" className="flex items-center gap-2">
            <GitPullRequest className="h-4 w-4" />
            Rapports reviewers
          </TabsTrigger>
          <TabsTrigger value="final" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Rapport final
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Reviewer Reports */}
        <TabsContent value="reviewers" className="space-y-4">
          {visibleReviewers.length === 0 ? (
            <Alert>
              <AlertDescription>
                Aucun reviewer assigné à cette mission.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Reviewer Side Menu (left) */}
              <div className="lg:col-span-1">
                <Card className="rounded-xl shadow-sm">
                  <CardHeader className="p-4">
                    <CardTitle className="text-sm">Reviewers</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <ReviewerSideMenu
                      reviewers={visibleReviewers}
                      reports={reviewerReports}
                      activeReviewerId={selectedReviewerId}
                      onSelectReviewer={setSelectedReviewerId}
                    />
                  </CardContent>
                </Card>
              </div>

              {/* Selected Reviewer Report (right) */}
              <div className="lg:col-span-3">
                {selectedReviewer ? (
                  <ReviewerReportSection
                    report={selectedReport}
                    candidateId={candidate.id}
                    reviewerUserId={selectedReviewer.id}
                    authorName={`${selectedReviewer.firstName} ${selectedReviewer.lastName}`}
                    scorecardCriteria={scorecardCriteria}
                    onReportUpdated={loadData}
                    canEdit={canEditReports}
                  />
                ) : (
                  <Alert>
                    <AlertDescription>
                      Sélectionnez un reviewer pour voir son rapport.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </div>
          )}
        </TabsContent>

        {/* Tab 2: Final Report */}
        <TabsContent value="final" className="space-y-4">
          <FinalReportSection
            candidateId={candidate.id}
            currentUserId={user?.id || ''}
            finalReport={finalReport}
            reviewerReports={reviewerReports}
            candidate={candidate}
            candidateName={`${candidateUser?.firstName} ${candidateUser?.lastName}`}
            mission={mission}
            client={client}
            scorecardCriteria={scorecardCriteria}
            onReportUpdated={loadData}
          />
        </TabsContent>
      </Tabs>

      {/* Reviewer Assignment Dialog */}
      {isAdmin && (
        <CandidateReviewerAssignmentDialog
          open={assignDialogOpen}
          onOpenChange={setAssignDialogOpen}
          candidate={candidate}
          currentAssignedReviewers={assignedReviewers}
          allFreelances={allFreelances}
          onSuccess={handleAssignmentSuccess}
        />
      )}

      {/* Candidate Edit Dialog */}
      {isAdmin && (
        <CandidateEditDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          candidate={candidate}
          candidateUser={candidateUser}
          onSuccess={loadData}
        />
      )}
    </div>
  );
}
