// ===========================================
// COTON Check > ADMIN - Service Layer
// ===========================================

import { mockCheckAdminApi } from '@/lib/api/mockClient';
import type { CheckMission, Client, User, Candidate, CandidateEvaluationView } from '@/lib/types';

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
