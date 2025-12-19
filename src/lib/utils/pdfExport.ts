import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { CandidateReport, ScorecardCriterion } from '@/lib/types';

interface PDFExportOptions {
  report: CandidateReport;
  candidateName: string;
  missionTitle: string;
  clientName: string;
  scorecardCriteria: ScorecardCriterion[];
}

export function exportFinalReportToPDF({
  report,
  candidateName,
  missionTitle,
  clientName,
  scorecardCriteria,
}: PDFExportOptions): void {
  const doc = new jsPDF();
  let yPosition = 20;

  // Title
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Évaluation Technique Finale', 105, yPosition, { align: 'center' });
  yPosition += 15;

  // Candidate info
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Candidat: ${candidateName}`, 20, yPosition);
  yPosition += 7;
  doc.text(`Mission: ${missionTitle}`, 20, yPosition);
  yPosition += 7;
  doc.text(`Client: ${clientName}`, 20, yPosition);
  yPosition += 7;
  doc.text(`Date: ${new Date(report.updatedAt).toLocaleDateString('fr-FR')}`, 20, yPosition);
  yPosition += 15;

  // Score final
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  const scoreColor = getScoreColorRGB(report.finalScore);
  doc.setTextColor(scoreColor.r, scoreColor.g, scoreColor.b);
  doc.text(`Score Final: ${report.finalScore}/10`, 105, yPosition, { align: 'center' });
  doc.setTextColor(0, 0, 0);
  yPosition += 15;

  // Summary section
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Avis Global', 20, yPosition);
  yPosition += 7;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  const summaryLines = doc.splitTextToSize(report.summary, 170);
  doc.text(summaryLines, 20, yPosition);
  yPosition += summaryLines.length * 5 + 10;

  // Positives & Negatives
  if (yPosition > 250) {
    doc.addPage();
    yPosition = 20;
  }

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(34, 197, 94); // green
  doc.text('Points Positifs', 20, yPosition);
  yPosition += 7;
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  const positivesLines = doc.splitTextToSize(report.positives, 170);
  doc.text(positivesLines, 20, yPosition);
  yPosition += positivesLines.length * 5 + 10;

  if (yPosition > 250) {
    doc.addPage();
    yPosition = 20;
  }

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(239, 68, 68); // red
  doc.text('Points Négatifs', 20, yPosition);
  yPosition += 7;
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  const negativesLines = doc.splitTextToSize(report.negatives, 170);
  doc.text(negativesLines, 20, yPosition);
  yPosition += negativesLines.length * 5 + 10;

  // Remarks
  if (report.remarks && report.remarks.trim()) {
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Remarques', 20, yPosition);
    yPosition += 7;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    const remarksLines = doc.splitTextToSize(report.remarks, 170);
    doc.text(remarksLines, 20, yPosition);
    yPosition += remarksLines.length * 5 + 10;
  }

  // Criterion Scores Tables
  if (report.criterionScores.length > 0) {
    if (yPosition > 200) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Détail par Critère', 20, yPosition);
    yPosition += 10;

    // Primary criteria
    const primaryCriteria = scorecardCriteria.filter(c => c.group === 'PRIMARY');
    const primaryScores = report.criterionScores.filter(cs =>
      primaryCriteria.some(c => c.id === cs.criterionId)
    );

    if (primaryScores.length > 0) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Critères Primaires', 20, yPosition);
      yPosition += 5;

      const primaryTableData = primaryScores.map(cs => {
        const criterion = scorecardCriteria.find(c => c.id === cs.criterionId);
        return [
          criterion?.label ?? cs.criterionId,
          `${criterion?.weightPercentage ?? 0}%`,
          `${cs.score}/10`,
          cs.comment || '-',
        ];
      });

      autoTable(doc, {
        startY: yPosition,
        head: [['Critère', 'Poids', 'Score', 'Commentaire']],
        body: primaryTableData,
        theme: 'striped',
        headStyles: { fillColor: [31, 41, 55] },
        margin: { left: 20, right: 20 },
        styles: { fontSize: 9 },
      });

      yPosition = (doc as any).lastAutoTable.finalY + 10;
    }

    // Secondary criteria
    const secondaryCriteria = scorecardCriteria.filter(c => c.group === 'SECONDARY');
    const secondaryScores = report.criterionScores.filter(cs =>
      secondaryCriteria.some(c => c.id === cs.criterionId)
    );

    if (secondaryScores.length > 0) {
      if (yPosition > 200) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Critères Secondaires', 20, yPosition);
      yPosition += 5;

      const secondaryTableData = secondaryScores.map(cs => {
        const criterion = scorecardCriteria.find(c => c.id === cs.criterionId);
        return [
          criterion?.label ?? cs.criterionId,
          `${criterion?.weightPercentage ?? 0}%`,
          `${cs.score}/10`,
          cs.comment || '-',
        ];
      });

      autoTable(doc, {
        startY: yPosition,
        head: [['Critère', 'Poids', 'Score', 'Commentaire']],
        body: secondaryTableData,
        theme: 'striped',
        headStyles: { fillColor: [31, 41, 55] },
        margin: { left: 20, right: 20 },
        styles: { fontSize: 9 },
      });
    }
  }

  // Footer with generation info
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(
      `Page ${i} sur ${pageCount} - Généré le ${new Date().toLocaleDateString('fr-FR')}`,
      105,
      290,
      { align: 'center' }
    );
  }

  // Save the PDF
  const filename = `evaluation_finale_${candidateName.replace(/\s+/g, '_')}_${new Date().getTime()}.pdf`;
  doc.save(filename);
}

function getScoreColorRGB(score: number): { r: number; g: number; b: number } {
  if (score >= 8) return { r: 34, g: 197, b: 94 }; // green
  if (score >= 6) return { r: 245, g: 158, b: 11 }; // amber
  return { r: 239, g: 68, b: 68 }; // red
}
