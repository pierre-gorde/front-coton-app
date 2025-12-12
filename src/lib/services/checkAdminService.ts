// ===========================================
// COTON Check > ADMIN - Service Layer
// ===========================================

import { mockCheckAdminApi } from '@/lib/api/mockClient';
import type { CheckMission, Client, User, Candidate, CandidateEvaluationView, CandidateReport, CandidateReportRole, CriterionScore, ScorecardCriterion } from '@/lib/types';
import type { ReportUpdatePayload } from '@/lib/api/contracts';

// ----- Types for enriched data -----

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
    mockCheckAdminApi.listCheckMissions(),
    mockCheckAdminApi.listClients(),
  ]);

  return missions.map(mission => ({
    ...mission,
    client: clients.find(c => c.id === mission.clientId),
  }));
}

export async function getCheckMissionDetail(checkId: string): Promise<CheckMissionDetail | null> {
  const mission = await mockCheckAdminApi.getCheckMissionById(checkId);
  
  if (!mission) {
    return null;
  }

  const [client, users, missionCandidates] = await Promise.all([
    mockCheckAdminApi.getClientById(mission.clientId),
    mockCheckAdminApi.listUsers(),
    mockCheckAdminApi.listCandidatesByMission(checkId),
  ]);

  const reviewers = users.filter(u => mission.assignedReviewerIds.includes(u.id));
  
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

// ----- Clients -----

export async function listClients(): Promise<Client[]> {
  return mockCheckAdminApi.listClients();
}

export async function getClientById(id: string): Promise<Client | undefined> {
  return mockCheckAdminApi.getClientById(id);
}

// ----- Candidates -----

export async function getCandidateById(id: string): Promise<CandidateWithUser | null> {
  const candidate = await mockCheckAdminApi.getCandidateById(id);
  
  if (!candidate) {
    return null;
  }

  const user = await mockCheckAdminApi.getUserById(candidate.userId);

  return {
    ...candidate,
    user,
  };
}

// ----- Users -----

export async function listUsers(): Promise<User[]> {
  return mockCheckAdminApi.listUsers();
}

export async function getUserById(id: string): Promise<User | undefined> {
  return mockCheckAdminApi.getUserById(id);
}

// ----- Candidate Evaluation -----

export async function getCandidateEvaluationView(candidateId: string): Promise<CandidateEvaluationView | undefined> {
  return mockCheckAdminApi.getCandidateEvaluation(candidateId);
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
  const existingReport = await mockCheckAdminApi.getReportByCandidateAndRole(candidateId, userId, role);
  
  if (existingReport) {
    return existingReport;
  }

  // Create new report with empty scores for all criteria
  const criterionScores: CriterionScore[] = scorecardCriteria.map(criterion => ({
    criterionId: criterion.id,
    score: 0,
    comment: '',
  }));

  return mockCheckAdminApi.createReport({
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
  return mockCheckAdminApi.updateReport(reportId, payload);
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
