// ===========================================
// COTON Dashboard - Core Types
// ===========================================

// ----- User Domain -----

export type UserRole = 'ADMIN' | 'FREELANCE' | 'CLIENT' | 'CANDIDAT';

export interface User {
  id: string;
  name: string;
  email: string;
  roles: UserRole[];
}

// ----- Client Domain -----

export interface Client {
  id: string;
  name: string;
  organizationName?: string;
  contactEmail: string;
  notes?: string;
}

// ----- COTON Check Domain -----

export type CheckMissionStatus = 'DRAFT' | 'OPEN' | 'CLOSED';

export type SkillLevel = 'JUNIOR' | 'CONFIRMÉ' | 'SENIOR' | 'EXPERT';

export interface ExpertiseRatio {
  name: string;
  percentage: number;
  level: SkillLevel;
}

export interface DomainRatio {
  domainName: string;
  percentage: number;
  level: SkillLevel;
  expertiseRatios: ExpertiseRatio[];
}

export interface StackEvaluation {
  stackName: string;
  percentage: number;
  level: SkillLevel;
}

export interface ScoreCard {
  primaryEvaluations: StackEvaluation[];
  secondaryEvaluations: StackEvaluation[];
}

export interface TechnicalTestDetail {
  domainRatios: DomainRatio[];
  scoreCard?: ScoreCard;
}

export interface CheckMission {
  id: string;
  title: string;
  reference: string;
  clientId: string;
  status: CheckMissionStatus;
  assignedReviewerIds: string[];
  candidateIds: string[];
  technicalTestDetail?: TechnicalTestDetail;
  createdAt: string;
  updatedAt: string;
}

export interface Candidate {
  id: string;
  userId: string;
  checkMissionId: string;
  status: string;
  githubUsername?: string;
  notes?: string;
}

// ----- Candidate Evaluation Domain -----

export type CandidateReportRole = 'PRIMARY_REVIEWER' | 'SECONDARY_REVIEWER' | 'FINAL';

export interface ScorecardCriterion {
  id: string;
  label: string;
  domainName: string;
  weightPercentage: number; // 0–100
}

export interface CriterionScore {
  criterionId: string;
  score: number; // 0–100
  comment?: string;
}

export interface CandidateReport {
  id: string;
  candidateId: string;
  authorUserId: string;
  role: CandidateReportRole;
  finalScore: number; // 0–100, weighted global score
  summary: string; // paragraph: avis global vs attentes
  positives: string; // rich text as string
  negatives: string; // rich text as string
  remarks: string; // rich text as string
  criterionScores: CriterionScore[];
  createdAt: string;
  updatedAt: string;
}

export interface CandidateEvaluationView {
  candidate: Candidate;
  candidateUser: User;
  mission: CheckMission;
  client: Client;
  reviewers: User[];
  scorecardCriteria: ScorecardCriterion[];
  reports: CandidateReport[];
}

// ----- Dashboard Stats -----

export interface DashboardStats {
  totalMissions: number;
  activeMissions: number;
  totalCandidates: number;
  hiredThisMonth: number;
  clientsCount: number;
}
