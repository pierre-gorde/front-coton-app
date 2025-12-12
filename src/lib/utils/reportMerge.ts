// ===========================================
// COTON Check - Report Merge Utilities
// ===========================================

import type { CandidateReport, CriterionScore, ScorecardCriterion } from '@/lib/types';

/**
 * Merge criterion scores from two reviewer reports
 * - If both have a score → average
 * - If only one → use that score
 * - If none → score = 0
 */
export function mergeCriterionScores(
  primaryReport: CandidateReport | undefined,
  secondaryReport: CandidateReport | undefined,
  scorecardCriteria: ScorecardCriterion[]
): { scores: CriterionScore[]; missingCriteria: string[] } {
  const missingCriteria: string[] = [];
  
  const scores: CriterionScore[] = scorecardCriteria.map(criterion => {
    const primaryScore = primaryReport?.criterionScores.find(cs => cs.criterionId === criterion.id);
    const secondaryScore = secondaryReport?.criterionScores.find(cs => cs.criterionId === criterion.id);

    let score = 0;
    let comment = '';

    if (primaryScore && secondaryScore) {
      // Average of both
      score = Math.round((primaryScore.score + secondaryScore.score) / 2);
      const comments = [primaryScore.comment, secondaryScore.comment].filter(Boolean);
      comment = comments.length > 0 ? comments.join(' | ') : '';
    } else if (primaryScore) {
      score = primaryScore.score;
      comment = primaryScore.comment ?? '';
    } else if (secondaryScore) {
      score = secondaryScore.score;
      comment = secondaryScore.comment ?? '';
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
 * Merge bullet point sections (positives/negatives)
 * - Parse both into bullet lists
 * - Deduplicate
 * - Limit to max 8 bullets (keep longest/most informative)
 */
export function mergeBulletSection(textA: string, textB: string, maxBullets = 8): string {
  const bulletsA = parseIntoBullets(textA);
  const bulletsB = parseIntoBullets(textB);
  
  const combined = [...bulletsA, ...bulletsB];
  const deduplicated = deduplicateBullets(combined);
  
  // Sort by length (keep most informative) and take top N
  const sorted = deduplicated.sort((a, b) => b.length - a.length);
  const limited = sorted.slice(0, maxBullets);
  
  // Re-sort alphabetically for readability
  limited.sort((a, b) => a.localeCompare(b));
  
  return limited.map(b => `- ${b}`).join('\n');
}

/**
 * Merge summary paragraphs
 * - If both exist: combine them into one paragraph
 * - If one exists: use it
 */
export function mergeSummaries(summaryA: string, summaryB: string): string {
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
 * Merge remarks sections
 * - Concatenate, deduplicate lines
 * - Add footer
 */
export function mergeRemarks(remarksA: string, remarksB: string): string {
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
}

export function generateMergedReportData(
  primaryReport: CandidateReport | undefined,
  secondaryReport: CandidateReport | undefined,
  scorecardCriteria: ScorecardCriterion[]
): MergedReportData {
  // Merge criterion scores
  const { scores, missingCriteria } = mergeCriterionScores(
    primaryReport,
    secondaryReport,
    scorecardCriteria
  );

  // Compute weighted final score
  const finalScore = computeWeightedScore(scores, scorecardCriteria);

  // Merge text fields
  const summary = mergeSummaries(
    primaryReport?.summary ?? '',
    secondaryReport?.summary ?? ''
  );

  const positives = mergeBulletSection(
    primaryReport?.positives ?? '',
    secondaryReport?.positives ?? ''
  );

  const negatives = mergeBulletSection(
    primaryReport?.negatives ?? '',
    secondaryReport?.negatives ?? ''
  );

  let remarks = mergeRemarks(
    primaryReport?.remarks ?? '',
    secondaryReport?.remarks ?? ''
  );

  // Add note about missing criteria
  if (missingCriteria.length > 0) {
    remarks += `\n\n⚠️ Critères sans score: ${missingCriteria.join(', ')}`;
  }

  return {
    criterionScores: scores,
    finalScore,
    summary,
    positives,
    negatives,
    remarks,
  };
}
