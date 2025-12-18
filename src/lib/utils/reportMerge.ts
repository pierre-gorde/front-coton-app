// ===========================================
// COTON Check - Report Merge Utilities
// ===========================================

import type { CandidateReport, CriterionScore, ScorecardCriterion } from '@/lib/types';

/**
 * Merge criterion scores from multiple reviewer reports
 * - Average all scores for each criterion
 * - If no score → score = 0
 */
export function mergeCriterionScores(
  reports: CandidateReport[],
  scorecardCriteria: ScorecardCriterion[]
): { scores: CriterionScore[]; missingCriteria: string[] } {
  const missingCriteria: string[] = [];

  const scores: CriterionScore[] = scorecardCriteria.map(criterion => {
    // Collect all scores for this criterion from all reports
    const allScores = reports
      .map(report => report.criterionScores.find(cs => cs.criterionId === criterion.id))
      .filter((cs): cs is CriterionScore => cs !== undefined && cs.score > 0);

    let score = 0;
    let comment = '';

    if (allScores.length > 0) {
      // Average all scores
      const sum = allScores.reduce((acc, cs) => acc + cs.score, 0);
      score = Math.round(sum / allScores.length);

      // Combine comments
      const comments = allScores.map(cs => cs.comment).filter(Boolean);
      comment = comments.length > 0 ? comments.join(' | ') : '';
    } else {
      missingCriteria.push(criterion.label);
    }

    return {
      criterionId: criterion.id,
      score,
      comment,
    };
  });

  return { scores, missingCriteria };
}

/**
 * @deprecated Use mergeCriterionScores with array of reports instead
 * Kept for backward compatibility with existing code
 */
export function mergeCriterionScoresLegacy(
  primaryReport: CandidateReport | undefined,
  secondaryReport: CandidateReport | undefined,
  scorecardCriteria: ScorecardCriterion[]
): { scores: CriterionScore[]; missingCriteria: string[] } {
  const reports = [primaryReport, secondaryReport].filter((r): r is CandidateReport => r !== undefined);
  return mergeCriterionScores(reports, scorecardCriteria);
}

/**
 * Compute weighted final score from criterion scores
 */
export function computeWeightedScore(
  criterionScores: CriterionScore[],
  scorecardCriteria: ScorecardCriterion[]
): number {
  let totalWeight = 0;
  let weightedSum = 0;

  for (const cs of criterionScores) {
    const criterion = scorecardCriteria.find(c => c.id === cs.criterionId);
    if (criterion) {
      totalWeight += criterion.weightPercentage;
      weightedSum += cs.score * criterion.weightPercentage;
    }
  }

  return totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0;
}

/**
 * Parse text into bullet points
 * Handles: new lines, "-", "•", numbered lists
 */
function parseIntoBullets(text: string): string[] {
  if (!text.trim()) return [];

  // Split on common bullet patterns
  const lines = text
    .split(/[\n\r]+/)
    .map(line => line.trim())
    .map(line => line.replace(/^[-•*]\s*/, '').replace(/^\d+[.)]\s*/, '').trim())
    .filter(line => line.length > 0);

  return lines;
}

/**
 * Deduplicate bullets (case-insensitive exact match)
 */
function deduplicateBullets(bullets: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const bullet of bullets) {
    const key = bullet.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      result.push(bullet);
    }
  }

  return result;
}

/**
 * Merge bullet point sections (positives/negatives) from multiple texts
 * - Parse all into bullet lists
 * - Deduplicate
 * - Limit to max 8 bullets (keep longest/most informative)
 */
export function mergeBulletSection(texts: string[], maxBullets = 8): string {
  const allBullets = texts.flatMap(text => parseIntoBullets(text));
  const deduplicated = deduplicateBullets(allBullets);

  // Sort by length (keep most informative) and take top N
  const sorted = deduplicated.sort((a, b) => b.length - a.length);
  const limited = sorted.slice(0, maxBullets);

  // Re-sort alphabetically for readability
  limited.sort((a, b) => a.localeCompare(b));

  return limited.map(b => `- ${b}`).join('\n');
}

/**
 * @deprecated Use mergeBulletSection with array of texts
 * Kept for backward compatibility
 */
export function mergeBulletSectionLegacy(textA: string, textB: string, maxBullets = 8): string {
  return mergeBulletSection([textA, textB], maxBullets);
}

/**
 * Merge summary paragraphs from multiple reports
 * - Combine with reviewer name headers
 */
export function mergeSummaries(reports: CandidateReport[]): string {
  const summaries = reports
    .filter(r => r.summary && r.summary.trim())
    .map(r => {
      const reviewerName = r.authorUser ? `${r.authorUser.firstName} ${r.authorUser.lastName}` : 'Reviewer';
      return `### ${reviewerName}\n${r.summary.trim()}`;
    });

  return summaries.join('\n\n');
}

/**
 * @deprecated Use mergeSummaries with array of reports
 * Kept for backward compatibility
 */
export function mergeSummariesLegacy(summaryA: string, summaryB: string): string {
  const a = summaryA.trim();
  const b = summaryB.trim();

  if (a && b) {
    // Combine both, cleaning up redundancy
    if (a.toLowerCase() === b.toLowerCase()) {
      return a;
    }
    return `${a}\n\n${b}`;
  }

  return a || b || '';
}

/**
 * Merge remarks sections from multiple reports
 * - Combine with reviewer name headers
 * - Add footer
 */
export function mergeRemarks(reports: CandidateReport[]): string {
  const remarks = reports
    .filter(r => r.remarks && r.remarks.trim())
    .map(r => {
      const reviewerName = r.authorUser ? `${r.authorUser.firstName} ${r.authorUser.lastName}` : 'Reviewer';
      return `### ${reviewerName}\n${r.remarks.trim()}`;
    });

  const result = remarks.join('\n\n');
  const footer = '\n\n---\n_Rapport fusionné depuis les évaluations reviewers._';

  return result ? result + footer : footer;
}

/**
 * @deprecated Use mergeRemarks with array of reports
 * Kept for backward compatibility
 */
export function mergeRemarksLegacy(remarksA: string, remarksB: string): string {
  const linesA = remarksA.split('\n').map(l => l.trim()).filter(Boolean);
  const linesB = remarksB.split('\n').map(l => l.trim()).filter(Boolean);

  const combined = [...linesA, ...linesB];
  const deduplicated = deduplicateBullets(combined);

  const result = deduplicated.join('\n');
  const footer = '\n\n---\n_Rapport fusionné depuis les évaluations reviewers._';

  return result + footer;
}

/**
 * Generate a complete merged FINAL report data
 */
export interface MergedReportData {
  criterionScores: CriterionScore[];
  finalScore: number;
  summary: string;
  positives: string;
  negatives: string;
  remarks: string;
  prReviewComments: import('@/lib/types').PRReviewComment[];
}

/**
 * Generate merged report from multiple reviewer reports
 * @param reviewerReports - All reviewer reports (not including FINAL)
 * @param scorecardCriteria - Scorecard criteria for scoring
 */
export function generateMergedReportData(
  reviewerReports: CandidateReport[],
  scorecardCriteria: ScorecardCriterion[]
): MergedReportData {
  // Filter out FINAL reports (only merge reviewer reports)
  const reports = reviewerReports.filter(r => r.role !== 'FINAL');

  // Merge criterion scores - average all reviewer scores
  const { scores, missingCriteria } = mergeCriterionScores(reports, scorecardCriteria);

  // Compute weighted final score
  const finalScore = computeWeightedScore(scores, scorecardCriteria);

  // Merge text fields with reviewer name headers
  const summary = mergeSummaries(reports);

  const positives = mergeBulletSection(
    reports.map(r => Array.isArray(r.positivePoints) ? r.positivePoints.join('\n') : r.positivePoints || '')
  );

  const negatives = mergeBulletSection(
    reports.map(r => Array.isArray(r.negativePoints) ? r.negativePoints.join('\n') : r.negativePoints || '')
  );

  let remarks = mergeRemarks(reports);

  // Add note about missing criteria
  if (missingCriteria.length > 0) {
    remarks += `\n\n⚠️ Critères sans score: ${missingCriteria.join(', ')}`;
  }

  // Combine all PR review comments from all reviewers
  const prReviewComments = reports
    .flatMap(r => r.prReviewComments || [])
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return {
    criterionScores: scores,
    finalScore,
    summary,
    positives,
    negatives,
    remarks,
    prReviewComments,
  };
}

/**
 * @deprecated Use generateMergedReportData with array of reports
 * Kept for backward compatibility with existing code
 */
export function generateMergedReportDataLegacy(
  primaryReport: CandidateReport | undefined,
  secondaryReport: CandidateReport | undefined,
  scorecardCriteria: ScorecardCriterion[]
): MergedReportData {
  const reports = [primaryReport, secondaryReport].filter((r): r is CandidateReport => r !== undefined);
  return generateMergedReportData(reports, scorecardCriteria);
}
