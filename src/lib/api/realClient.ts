/**
 * Real API Client Implementation
 * Implements CheckAdminApi interface with actual HTTP calls to backend
 * Following CLAUDE.md patterns: contract-first design, proper error handling
 */

import type {
  Candidate,
  CandidateEvaluationView,
  CandidateReport,
  CandidateReportRole,
  CheckMission,
  Client,
  Scorecard,
  User,
} from '@/lib/types';
import type { CheckAdminApi, ReportUpdatePayload } from './contracts';

import { api } from './client';

/**
 * Real API Client - makes actual HTTP calls to backend
 * Pure HTTP layer - NO business logic here
 */
export class RealCheckAdminClient implements CheckAdminApi {
  // ----- Clients -----

  async listClients(): Promise<Client[]> {
    return api.get<Client[]>('/admin/clients');
  }

  async getClientById(id: string): Promise<Client | undefined> {
    try {
      if(!id) return undefined;
      
      return await api.get<Client>(`/admin/clients/${id}`);
    } catch (error) {
      // 404 returns undefined instead of throwing
      if (error instanceof Error && error.message.includes('404')) {
        return undefined;
      }
      throw error;
    }
  }

  async createClient(input: Omit<Client, 'id'>): Promise<Client> {
    return api.post<Client>('/admin/clients', input);
  }

  async updateClient(id: string, input: Partial<Omit<Client, 'id'>>): Promise<Client> {
    return api.patch<Client>(`/admin/clients/${id}`, input);
  }

  async deleteClient(id: string): Promise<void> {
    return api.delete<void>(`/admin/clients/${id}`);
  }

  // ----- Check Missions -----

  async listCheckMissions(): Promise<CheckMission[]> {
    return api.get<CheckMission[]>('/admin/missions');
  }

  async getCheckMissionById(id: string): Promise<CheckMission | undefined> {
    try {
      return await api.get<CheckMission>(`/admin/missions/${id}`);
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
        return undefined;
      }
      throw error;
    }
  }

  async createCheckMission(input: {
    title?: string;
    clientId?: string;
  }): Promise<CheckMission> {
    return api.post<CheckMission>('/admin/missions', input);
  }

  async updateCheckMission(
    id: string,
    input: Partial<Omit<CheckMission, 'id'>>
  ): Promise<CheckMission> {
    return api.patch<CheckMission>(`/admin/missions/${id}`, input);
  }

  async deleteCheckMission(id: string): Promise<void> {
    return api.delete<void>(`/admin/missions/${id}`);
  }

  // ----- Scorecard -----

  async upsertScorecard(
    missionId: string,
    scorecard: Scorecard
  ): Promise<CheckMission> {
    return api.post<CheckMission>(`/admin/missions/${missionId}/scorecard`, scorecard);
  }

  // ----- Users -----

  async listUsers(): Promise<User[]> {
    return api.get<User[]>('/admin/users');
  }

  async getUserById(id: string): Promise<User | undefined> {
    try {
      return await api.get<User>(`/admin/users/${id}`);
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
        return undefined;
      }
      throw error;
    }
  }

  // ----- Candidates -----

  async listCandidatesByMission(checkMissionId: string): Promise<Candidate[]> {
    return api.get<Candidate[]>('/admin/candidates', {
      params: { missionId: checkMissionId },
    });
  }

  async getCandidateById(id: string): Promise<Candidate | undefined> {
    try {
      return await api.get<Candidate>(`/admin/candidates/${id}`);
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
        return undefined;
      }
      throw error;
    }
  }

  async createCandidate(input: {
    user: { firstName: string; lastName: string; email: string; githubUsername?: string | null; };
    checkMissionId: string;
  }): Promise<Candidate> {
    return api.post<Candidate>('/admin/candidates', input);
  }

  async updateCandidate(
    id: string,
    input: Partial<Omit<Candidate, 'id' | 'userId' | 'checkMissionId'>>
  ): Promise<Candidate> {
    return api.patch<Candidate>(`/admin/candidates/${id}`, input);
  }

  async deleteCandidate(id: string): Promise<void> {
    return api.delete<void>(`/admin/candidates/${id}`);
  }

  // ----- Candidate Evaluation -----

  async getCandidateEvaluation(candidateId: string): Promise<CandidateEvaluationView | undefined> {
    try {
      return await api.get<CandidateEvaluationView>(
        `/admin/candidates/${candidateId}/evaluation-view`
      );
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
        return undefined;
      }
      throw error;
    }
  }

  // ----- Candidate Reports -----

  async getReportByCandidateAndRole(
    candidateId: string,
    authorUserId: string,
    role: CandidateReportRole
  ): Promise<CandidateReport | undefined> {
    try {
      const reports = await api.get<CandidateReport[]>('/admin/reports', {
        params: { candidateId, authorUserId, role },
      });
      return reports[0]; // Backend should return single report or empty array
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
        return undefined;
      }
      throw error;
    }
  }

  async getReportsByCandidate(candidateId: string): Promise<CandidateReport[]> {
    return api.get<CandidateReport[]>('/admin/reports', {
      params: { candidateId },
    });
  }

  async getReportById(reportId: string): Promise<CandidateReport | undefined> {
    try {
      return await api.get<CandidateReport>(`/admin/reports/${reportId}`);
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
        return undefined;
      }
      throw error;
    }
  }

  async createReport(input: {
    candidateId: string;
    authorUserId: string;
    role: CandidateReportRole | 'FINAL';
    criterionScores: Array<{ criterionId: string; score: number; comment?: string }>;
    summary?: string;
    positivePoints?: string;
    negativePoints?: string;
    remarks?: string;
    prReviewComments?: Array<{
      id: number;
      body: string;
      path: string;
      line: number;
      createdAt: string;
      prNumber: number;
      prTitle: string;
      prUrl: string;
      code?: string;
    }>;
  }): Promise<CandidateReport> {
    return api.post<CandidateReport>('/admin/reports', input);
  }

  async updateReport(
    id: string,
    input: ReportUpdatePayload
  ): Promise<CandidateReport> {
    return api.patch<CandidateReport>(`/admin/reports/${id}`, input);
  }

  async upsertFinalReport(input: {
    candidateId: string;
    authorUserId: string;
    criterionScores: Array<{ criterionId: string; score: number; comment?: string }>;
    finalScore: number;
    summary: string;
    positivePoints: string;
    negativePoints: string;
    remarks: string;
  }): Promise<CandidateReport> {
    // Check if final report exists
    try {
      const existingReports = await api.get<CandidateReport[]>('/admin/reports', {
        params: { candidateId: input.candidateId, role: 'FINAL' },
      });

      if (existingReports.length > 0) {
        // Update existing final report
        const reportId = existingReports[0].id;
        return this.updateReport(reportId, {
          criterionScores: input.criterionScores,
          summary: input.summary,
          positivePoints: input.positivePoints,
          negativePoints: input.negativePoints,
          remarks: input.remarks,
        });
      }
    } catch (error) {
      // If error fetching, proceed to create
      console.warn('Could not check for existing final report, creating new one');
    }

    // Create new final report
    return this.createReport({
      candidateId: input.candidateId,
      authorUserId: input.authorUserId,
      role: 'FINAL',
      criterionScores: input.criterionScores,
      summary: input.summary,
      positivePoints: input.positivePoints,
      negativePoints: input.negativePoints,
      remarks: input.remarks,
    });
  }
}

export const realCheckAdminClient = new RealCheckAdminClient();
