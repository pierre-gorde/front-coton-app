import type { User, Client, CheckMission, Candidate, DashboardStats } from '../types';

export const mockUsers: User[] = [
  {
    id: 'usr_001',
    name: 'Marie Dupont',
    email: 'admin@coton.io',
    roles: ['ADMIN'],
  },
  {
    id: 'usr_002',
    name: 'Thomas Martin',
    email: 'freelance@coton.io',
    roles: ['FREELANCE'],
  },
  {
    id: 'usr_003',
    name: 'Jean Bernard',
    email: 'jean.bernard@email.com',
    roles: ['CANDIDAT'],
  },
  {
    id: 'usr_004',
    name: 'Sophie Laurent',
    email: 'sophie.laurent@email.com',
    roles: ['CANDIDAT'],
  },
  {
    id: 'usr_005',
    name: 'Pierre Durand',
    email: 'pierre.durand@email.com',
    roles: ['CANDIDAT'],
  },
  {
    id: 'usr_006',
    name: 'Claire Moreau',
    email: 'contact@techcorp.fr',
    roles: ['CLIENT'],
  },
];

export const mockClients: Client[] = [
  {
    id: 'cli_001',
    name: 'TechCorp France',
    organizationName: 'TechCorp SAS',
    contactEmail: 'rh@techcorp.fr',
    notes: 'Client premium - Tech / SaaS',
  },
  {
    id: 'cli_002',
    name: 'FinanceUp',
    organizationName: 'FinanceUp SA',
    contactEmail: 'recrutement@financeup.com',
    notes: 'Finance / Banque',
  },
  {
    id: 'cli_003',
    name: 'GreenEnergy Solutions',
    contactEmail: 'hr@greenenergy.eu',
    notes: 'Énergie / Environnement',
  },
  {
    id: 'cli_004',
    name: 'Retail Plus',
    organizationName: 'Retail Plus SARL',
    contactEmail: 'jobs@retailplus.fr',
    notes: 'Commerce / Retail',
  },
];

export const mockMissions: CheckMission[] = [
  {
    id: 'mis_001',
    title: 'Développeur Full Stack Senior',
    reference: 'CHK-2024-001',
    clientId: 'cli_001',
    status: 'OPEN',
    assignedReviewerIds: ['usr_002'],
    candidateIds: ['cand_001', 'cand_002'],
    createdAt: '2024-05-28T14:00:00Z',
    updatedAt: '2024-06-10T10:00:00Z',
  },
  {
    id: 'mis_002',
    title: 'Product Manager',
    reference: 'CHK-2024-002',
    clientId: 'cli_001',
    status: 'OPEN',
    assignedReviewerIds: ['usr_002'],
    candidateIds: ['cand_003'],
    createdAt: '2024-06-01T11:00:00Z',
    updatedAt: '2024-06-08T15:00:00Z',
  },
  {
    id: 'mis_003',
    title: 'Data Analyst',
    reference: 'CHK-2024-003',
    clientId: 'cli_002',
    status: 'OPEN',
    assignedReviewerIds: [],
    candidateIds: ['cand_004'],
    createdAt: '2024-05-15T09:00:00Z',
    updatedAt: '2024-06-05T11:00:00Z',
  },
  {
    id: 'mis_004',
    title: 'UX Designer',
    reference: 'CHK-2024-004',
    clientId: 'cli_003',
    status: 'DRAFT',
    assignedReviewerIds: [],
    candidateIds: [],
    createdAt: '2024-05-05T16:00:00Z',
    updatedAt: '2024-05-25T10:00:00Z',
  },
  {
    id: 'mis_005',
    title: 'Chef de Projet Digital',
    reference: 'CHK-2024-005',
    clientId: 'cli_004',
    status: 'DRAFT',
    assignedReviewerIds: [],
    candidateIds: [],
    createdAt: '2024-06-08T10:00:00Z',
    updatedAt: '2024-06-08T10:00:00Z',
  },
  {
    id: 'mis_006',
    title: 'DevOps Engineer',
    reference: 'CHK-2024-006',
    clientId: 'cli_001',
    status: 'CLOSED',
    assignedReviewerIds: ['usr_002'],
    candidateIds: [],
    createdAt: '2024-03-25T14:00:00Z',
    updatedAt: '2024-05-15T18:00:00Z',
  },
];

export const mockCandidates: Candidate[] = [
  {
    id: 'cand_001',
    checkMissionId: 'mis_001',
    userId: 'usr_003',
    status: 'INTERVIEW',
    githubUsername: 'jeanbernard-dev',
    notes: 'Bon profil technique, entretien prévu.',
  },
  {
    id: 'cand_002',
    checkMissionId: 'mis_001',
    userId: 'usr_004',
    status: 'SCREENING',
    githubUsername: 'sophielaurent',
  },
  {
    id: 'cand_003',
    checkMissionId: 'mis_002',
    userId: 'usr_005',
    status: 'NEW',
  },
  {
    id: 'cand_004',
    checkMissionId: 'mis_003',
    userId: 'usr_003',
    status: 'OFFER',
    githubUsername: 'jeanbernard-dev',
    notes: 'Excellent candidat, offre envoyée.',
  },
];

export const mockStats: DashboardStats = {
  totalMissions: mockMissions.length,
  activeMissions: mockMissions.filter(m => m.status === 'OPEN').length,
  totalCandidates: mockCandidates.length,
  hiredThisMonth: 2,
  clientsCount: mockClients.length,
};
