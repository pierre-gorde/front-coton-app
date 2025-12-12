import { useState } from 'react';
import { Plus, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import type { CandidateReport, ScorecardCriterion, CandidateReportRole, User } from '@/lib/types';
import { getOrCreateReviewerReport } from '@/lib/services/checkAdminService';

interface CreateReportButtonProps {
  candidateId: string;
  reviewer: User;
  role: CandidateReportRole;
  scorecardCriteria: ScorecardCriterion[];
  onReportCreated: (report: CandidateReport) => void;
}

const roleLabels: Record<CandidateReportRole, string> = {
  PRIMARY_REVIEWER: 'Primary Reviewer',
  SECONDARY_REVIEWER: 'Secondary Reviewer',
  FINAL: 'Final',
};

export function CreateReportButton({
  candidateId,
  reviewer,
  role,
  scorecardCriteria,
  onReportCreated,
}: CreateReportButtonProps) {
  const { toast } = useToast();
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    setCreating(true);
    try {
      const report = await getOrCreateReviewerReport(
        candidateId,
        reviewer.id,
        role,
        scorecardCriteria
      );
      onReportCreated(report);
      toast({
        title: 'Rapport créé',
        description: 'Vous pouvez maintenant remplir votre évaluation.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Impossible de créer le rapport.',
      });
    } finally {
      setCreating(false);
    }
  };

  return (
    <Card className="rounded-xl shadow-sm border-dashed border-2">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-medium">{reviewer.name}</span>
            <Badge variant="outline">{roleLabels[role]}</Badge>
            <span className="text-sm text-muted-foreground">
              Aucun rapport
            </span>
          </div>
          <Button onClick={handleCreate} disabled={creating}>
            {creating ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Plus className="h-4 w-4 mr-2" />
            )}
            Créer mon rapport
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
