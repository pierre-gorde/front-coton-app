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

export async function getUsersByRole(role: User['roles'][number]): Promise<User[]> {
  await delay();
  return mockUsers.filter(u => u.roles.includes(role));
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
  return [...mockMissions];
}

export async function getMissionById(id: string): Promise<CheckMission | undefined> {
  await delay();
  return mockMissions.find(m => m.id === id);
}

export async function getMissionsByStatus(status: CheckMission['status']): Promise<CheckMission[]> {
  await delay();
  return mockMissions.filter(m => m.status === status);
}

// ============ CANDIDATES ============
export async function getCandidates(): Promise<Candidate[]> {
  await delay();
  return [...mockCandidates];
}

export async function getCandidateById(id: string): Promise<Candidate | undefined> {
  await delay();
  return mockCandidates.find(c => c.id === id);
}

export async function getCandidatesByMission(checkMissionId: string): Promise<Candidate[]> {
  await delay();
  return mockCandidates.filter(c => c.checkMissionId === checkMissionId);
}

// ============ STATS ============
export async function getDashboardStats(): Promise<DashboardStats> {
  await delay();
  return { ...mockStats };
}
