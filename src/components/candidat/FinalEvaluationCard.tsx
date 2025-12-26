import { useState } from 'react';
import { Award, RefreshCw, Loader2, Clock, Pencil, Code2 } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import type { CandidateReport, ScorecardCriterion, CriterionGroup } from '@/lib/types';

interface FinalEvaluationCardProps {
  report: CandidateReport | undefined;
  scorecardCriteria: ScorecardCriterion[];
  hasReviewerReports: boolean;
  onGenerateFinal?: () => Promise<void>;
  onEdit?: () => void;
}

function getScoreColor(score: number): string {
  if (score >= 8) return 'text-green-600 dark:text-green-400';
  if (score >= 6) return 'text-amber-600 dark:text-amber-400';
  return 'text-red-600 dark:text-red-400';
}

interface GroupedScoresTableProps {
  report: CandidateReport;
  scorecardCriteria: ScorecardCriterion[];
  group: CriterionGroup;
  title: string;
}

function GroupedScoresTable({ report, scorecardCriteria, group, title }: GroupedScoresTableProps) {
  const groupCriteria = scorecardCriteria.filter(c => c.group === group);
  const groupScores = report.criterionScores.filter(cs => 
    groupCriteria.some(c => c.id === cs.criterionId)
  );

  if (groupScores.length === 0) return null;

  const getCriterion = (criterionId: string) => 
    scorecardCriteria.find(c => c.id === criterionId);

  const totalWeight = groupCriteria.reduce((sum, c) => sum + c.weightPercentage, 0);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h5 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            {title}
          </h5>
          <Badge variant={group === 'PRIMARY' ? 'default' : 'secondary'} className="text-xs">
            {groupCriteria.length} critères
          </Badge>
        </div>
        <span className="text-xs text-muted-foreground">Poids total: {totalWeight}%</span>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Critère</TableHead>
            <TableHead className="w-16 text-center">Poids</TableHead>
            <TableHead className="w-16 text-right">Score</TableHead>
            <TableHead>Commentaire</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {groupScores.map(cs => {
            const criterion = getCriterion(cs.criterionId);
            return (
              <TableRow key={cs.criterionId}>
                <TableCell className="font-medium">
                  {criterion?.label ?? cs.criterionId}
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant="outline" className="text-xs">
                    {criterion?.weightPercentage ?? 0}%
                  </Badge>
                </TableCell>
                <TableCell className={`text-right font-semibold ${getScoreColor(cs.score)}`}>
                  {cs.score}
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {cs.comment ?? '—'}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

export function FinalEvaluationCard({
  report,
  scorecardCriteria,
  hasReviewerReports,
  onGenerateFinal,
  onEdit,
}: FinalEvaluationCardProps) {
  const { toast } = useToast();
  const [generating, setGenerating] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const handleGenerateClick = () => {
    // If report exists, show confirmation dialog
    if (report) {
      setShowConfirmDialog(true);
    } else {
      // If no report exists, generate directly
      handleGenerate();
    }
  };

  const handleGenerate = async () => {
    setShowConfirmDialog(false);
    if (!onGenerateFinal) return;
    setGenerating(true);
    try {
      await onGenerateFinal();
      toast({
        title: 'Rapport final généré',
        description: 'Le rapport a été fusionné depuis les évaluations reviewers.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: error instanceof Error ? error.message : 'Impossible de générer le rapport.',
      });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Card className="rounded-xl shadow-sm">
      <CardHeader className="p-6 pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Évaluation finale
          </CardTitle>
          <div className="flex items-center gap-2">
            {report && onEdit && (
              <Button onClick={onEdit} variant="ghost" size="icon">
                <Pencil className="h-4 w-4" />
              </Button>
            )}
            {hasReviewerReports && onGenerateFinal && (
              <Button
                onClick={handleGenerateClick}
                disabled={generating}
                variant={report ? "destructive" : "outline"}
              >
                {generating ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                {report ? 'Régénérer' : 'Générer'} le rapport final
              </Button>
            )}
          </div>
        </div>
        {report && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
            <Clock className="h-3 w-3" />
            Dernière mise à jour: {format(new Date(report.updatedAt), "d MMMM yyyy 'à' HH:mm", { locale: fr })}
          </div>
        )}
      </CardHeader>
      <CardContent className="p-6 pt-0">
        {!report ? (
          <Alert>
            <AlertDescription>
              {hasReviewerReports 
                ? "Cliquez sur 'Générer le rapport final' pour fusionner les évaluations des reviewers."
                : "Évaluation finale non encore créée. Il faut d'abord avoir au moins un rapport reviewer."}
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-6">
            {/* Big Score */}
            <div className="flex items-center justify-center">
              <div className="text-center">
                <div className={`text-5xl font-bold ${getScoreColor(report.finalScore)}`}>
                  {report.finalScore}
                </div>
                <div className="text-sm text-muted-foreground mt-1">Score final / 10</div>
              </div>
            </div>

            {/* Summary */}
            <div className="bg-muted/50 rounded-lg p-4">
              <h4 className="text-sm font-medium mb-2">Avis global</h4>
              <p className="text-sm whitespace-pre-line">{report.summary}</p>
            </div>

            {/* Positifs / Négatifs / Remarques */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-green-700 dark:text-green-400">
                  Points positifs
                </h4>
                <p className="text-sm whitespace-pre-line text-muted-foreground">
                  {report.positivePoints}
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-medium text-red-700 dark:text-red-400">
                  Points négatifs
                </h4>
                <p className="text-sm whitespace-pre-line text-muted-foreground">
                  {report.negativePoints}
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-medium">Remarques</h4>
                <p className="text-sm whitespace-pre-line text-muted-foreground">
                  {report.remarks}
                </p>
              </div>
            </div>

            {/* Criterion Scores by Group */}
            {report.criterionScores.length > 0 && (
              <div className="space-y-4 border-t pt-4">
                <h4 className="text-sm font-medium">Détail par critère</h4>
                <GroupedScoresTable
                  report={report}
                  scorecardCriteria={scorecardCriteria}
                  group="PRIMARY"
                  title="Critères primaires"
                />
                <GroupedScoresTable
                  report={report}
                  scorecardCriteria={scorecardCriteria}
                  group="SECONDARY"
                  title="Critères secondaires"
                />
              </div>
            )}

            {/* PR Review Comments Section (Read-only) */}
            {report.prReviewComments && report.prReviewComments.trim() && (
              <div className="space-y-4 border-t pt-4">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  <Code2 className="h-4 w-4" />
                  Code Reviews GitHub
                </h4>
                <p className="text-xs text-muted-foreground">
                  Commentaires de code review extraits des PRs du repository
                </p>
                <div className="bg-muted/20 border rounded-lg p-4">
                  <pre className="text-xs whitespace-pre-wrap font-mono">
                    {report.prReviewComments}
                  </pre>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Régénérer le rapport final ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action va écraser le rapport final existant et le remplacer par une nouvelle fusion des évaluations des reviewers.
              <br /><br />
              <strong>Attention :</strong> Toutes les modifications manuelles du rapport final seront perdues.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleGenerate}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Régénérer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
