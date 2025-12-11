import type { User, Client, CheckMission, Candidate, DashboardStats } from '../types';
import { mockUsers, mockClients, mockMissions, mockCandidates, mockStats } from './mockData';

// Simulate network delay
const delay = (ms: number = 300) => new Promise(resolve => setTimeout(resolve, ms));

// ============ USERS ============
export async function getUsers(): Promise<User[]> {
  await delay();
  return [...mockUsers];
}

export async function getUserById(id: string): Promise<User | undefined> {
  await delay();
  return mockUsers.find(u => u.id === id);
}

export async function getUsersByRole(role: User['role']): Promise<User[]> {
  await delay();
  return mockUsers.filter(u => u.role === role);
}

// ============ CLIENTS ============
export async function getClients(): Promise<Client[]> {
  await delay();
  return [...mockClients];
}

export async function getClientById(id: string): Promise<Client | undefined> {
  await delay();
  return mockClients.find(c => c.id === id);
}

// ============ MISSIONS ============
export async function getMissions(): Promise<CheckMission[]> {
  await delay();
  // Enrich missions with client data
  return mockMissions.map(mission => ({
    ...mission,
    client: mockClients.find(c => c.id === mission.clientId),
  }));
}

export async function getMissionById(id: string): Promise<CheckMission | undefined> {
  await delay();
  const mission = mockMissions.find(m => m.id === id);
  if (!mission) return undefined;
  return {
    ...mission,
    client: mockClients.find(c => c.id === mission.clientId),
  };
}

export async function getMissionsByStatus(status: CheckMission['status']): Promise<CheckMission[]> {
  await delay();
  return mockMissions
    .filter(m => m.status === status)
    .map(mission => ({
      ...mission,
      client: mockClients.find(c => c.id === mission.clientId),
    }));
}

// ============ CANDIDATES ============
export async function getCandidates(): Promise<Candidate[]> {
  await delay();
  return mockCandidates.map(candidate => ({
    ...candidate,
    user: mockUsers.find(u => u.id === candidate.userId),
  }));
}

export async function getCandidateById(id: string): Promise<Candidate | undefined> {
  await delay();
  const candidate = mockCandidates.find(c => c.id === id);
  if (!candidate) return undefined;
  return {
    ...candidate,
    user: mockUsers.find(u => u.id === candidate.userId),
  };
}

export async function getCandidatesByMission(missionId: string): Promise<Candidate[]> {
  await delay();
  return mockCandidates
    .filter(c => c.missionId === missionId)
    .map(candidate => ({
      ...candidate,
      user: mockUsers.find(u => u.id === candidate.userId),
    }));
}

// ============ STATS ============
export async function getDashboardStats(): Promise<DashboardStats> {
  await delay();
  return { ...mockStats };
}
