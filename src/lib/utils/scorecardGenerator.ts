/**
 * Scorecard Criteria Generation Algorithm
 * Extracted from mockClient.ts for reuse in ScorecardEditDialog
 * Generates weighted criteria from domain ratios based on skill levels
 */

import type {
  DomainRatio,
  ScorecardCriterion,
  CriterionGroup,
  SkillLevel,
  ExpertiseLevel,
  ScorecardSuggestionRule,
} from '@/lib/types';

// Expertise level ordering for comparison
const EXPERTISE_LEVEL_ORDER: Record<ExpertiseLevel, number> = {
  JUNIOR: 1,
  INTERMEDIATE: 2,
  SENIOR: 3,
  EXPERT: 4,
};

// Scorecard suggestion rules - criteria templates per domain and skill level
const SCORECARD_RULES: ScorecardSuggestionRule[] = [
  // Frontend SENIOR+
  {
    domainName: 'Frontend',
    minLevel: 'SENIOR',
    criteria: [
      { label: 'Lisibilité du code', group: 'PRIMARY', weightPercentage: 25 },
      { label: 'Architecture frontend', group: 'PRIMARY', weightPercentage: 25 },
      { label: 'Sécurité frontend', group: 'PRIMARY', weightPercentage: 15 },
      { label: 'Performance', group: 'SECONDARY', weightPercentage: 15 },
      { label: 'Testing', group: 'SECONDARY', weightPercentage: 10 },
      { label: 'Git & Versioning', group: 'SECONDARY', weightPercentage: 10 },
    ],
  },
  // Frontend JUNIOR
  {
    domainName: 'Frontend',
    minLevel: 'JUNIOR',
    criteria: [
      { label: 'Lisibilité du code', group: 'PRIMARY', weightPercentage: 40 },
      { label: 'Git & Versioning', group: 'PRIMARY', weightPercentage: 30 },
      { label: 'Testing', group: 'SECONDARY', weightPercentage: 30 },
    ],
  },
  // Backend SENIOR+
  {
    domainName: 'Backend',
    minLevel: 'SENIOR',
    criteria: [
      { label: 'Architecture API', group: 'PRIMARY', weightPercentage: 25 },
      { label: 'Sécurité backend', group: 'PRIMARY', weightPercentage: 20 },
      { label: 'Base de données', group: 'PRIMARY', weightPercentage: 20 },
      { label: 'Performance serveur', group: 'SECONDARY', weightPercentage: 15 },
      { label: 'Testing backend', group: 'SECONDARY', weightPercentage: 10 },
      { label: 'Documentation', group: 'SECONDARY', weightPercentage: 10 },
    ],
  },
  // Backend JUNIOR
  {
    domainName: 'Backend',
    minLevel: 'JUNIOR',
    criteria: [
      { label: 'Lisibilité du code', group: 'PRIMARY', weightPercentage: 35 },
      { label: 'Base de données', group: 'PRIMARY', weightPercentage: 35 },
      { label: 'Testing backend', group: 'SECONDARY', weightPercentage: 30 },
    ],
  },
  // DevOps
  {
    domainName: 'DevOps',
    minLevel: 'JUNIOR',
    criteria: [
      { label: 'CI/CD', group: 'PRIMARY', weightPercentage: 40 },
      { label: 'Conteneurisation', group: 'PRIMARY', weightPercentage: 35 },
      { label: 'Monitoring', group: 'SECONDARY', weightPercentage: 25 },
    ],
  },
];

/**
 * Generate a unique criterion ID
 */
function generateCriterionId(): string {
  return `crit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Generate scorecardCriteria from domainRatios using suggestion rules.
 *
 * Algorithm:
 * 1. For each domain, find the best matching rule based on skill level
 * 2. Scale criteria weights by domain percentage
 * 3. Normalize all weights to sum to 100
 * 4. Assign unique IDs to each criterion
 *
 * @param domainRatios - Array of domain configurations with percentages and skill levels
 * @returns Array of weighted scorecard criteria ready for evaluation
 */
export function generateScorecardFromDomains(
  domainRatios: DomainRatio[]
): ScorecardCriterion[] {
  const collectedCriteria: Array<{
    label: string;
    group: CriterionGroup;
    weightPercentage: number;
  }> = [];

  for (const domain of domainRatios) {
    // Map SkillLevel to ExpertiseLevel for comparison
    const domainLevel =
      domain.level === 'CONFIRMÉ' ? 'INTERMEDIATE' : (domain.level as ExpertiseLevel);
    const domainLevelOrder = EXPERTISE_LEVEL_ORDER[domainLevel];

    // Find all matching rules for this domain
    const matchingRules = SCORECARD_RULES.filter(
      (rule) =>
        rule.domainName === domain.domainName &&
        EXPERTISE_LEVEL_ORDER[rule.minLevel] <= domainLevelOrder
    );

    if (matchingRules.length === 0) continue;

    // Select the rule with the highest minLevel that still applies
    const bestRule = matchingRules.reduce((best, current) =>
      EXPERTISE_LEVEL_ORDER[current.minLevel] > EXPERTISE_LEVEL_ORDER[best.minLevel]
        ? current
        : best
    );

    // Scale criteria weights by domain percentage
    const scaleFactor = domain.percentage / 100;
    for (const criterion of bestRule.criteria) {
      collectedCriteria.push({
        label: criterion.label,
        group: criterion.group,
        weightPercentage: Math.round(criterion.weightPercentage * scaleFactor),
      });
    }
  }

  // Normalize weights to sum to 100
  const totalWeight = collectedCriteria.reduce((sum, c) => sum + c.weightPercentage, 0);
  const normalizedCriteria = collectedCriteria.map((c) => ({
    ...c,
    weightPercentage: totalWeight > 0 ? Math.round((c.weightPercentage / totalWeight) * 100) : 0,
  }));

  // Generate IDs and return
  return normalizedCriteria.map((c) => ({
    id: generateCriterionId(),
    label: c.label,
    group: c.group,
    weightPercentage: c.weightPercentage,
    description: undefined,
  }));
}

/**
 * Export rules for reference
 */
export { SCORECARD_RULES };
