// User roles
export type UserRole = 'ADMIN' | 'FREELANCE' | 'CANDIDAT' | 'CLIENT';

// User type
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  avatar?: string;
  createdAt: string;
}

// Client (company)
export interface Client {
  id: string;
  name: string;
  logo?: string;
  industry: string;
  contactEmail: string;
  contactPhone?: string;
  address?: string;
  createdAt: string;
}

// Check Mission (job post)
export type MissionStatus = 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'CLOSED' | 'ARCHIVED';

export interface CheckMission {
  id: string;
  title: string;
  clientId: string;
  client?: Client;
  description: string;
  location: string;
  contractType: 'CDI' | 'CDD' | 'FREELANCE' | 'STAGE';
  salary?: {
    min: number;
    max: number;
    currency: string;
  };
  status: MissionStatus;
  candidatesCount: number;
  publishedAt?: string;
  closedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// Candidate attached to a mission
export type CandidateStatus = 
  | 'NEW' 
  | 'SCREENING' 
  | 'INTERVIEW' 
  | 'TECHNICAL' 
  | 'OFFER' 
  | 'HIRED' 
  | 'REJECTED';

export interface Candidate {
  id: string;
  missionId: string;
  userId: string;
  user?: User;
  status: CandidateStatus;
  appliedAt: string;
  notes?: string;
  rating?: number;
  updatedAt: string;
}

// Stats type for dashboard
export interface DashboardStats {
  totalMissions: number;
  activeMissions: number;
  totalCandidates: number;
  hiredThisMonth: number;
  clientsCount: number;
}
