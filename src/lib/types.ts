// ===========================================
// COTON Dashboard - Core Types
// Based on Prisma Schema
// ===========================================

// ----- Enums -----

export enum RoleEnum {
  ADMIN = 'ADMIN',
  CLIENT = 'CLIENT',
  FREELANCE = 'FREELANCE',
  CANDIDAT = 'CANDIDAT',
}

export enum CheckMissionStatus {
  DRAFT = 'DRAFT',
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
}

export enum CandidateStatus {
  EN_COURS = 'EN_COURS',
  EN_ATTENTE = 'EN_ATTENTE',
  VALIDE = 'VALIDE',
  REFUSE = 'REFUSE',
}

export enum ReportRole {
  REVIEWER = 'REVIEWER',
  FINAL = 'FINAL',
}

// ----- User Domain -----

export interface User {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  githubUsername?: string | null;
  roles: UserRole[];
  createdAt: string;
  updatedAt: string;
  createdBy?: string | null;
  updatedBy?: string | null;
  archived?: boolean | null;
  checkMissionId?: string | null;
}

export interface Role {
  id: string;
  name: RoleEnum;
  createdAt: string;
  updatedAt: string;
  createdBy?: string | null;
  updatedBy?: string | null;
  archived: boolean;
}

export interface UserRole {
  id: string;
  userId: string;
  roleId: string;
  role: Role;
  createdAt: string;
}

export interface MagicLink {
  id: string;
  token: string;
  userId: string;
  expiresAt: string;
  createdAt: string;
  createdBy?: string | null;
  updatedAt: string;
  updatedBy?: string | null;
  archived?: boolean | null;
}

// ----- Client Domain -----

export interface Client {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string | null;
  updatedBy?: string | null;
  archived: boolean;
}

// ----- COTON Check Domain -----

export type SkillLevel = 'JUNIOR' | 'CONFIRMÉ' | 'SENIOR' | 'EXPERT';

export type ExpertiseLevel = 'JUNIOR' | 'INTERMEDIATE' | 'SENIOR' | 'EXPERT';

export type CriterionGroup = 'PRIMARY' | 'SECONDARY';

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

export interface ScorecardCriterion {
  id: string;
  label: string;
  group: CriterionGroup;
  weightPercentage: number;
  description?: string;
}

export interface ScorecardSuggestionRule {
  domainName: string;
  minLevel: ExpertiseLevel;
  criteria: Array<{
    label: string;
    group: CriterionGroup;
    weightPercentage: number;
  }>;
}

export interface Scorecard {
  id: string;
  checkMissionId: string;
  domainRatios: DomainRatio[];
  scorecardCriteria: ScorecardCriterion[];
  createdAt: string;
  updatedAt: string;
  createdBy?: string | null;
  updatedBy?: string | null;
  archived: boolean;
}

export interface CheckMission {
  id: string;
  title: string;
  clientId?: string | null;
  status: CheckMissionStatus;
  assignedReviewers?: User[];
  candidates?: Candidate[];
  scorecard?: Scorecard;
  createdAt: string;
  updatedAt: string;
  createdBy?: string | null;
  updatedBy?: string | null;
  archived: boolean;
}

export interface Candidate {
  id: string;
  userId: string;
  checkMissionId: string;
  status: CandidateStatus;
  githubUsername?: string | null;
  githubRepoUrl?: string | null;
  notes?: string | null;
  assignedReviewers?: User[]; // Reviewers assigned specifically to this candidate
  createdAt: string;
  updatedAt: string;
  createdBy?: string | null;
  updatedBy?: string | null;
  archived: boolean;
}

// ----- Candidate Evaluation Domain -----

export type CandidateReportRole = ReportRole;

export interface CriterionScore {
  criterionId: string;
  score: number; // 0–100
  comment?: string;
}

export interface PRReviewComment {
  id: number;
  body: string;
  path: string;
  line: number;
  createdAt: string;
  prNumber: number;
  prTitle: string;
  prUrl: string;
  code?: string; // The code snippet associated with the comment
}

export interface CandidateReport {
  id: string;
  candidateId: string;
  authorUserId: string;
  authorUser?: User; // Populated in some contexts
  role: CandidateReportRole;
  criterionScores: CriterionScore[];
  finalScore: number; // 0–100, weighted global score
  summary: string; // paragraph: avis global vs attentes
  positivePoints: string; // string of positive points
  negativePoints: string; // string of negative points
  remarks: string; // rich text as string
  prReviewComments?: string; // string of code review comments from GitHub PRs
  isValidated?: boolean; // Only for FINAL reports - marks as ready for PDF export
  createdAt: string;
  updatedAt: string;
  createdBy?: string | null;
  updatedBy?: string | null;
  archived: boolean;
}

export interface CandidateEvaluationView {
  candidate: Candidate & {
    user: User;
    checkMission: CheckMission & {
      client: Client;
    };
  };
  user: User;
  mission: CheckMission & {
    client: Client;
    scorecard: Scorecard | null;
    assignedReviewers: User[];
  };
  client: Client;
  assignedReviewers: User[];
  reports: CandidateReport[];
  scorecardCriteria: ScorecardCriterion[];
}

// ----- Dashboard Stats -----

export interface DashboardStats {
  totalMissions: number;
  activeMissions: number;
  totalCandidates: number;
  hiredThisMonth: number;
  clientsCount: number;
}
