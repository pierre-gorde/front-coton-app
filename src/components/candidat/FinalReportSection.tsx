/**
 * Final Report Section Component
 * Handles FINAL report generation, editing, validation and PDF export
 * Following CLAUDE.md patterns: proper state management, error handling with toasts
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FileCheck, FileText, Loader2, Download, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Candidate, CandidateReport, CheckMission, Client, ScorecardCriterion } from '@/lib/types';
import { generateFinalReport, validateFinalReport } from '@/lib/services/checkAdminService';
import { exportFinalReportToPDF } from '@/lib/utils/pdfExport';
import { FinalEvaluationCard } from './FinalEvaluationCard';
import { FinalReportForm } from './FinalReportForm';

interface FinalReportSectionProps {
  candidateId: string;
  currentUserId: string;
  finalReport?: CandidateReport;
  reviewerReports: CandidateReport[];
  candidate: Candidate;
  mission: CheckMission;
  client: Client;
  scorecardCriteria: ScorecardCriterion[];
  onReportUpdated: () => void;
}

export function FinalReportSection({
  candidateId,
  currentUserId,
  finalReport,
  reviewerReports,
  candidate,
  mission,
  client,
  scorecardCriteria,
  onReportUpdated,
}: FinalReportSectionProps) {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const handleGenerate = async () => {
    if (reviewerReports.length === 0) {
      toast({
        title: 'Impossible de générer',
        description: 'Au moins un rapport de reviewer est requis',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsGenerating(true);
      await generateFinalReport(candidateId, currentUserId);

      toast({
        title: 'Succès',
        description: 'Rapport final généré avec succès',
        variant: 'success',
      });

      onReportUpdated();
    } catch (error) {
      console.error('Failed to generate final report:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de générer le rapport final',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleValidate = async () => {
    if (!finalReport) return;

    try {
      setIsValidating(true);
      await validateFinalReport(finalReport.id);

      toast({
        title: 'Succès',
        description: 'Rapport final validé',
        variant: 'success',
      });

      onReportUpdated();
    } catch (error) {
      console.error('Failed to validate final report:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de valider le rapport',
        variant: 'destructive',
      });
    } finally {
      setIsValidating(false);
    }
  };

  const handleExportPDF = () => {
    if (!finalReport) return;

    try {
      exportFinalReportToPDF(
        finalReport,
        candidate,
        mission,
        client,
        scorecardCriteria
      );

      toast({
        title: 'Succès',
        description: 'PDF téléchargé avec succès',
        variant: 'success',
      });
    } catch (error) {
      console.error('Failed to export PDF:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible d\'exporter le PDF',
        variant: 'destructive',
      });
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleSave = () => {
    onReportUpdated();
    setIsEditing(false);
  };

  // No final report yet
  if (!finalReport) {
    return (
      <div className="space-y-4">
        <Alert>
          <FileText className="h-4 w-4" />
          <AlertDescription>
            Aucun rapport final n'a encore été généré. Cliquez sur le bouton ci-dessous pour générer un rapport final en fusionnant les évaluations des reviewers.
          </AlertDescription>
        </Alert>

        {reviewerReports.length < 1 && (
          <Alert variant="default" className="border-orange-200 bg-orange-50 text-orange-800 dark:border-orange-800 dark:bg-orange-950 dark:text-orange-200">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Au moins un rapport de reviewer est requis pour générer le rapport final.
            </AlertDescription>
          </Alert>
        )}

        <Button
          onClick={handleGenerate}
          disabled={isGenerating || reviewerReports.length === 0}
          className="w-full gradient-accent text-accent-foreground"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Génération en cours...
            </>
          ) : (
            <>
              <FileCheck className="h-4 w-4 mr-2" />
              Générer le rapport final
            </>
          )}
        </Button>
      </div>
    );
  }

  // Edit mode
  if (isEditing) {
    return (
      <FinalReportForm
        report={finalReport}
        scorecardCriteria={scorecardCriteria}
        onReportUpdated={handleSave}
        onCancel={handleCancel}
      />
    );
  }

  // Display mode
  return (
    <div className="space-y-4">
      <FinalEvaluationCard
        report={finalReport}
        scorecardCriteria={scorecardCriteria}
        hasReviewerReports={reviewerReports.length > 0}
        onEdit={handleEdit}
      />

      <div className="flex items-center gap-3">
        {!finalReport.isValidated ? (
          <Button
            onClick={handleValidate}
            disabled={isValidating}
            variant="default"
            className="gradient-accent text-accent-foreground"
          >
            {isValidating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Validation...
              </>
            ) : (
              <>
                <FileCheck className="h-4 w-4 mr-2" />
                Valider le rapport
              </>
            )}
          </Button>
        ) : (
          <Button
            onClick={handleExportPDF}
            variant="default"
            className="gradient-accent text-accent-foreground"
          >
            <Download className="h-4 w-4 mr-2" />
            Télécharger PDF
          </Button>
        )}

        <Button
          onClick={handleGenerate}
          disabled={isGenerating}
          variant="outline"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Régénération...
            </>
          ) : (
            <>
              <FileCheck className="h-4 w-4 mr-2" />
              Régénérer depuis les reviewers
            </>
          )}
        </Button>
      </div>

      {!finalReport.isValidated && (
        <Alert className="border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Le rapport doit être validé avant de pouvoir être exporté en PDF.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
