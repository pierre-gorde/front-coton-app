// ===========================================
// COTON Check > ADMIN - API Contracts
// ===========================================

import type { Client, CheckMission, User, Candidate, CandidateEvaluationView, CandidateReport, CandidateReportRole, CriterionScore } from '@/lib/types';

/**
 * Payload for creating/updating a reviewer report
 */
export interface ReportUpdatePayload {
  criterionScores: CriterionScore[];
  summary: string;
  positives: string;
  negatives: string;
  remarks: string;
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
    title: string;
    reference: string;
    clientId: string;
  }): Promise<CheckMission>;

  updateCheckMission(
    id: string,
    input: Partial<Omit<CheckMission, 'id'>>
  ): Promise<CheckMission>;

  deleteCheckMission(id: string): Promise<void>;

  // ----- Users -----

  listUsers(): Promise<User[]>;

  getUserById(id: string): Promise<User | undefined>;

  // ----- Candidates -----

  listCandidatesByMission(checkMissionId: string): Promise<Candidate[]>;

  getCandidateById(id: string): Promise<Candidate | undefined>;

  createCandidate(input: {
    user: { name: string; email: string };
    checkMissionId: string;
    githubUsername?: string;
    notes?: string;
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

  createReport(input: {
    candidateId: string;
    authorUserId: string;
    role: CandidateReportRole;
    criterionScores: CriterionScore[];
  }): Promise<CandidateReport>;

  updateReport(reportId: string, payload: ReportUpdatePayload): Promise<CandidateReport>;
}
