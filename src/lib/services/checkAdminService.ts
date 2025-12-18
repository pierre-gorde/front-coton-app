// ===========================================
// COTON Check > ADMIN - Service Layer
// ===========================================

import type { Candidate, CandidateEvaluationView, CandidateReport, CandidateReportRole, CheckMission, Client, CriterionScore, Scorecard, ScorecardCriterion, User } from '@/lib/types';

import type { ReportUpdatePayload } from '@/lib/api/contracts';
import { realCheckAdminClient as apiClient } from '@/lib/api/realClient';

export interface CheckMissionWithClient extends CheckMission {
  client: Client | undefined;
}

export interface CheckMissionDetail {
  mission: CheckMission;
  client: Client | undefined;
  reviewers: User[];
  candidates: CandidateWithUser[];
}

export interface CandidateWithUser extends Candidate {
  user: User | undefined;
}

// ----- Missions -----

export async function listCheckMissions(): Promise<CheckMissionWithClient[]> {
  const [missions, clients] = await Promise.all([
    apiClient.listCheckMissions(),
    apiClient.listClients(),
  ]);

  return missions.map(mission => ({
    ...mission,
    client: clients.find(c => c.id === mission.clientId),
  }));
}

export async function getCheckMissionDetail(checkId: string): Promise<CheckMissionDetail | null> {
  const mission = await apiClient.getCheckMissionById(checkId);

  if (!mission) {
    return null;
  }

  const [client, users, missionCandidates] = await Promise.all([
    apiClient.getClientById(mission.clientId),
    apiClient.listUsers(),
    apiClient.listCandidatesByMission(checkId),
  ]);
  
  const reviewers = users.filter(u => mission.assignedReviewers?.map(r => r.id)?.includes(u.id)) ?? [];

  const candidates: CandidateWithUser[] = missionCandidates.map(candidate => ({
    ...candidate,
    user: users.find(u => u.id === candidate.userId),
  }));

  return {
    mission,
    client,
    reviewers,
    candidates,
  };
}

export async function createCheckMission(
  input?: { title?: string; clientId?: string }
): Promise<CheckMission> {
  return apiClient.createCheckMission(input || {});
}

export async function updateCheckMission(
  id: string,
  updates: Partial<Omit<CheckMission, 'id'>>
): Promise<CheckMission> {
  return apiClient.updateCheckMission(id, updates);
}

export async function deleteCheckMission(id: string): Promise<void> {
  return apiClient.deleteCheckMission(id);
}

// ----- Scorecard -----

export async function upsertScorecard(
  missionId: string,
  scorecard: Scorecard
): Promise<CheckMission> {
  return apiClient.upsertScorecard(missionId, scorecard);
}

// ----- Clients -----

export async function listClients(): Promise<Client[]> {
  return apiClient.listClients();
}

export async function getClientById(id: string): Promise<Client | undefined> {
  return apiClient.getClientById(id);
}

// ----- Candidates -----

export async function getCandidateById(id: string): Promise<CandidateWithUser | null> {
  const candidate = await apiClient.getCandidateById(id);

  if (!candidate) {
    return null;
  }

  const user = await apiClient.getUserById(candidate.userId);

  return {
    ...candidate,
    user,
  };
}

export async function createCandidate(
  input: { firstName: string; lastName?: string | null; email: string;
    githubUsername?: string | null },
  checkMissionId: string,
): Promise<Candidate> {
  return apiClient.createCandidate({
    user: {
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email,
      githubUsername: input.githubUsername || undefined,
    },
    checkMissionId,
  });
}

export async function updateCandidate(
  id: string,
  updates: Partial<Omit<Candidate, 'id' | 'userId' | 'checkMissionId'>>
): Promise<Candidate> {
  return apiClient.updateCandidate(id, updates);
}

export async function deleteCandidate(id: string): Promise<void> {
  return apiClient.deleteCandidate(id);
}

// ----- Users -----

export async function listUsers(): Promise<User[]> {
  return apiClient.listUsers();
}

export async function getUserById(id: string): Promise<User | undefined> {
  return apiClient.getUserById(id);
}

// ----- Candidate Evaluation -----

export async function getCandidateEvaluationView(candidateId: string): Promise<CandidateEvaluationView | undefined> {
  return apiClient.getCandidateEvaluation(candidateId);
}

// ----- Reviewer Reports -----

/**
 * Get existing report or create a new empty one for the reviewer
 */
export async function getOrCreateReviewerReport(
  candidateId: string,
  userId: string,
  role: CandidateReportRole,
  scorecardCriteria: ScorecardCriterion[]
): Promise<CandidateReport> {
  // Check if report already exists
  const existingReport = await apiClient.getReportByCandidateAndRole(candidateId, userId, role);
  
  if (existingReport) {
    return existingReport;
  }

  // Create new report with empty scores for all criteria
  const criterionScores: CriterionScore[] = scorecardCriteria.map(criterion => ({
    criterionId: criterion.id,
    score: 0,
    comment: '',
  }));

  return apiClient.createReport({
    candidateId,
    authorUserId: userId,
    role,
    criterionScores,
  });
}

/**
 * Update a reviewer report. finalScore is recomputed from weighted criterion scores.
 */
export async function updateReviewerReport(
  reportId: string,
  payload: ReportUpdatePayload
): Promise<CandidateReport> {
  return apiClient.updateReport(reportId, payload);
}

/**
 * Update a final report. finalScore is recomputed from weighted criterion scores.
 */
export async function updateFinalReport(
  reportId: string,
  payload: ReportUpdatePayload
): Promise<CandidateReport> {
  return apiClient.updateReport(reportId, payload);
}

/**
 * Compute the weighted final score from criterion scores
 */
export function computeFinalScore(
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
 * Generate or update the FINAL report by merging reviewer reports.
 * FINAL report is derived data, not the source of truth.
 */
export async function generateFinalReport(
  candidateId: string,
  authorUserId: string
): Promise<CandidateReport> {
  // Import merge utilities
  const { generateMergedReportData } = await import('@/lib/utils/reportMerge');
  
  // Get candidate evaluation data
  const evalData = await getCandidateEvaluationView(candidateId);
  
  if (!evalData) {
    throw new Error(`Candidate ${candidateId} not found`);
  }

  const { reports, scorecardCriteria } = evalData;
  
  // Get reviewer reports
  const primaryReport = reports.find(r => r.role === 'PRIMARY_REVIEWER');
  const secondaryReport = reports.find(r => r.role === 'SECONDARY_REVIEWER');
  
  if (!primaryReport && !secondaryReport) {
    throw new Error('At least one reviewer report is required to generate FINAL report');
  }

  // Generate merged data
  const mergedData = generateMergedReportData(
    primaryReport,
    secondaryReport,
    scorecardCriteria
  );

  // Upsert FINAL report
  return apiClient.upsertFinalReport({
    candidateId,
    authorUserId,
    ...mergedData,
  });
}
