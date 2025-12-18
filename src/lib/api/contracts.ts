// ===========================================
// COTON Check > ADMIN - API Contracts
// ===========================================

import type { Candidate, CandidateEvaluationView, CandidateReport, CandidateReportRole, CheckMission, Client, CriterionScore, PRReviewComment, Scorecard, User } from '@/lib/types';

/**
 * Payload for creating/updating a reviewer report
 */
export interface ReportUpdatePayload {
  criterionScores?: CriterionScore[];
  summary?: string;
  positives?: string;
  negatives?: string;
  remarks?: string;
  prReviewComments?: PRReviewComment[];
  isValidated?: boolean;
}

/**
 * API contract interface for COTON Check > ADMIN domain.
 * All methods are async and return Promises.
 * This interface defines the shape of all API calls - no implementation here.
 */
export interface CheckAdminApi {
  // ----- Clients -----

  listClients(): Promise<Client[]>;

  getClientById(id: string): Promise<Client | undefined>;

  createClient(input: Omit<Client, 'id'>): Promise<Client>;

  updateClient(id: string, input: Partial<Omit<Client, 'id'>>): Promise<Client>;

  deleteClient(id: string): Promise<void>;

  // ----- Check Missions -----

  listCheckMissions(): Promise<CheckMission[]>;

  getCheckMissionById(id: string): Promise<CheckMission | undefined>;

  createCheckMission(input: {
    title?: string;
    clientId?: string;
  }): Promise<CheckMission>;

  updateCheckMission(
    id: string,
    input: Partial<Omit<CheckMission, 'id'>>
  ): Promise<CheckMission>;

  deleteCheckMission(id: string): Promise<void>;

  // ----- Scorecard -----

  upsertScorecard(
    missionId: string,
    scorecard: Scorecard
  ): Promise<CheckMission>;

  // ----- Users -----

  listUsers(): Promise<User[]>;

  getUserById(id: string): Promise<User | undefined>;

  // ----- Candidates -----

  listCandidatesByMission(checkMissionId: string): Promise<Candidate[]>;

  getCandidateById(id: string): Promise<Candidate | undefined>;

  createCandidate(input: {
    user: {
      firstName: string;
      lastName?: string | null;
      email: string;
      githubUsername?: string | null;
    };
    checkMissionId: string;
  }): Promise<Candidate>;

  updateCandidate(
    id: string,
    input: Partial<Omit<Candidate, 'id' | 'userId' | 'checkMissionId'>>
  ): Promise<Candidate>;

  deleteCandidate(id: string): Promise<void>;

  // ----- Candidate Evaluation -----

  getCandidateEvaluation(candidateId: string): Promise<CandidateEvaluationView | undefined>;

  // ----- Candidate Reports -----

  getReportByCandidateAndRole(
    candidateId: string,
    authorUserId: string,
    role: CandidateReportRole
  ): Promise<CandidateReport | undefined>;

  getReportsByCandidate(candidateId: string): Promise<CandidateReport[]>;

  getReportById(reportId: string): Promise<CandidateReport | undefined>;

  createReport(input: {
    candidateId: string;
    authorUserId: string;
    role: CandidateReportRole;
    criterionScores: CriterionScore[];
  }): Promise<CandidateReport>;

  updateReport(reportId: string, payload: ReportUpdatePayload): Promise<CandidateReport>;

  upsertFinalReport(input: {
    candidateId: string;
    authorUserId: string;
    criterionScores: CriterionScore[];
    finalScore: number;
    summary: string;
    positives: string;
    negatives: string;
    remarks: string;
  }): Promise<CandidateReport>;
}
