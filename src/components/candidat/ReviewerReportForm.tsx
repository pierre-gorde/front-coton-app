import { useState, useCallback } from 'react';
import { Save, Loader2, FileEdit, X } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import type { CandidateReport, ScorecardCriterion, CriterionScore, CriterionGroup, CandidateReportRole, PRReviewComment } from '@/lib/types';
import { updateReviewerReport, computeFinalScore } from '@/lib/services/checkAdminService';
import { PRCommentsSection } from './PRCommentsSection';

interface ReviewerReportFormProps {
  report: CandidateReport;
  authorName: string;
  candidateId: string;
  reviewerUserId: string;
  scorecardCriteria: ScorecardCriterion[];
  onReportUpdated: (report: CandidateReport) => void;
  onCancel?: () => void;
}

const roleLabels: Record<CandidateReportRole, string> = {
  PRIMARY_REVIEWER: 'Primary Reviewer',
  SECONDARY_REVIEWER: 'Secondary Reviewer',
  FINAL: 'Final',
};

function getScoreColor(score: number): string {
  if (score >= 80) return 'text-green-600 dark:text-green-400';
  if (score >= 60) return 'text-amber-600 dark:text-amber-400';
  return 'text-red-600 dark:text-red-400';
}

interface CriterionGroupFormProps {
  group: CriterionGroup;
  title: string;
  scorecardCriteria: ScorecardCriterion[];
  criterionScores: CriterionScore[];
  onScoreChange: (criterionId: string, score: number) => void;
  onCommentChange: (criterionId: string, comment: string) => void;
}

function CriterionGroupForm({
  group,
  title,
  scorecardCriteria,
  criterionScores,
  onScoreChange,
  onCommentChange,
}: CriterionGroupFormProps) {
  const groupCriteria = scorecardCriteria.filter(c => c.group === group);
  const totalWeight = groupCriteria.reduce((sum, c) => sum + c.weightPercentage, 0);

  if (groupCriteria.length === 0) return null;

  const getScore = (criterionId: string): CriterionScore | undefined => 
    criterionScores.find(cs => cs.criterionId === criterionId);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h4 className="font-medium text-sm uppercase tracking-wide text-muted-foreground">
            {title}
          </h4>
          <Badge variant={group === 'PRIMARY' ? 'default' : 'secondary'} className="text-xs">
            {groupCriteria.length} critères
          </Badge>
        </div>
        <span className="text-xs text-muted-foreground">Poids total: {totalWeight}%</span>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[35%]">Critère</TableHead>
            <TableHead className="w-16 text-center">Poids</TableHead>
            <TableHead className="w-24 text-center">Score</TableHead>
            <TableHead>Commentaire</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {groupCriteria.map(criterion => {
            const scoreData = getScore(criterion.id);
            const score = scoreData?.score ?? 0;
            return (
              <TableRow key={criterion.id}>
                <TableCell>
                  <div>
                    <span className="font-medium text-sm">{criterion.label}</span>
                    {criterion.description && (
                      <p className="text-xs text-muted-foreground">{criterion.description}</p>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant="outline" className="text-xs">
                    {criterion.weightPercentage}%
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      value={score}
                      onChange={(e) => onScoreChange(criterion.id, Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                      className={`w-16 text-center ${getScoreColor(score)}`}
                    />
                    <span className="text-xs text-muted-foreground">/100</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Input
                    placeholder="Commentaire optionnel"
                    value={scoreData?.comment ?? ''}
                    onChange={(e) => onCommentChange(criterion.id, e.target.value)}
                    className="text-sm"
                  />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

export function ReviewerReportForm({
  report,
  authorName,
  candidateId,
  reviewerUserId,
  scorecardCriteria,
  onReportUpdated,
  onCancel,
}: ReviewerReportFormProps) {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);

  // Initialize criterion scores, ensuring all criteria from scorecard are present
  const initializeCriterionScores = (
    existingScores: CriterionScore[],
    criteria: ScorecardCriterion[]
  ): CriterionScore[] => {
    return criteria.map(criterion => {
      const existing = existingScores.find(s => s.criterionId === criterion.id);
      return existing || { criterionId: criterion.id, score: 0, comment: '' };
    });
  };

  // Convert positivePoints/negativePoints arrays to strings for textarea
  const positivePointsToString = (points: string[]): string => {
    return Array.isArray(points) ? points.join('\n') : points || '';
  };

  const negativePointsToString = (points: string[]): string => {
    return Array.isArray(points) ? points.join('\n') : points || '';
  };

  const [criterionScores, setCriterionScores] = useState<CriterionScore[]>(
    initializeCriterionScores(report.criterionScores, scorecardCriteria)
  );
  const [summary, setSummary] = useState(report.summary);
  const [positives, setPositives] = useState(positivePointsToString(report.positivePoints));
  const [negatives, setNegatives] = useState(negativePointsToString(report.negativePoints));
  const [remarks, setRemarks] = useState(report.remarks);
  const [prReviewComments, setPrReviewComments] = useState<PRReviewComment[]>(report.prReviewComments || []);

  // Calculate live final score
  const liveScore = computeFinalScore(criterionScores, scorecardCriteria);

  // Check if form is dirty (has changes)
  const isDirty = useCallback(() => {
    return (
      summary !== report.summary ||
      positives !== report.positives ||
      negatives !== report.negatives ||
      remarks !== report.remarks ||
      JSON.stringify(criterionScores) !== JSON.stringify(report.criterionScores)
    );
  }, [summary, positives, negatives, remarks, criterionScores, report]);

  const handleScoreChange = (criterionId: string, score: number) => {
    setCriterionScores(prev => 
      prev.map(cs => cs.criterionId === criterionId ? { ...cs, score } : cs)
    );
  };

  const handleCommentChange = (criterionId: string, comment: string) => {
    setCriterionScores(prev => 
      prev.map(cs => cs.criterionId === criterionId ? { ...cs, comment } : cs)
    );
  };

  const handleCommentsLoaded = (comments: PRReviewComment[]) => {
    setPrReviewComments(comments);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await updateReviewerReport(report.id, {
        criterionScores,
        summary,
        positives,
        negatives,
        remarks,
        prReviewComments,
      });
      onReportUpdated(updated);
      toast({
        title: 'Rapport sauvegardé',
        description: `Score final: ${updated.finalScore}/100`,
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Impossible de sauvegarder le rapport.',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="rounded-xl shadow-sm border-2 border-primary/20">
      <CardHeader className="p-6 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileEdit className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">{authorName}</CardTitle>
            <Badge variant="secondary">{roleLabels[report.role]}</Badge>
            {isDirty() && (
              <Badge variant="outline" className="text-amber-600 border-amber-600">
                Brouillon
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className={`text-2xl font-bold ${getScoreColor(liveScore)}`}>
                {liveScore}/100
              </div>
              <div className="text-xs text-muted-foreground">Score pondéré</div>
            </div>
            <div className="flex items-center gap-2">
              {onCancel && (
                <Button onClick={onCancel} variant="outline" disabled={saving}>
                  <X className="h-4 w-4 mr-2" />
                  Annuler
                </Button>
              )}
              <Button onClick={handleSave} disabled={saving}>
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Sauvegarder
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6 pt-0 space-y-6">
        {/* Criterion Scores by Group */}
        <div className="space-y-6">
          <CriterionGroupForm
            group="PRIMARY"
            title="Critères primaires"
            scorecardCriteria={scorecardCriteria}
            criterionScores={criterionScores}
            onScoreChange={handleScoreChange}
            onCommentChange={handleCommentChange}
          />
          <CriterionGroupForm
            group="SECONDARY"
            title="Critères secondaires"
            scorecardCriteria={scorecardCriteria}
            criterionScores={criterionScores}
            onScoreChange={handleScoreChange}
            onCommentChange={handleCommentChange}
          />
        </div>

        <Separator />

        {/* Text Areas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="summary">Avis global</Label>
            <Textarea
              id="summary"
              placeholder="Résumé de votre évaluation..."
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              rows={4}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="remarks">Remarques</Label>
            <Textarea
              id="remarks"
              placeholder="Remarques complémentaires..."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              rows={4}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="positives" className="text-green-700 dark:text-green-400">
              Points positifs
            </Label>
            <Textarea
              id="positives"
              placeholder="- Point positif 1&#10;- Point positif 2"
              value={positives}
              onChange={(e) => setPositives(e.target.value)}
              rows={4}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="negatives" className="text-red-700 dark:text-red-400">
              Points négatifs
            </Label>
            <Textarea
              id="negatives"
              placeholder="- Point négatif 1&#10;- Point négatif 2"
              value={negatives}
              onChange={(e) => setNegatives(e.target.value)}
              rows={4}
            />
          </div>
        </div>

        <Separator />

        {/* PR Review Comments Section */}
        <PRCommentsSection
          candidateId={candidateId}
          reviewerUserId={reviewerUserId}
          comments={prReviewComments}
          onCommentsLoaded={handleCommentsLoaded}
          disabled={saving}
        />
      </CardContent>
    </Card>
  );
}
