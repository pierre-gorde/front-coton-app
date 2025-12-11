// ===========================================
// COTON Check > ADMIN - Mock API Implementation
// ===========================================

import type { User, Client, CheckMission, Candidate } from '@/lib/types';
import type { CheckAdminApi } from './contracts';

// Simulate network delay
const delay = (ms: number = 200) => new Promise(resolve => setTimeout(resolve, ms));

// ID generators
let userIdCounter = 10;
let clientIdCounter = 10;
let missionIdCounter = 10;
let candidateIdCounter = 10;

const generateUserId = () => `usr_${String(++userIdCounter).padStart(3, '0')}`;
const generateClientId = () => `cli_${String(++clientIdCounter).padStart(3, '0')}`;
const generateMissionId = () => `mis_${String(++missionIdCounter).padStart(3, '0')}`;
const generateCandidateId = () => `cand_${String(++candidateIdCounter).padStart(3, '0')}`;

// ===========================================
// IN-MEMORY DATA STORES
// ===========================================

const users: User[] = [
  {
    id: 'usr_001',
    name: 'Alice Martin',
    email: 'alice.martin@coton.dev',
    roles: ['ADMIN'],
  },
  {
    id: 'usr_002',
    name: 'Bob Dupont',
    email: 'bob.dupont@coton.dev',
    roles: ['FREELANCE'],
  },
  {
    id: 'usr_003',
    name: 'Claire Bernard',
    email: 'claire.bernard@coton.dev',
    roles: ['FREELANCE', 'ADMIN'],
  },
  {
    id: 'usr_004',
    name: 'David Leroy',
    email: 'david.leroy@techcorp.com',
    roles: ['CLIENT'],
  },
  {
    id: 'usr_005',
    name: 'Emma Petit',
    email: 'emma.petit@gmail.com',
    roles: ['CANDIDAT'],
  },
  {
    id: 'usr_006',
    name: 'François Moreau',
    email: 'francois.moreau@gmail.com',
    roles: ['CANDIDAT'],
  },
  {
    id: 'usr_007',
    name: 'Gabrielle Simon',
    email: 'gabrielle.simon@outlook.com',
    roles: ['CANDIDAT'],
  },
];

const clients: Client[] = [
  {
    id: 'cli_001',
    name: 'David Leroy',
    organizationName: 'TechCorp Solutions',
    contactEmail: 'david.leroy@techcorp.com',
    notes: 'Client premium depuis 2022',
  },
  {
    id: 'cli_002',
    name: 'Sophie Durand',
    organizationName: 'StartUp Factory',
    contactEmail: 'sophie.durand@startupfactory.io',
    notes: 'Recherche régulière de profils React/Node',
  },
  {
    id: 'cli_003',
    name: 'Marc Fontaine',
    organizationName: 'Digital Agency Plus',
    contactEmail: 'marc.fontaine@digitalagency.fr',
  },
];

const checkMissions: CheckMission[] = [
  {
    id: 'mis_001',
    title: 'Développeur React Senior',
    reference: 'CHECK-2024-001',
    clientId: 'cli_001',
    status: 'OPEN',
    assignedReviewerIds: ['usr_002', 'usr_003'],
    candidateIds: ['cand_001', 'cand_002'],
    technicalTestDetail: {
      domainRatios: [
        {
          domainName: 'Frontend',
          percentage: 60,
          level: 'SENIOR',
          expertiseRatios: [
            { name: 'React', percentage: 40, level: 'SENIOR' },
            { name: 'TypeScript', percentage: 35, level: 'CONFIRMÉ' },
            { name: 'CSS/Tailwind', percentage: 25, level: 'CONFIRMÉ' },
          ],
        },
        {
          domainName: 'Backend',
          percentage: 25,
          level: 'CONFIRMÉ',
          expertiseRatios: [
            { name: 'Node.js', percentage: 60, level: 'CONFIRMÉ' },
            { name: 'PostgreSQL', percentage: 40, level: 'JUNIOR' },
          ],
        },
        {
          domainName: 'DevOps',
          percentage: 15,
          level: 'JUNIOR',
          expertiseRatios: [
            { name: 'Docker', percentage: 70, level: 'JUNIOR' },
            { name: 'CI/CD', percentage: 30, level: 'JUNIOR' },
          ],
        },
      ],
      scoreCard: {
        primaryEvaluations: [
          { stackName: 'React', percentage: 40, level: 'SENIOR' },
          { stackName: 'TypeScript', percentage: 35, level: 'CONFIRMÉ' },
          { stackName: 'Node.js', percentage: 25, level: 'CONFIRMÉ' },
        ],
        secondaryEvaluations: [
          { stackName: 'Testing', percentage: 30, level: 'CONFIRMÉ' },
          { stackName: 'Git', percentage: 40, level: 'SENIOR' },
          { stackName: 'Architecture', percentage: 30, level: 'CONFIRMÉ' },
        ],
      },
    },
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-20T14:30:00Z',
  },
  {
    id: 'mis_002',
    title: 'Lead Backend Node.js',
    reference: 'CHECK-2024-002',
    clientId: 'cli_002',
    status: 'OPEN',
    assignedReviewerIds: ['usr_003'],
    candidateIds: ['cand_003'],
    technicalTestDetail: {
      domainRatios: [
        {
          domainName: 'Backend',
          percentage: 70,
          level: 'EXPERT',
          expertiseRatios: [
            { name: 'Node.js', percentage: 50, level: 'EXPERT' },
            { name: 'PostgreSQL', percentage: 30, level: 'SENIOR' },
            { name: 'Redis', percentage: 20, level: 'CONFIRMÉ' },
          ],
        },
        {
          domainName: 'Architecture',
          percentage: 30,
          level: 'SENIOR',
          expertiseRatios: [
            { name: 'Microservices', percentage: 60, level: 'SENIOR' },
            { name: 'API Design', percentage: 40, level: 'SENIOR' },
          ],
        },
      ],
    },
    createdAt: '2024-01-18T09:00:00Z',
    updatedAt: '2024-01-22T11:00:00Z',
  },
  {
    id: 'mis_003',
    title: 'Fullstack TypeScript',
    reference: 'CHECK-2024-003',
    clientId: 'cli_001',
    status: 'DRAFT',
    assignedReviewerIds: [],
    candidateIds: [],
    createdAt: '2024-01-25T08:00:00Z',
    updatedAt: '2024-01-25T08:00:00Z',
  },
  {
    id: 'mis_004',
    title: 'DevOps Engineer',
    reference: 'CHECK-2023-015',
    clientId: 'cli_003',
    status: 'CLOSED',
    assignedReviewerIds: ['usr_002'],
    candidateIds: [],
    createdAt: '2023-12-01T10:00:00Z',
    updatedAt: '2024-01-10T16:00:00Z',
  },
  {
    id: 'mis_005',
    title: 'Product Designer UX/UI',
    reference: 'CHECK-2024-004',
    clientId: 'cli_002',
    status: 'OPEN',
    assignedReviewerIds: ['usr_002', 'usr_003'],
    candidateIds: [],
    createdAt: '2024-01-28T14:00:00Z',
    updatedAt: '2024-01-28T14:00:00Z',
  },
];

const candidates: Candidate[] = [
  {
    id: 'cand_001',
    userId: 'usr_005',
    checkMissionId: 'mis_001',
    status: 'EN_COURS',
    githubUsername: 'emmapetit',
    notes: 'Profil très intéressant, 5 ans XP React',
  },
  {
    id: 'cand_002',
    userId: 'usr_006',
    checkMissionId: 'mis_001',
    status: 'EN_ATTENTE',
    githubUsername: 'fmoreau-dev',
    notes: 'À évaluer',
  },
  {
    id: 'cand_003',
    userId: 'usr_007',
    checkMissionId: 'mis_002',
    status: 'VALIDÉ',
    githubUsername: 'gabriellesimon',
    notes: 'Excellente candidate, recommandée',
  },
];

// ===========================================
// MOCK API IMPLEMENTATION
// ===========================================

export const mockCheckAdminApi: CheckAdminApi = {
  // ----- Clients -----

  async listClients(): Promise<Client[]> {
    await delay();
    return [...clients];
  },

  async getClientById(id: string): Promise<Client | undefined> {
    await delay();
    return clients.find(c => c.id === id);
  },

  async createClient(input: Omit<Client, 'id'>): Promise<Client> {
    await delay();
    const newClient: Client = {
      id: generateClientId(),
      ...input,
    };
    clients.push(newClient);
    return newClient;
  },

  async updateClient(id: string, input: Partial<Omit<Client, 'id'>>): Promise<Client> {
    await delay();
    const index = clients.findIndex(c => c.id === id);
    if (index === -1) {
      throw new Error(`Client with id ${id} not found`);
    }
    clients[index] = { ...clients[index], ...input };
    return clients[index];
  },

  async deleteClient(id: string): Promise<void> {
    await delay();
    const index = clients.findIndex(c => c.id === id);
    if (index === -1) {
      throw new Error(`Client with id ${id} not found`);
    }
    clients.splice(index, 1);
  },

  // ----- Check Missions -----

  async listCheckMissions(): Promise<CheckMission[]> {
    await delay();
    return [...checkMissions];
  },

  async getCheckMissionById(id: string): Promise<CheckMission | undefined> {
    await delay();
    return checkMissions.find(m => m.id === id);
  },

  async createCheckMission(input: {
    title: string;
    reference: string;
    clientId: string;
  }): Promise<CheckMission> {
    await delay();
    const now = new Date().toISOString();
    const newMission: CheckMission = {
      id: generateMissionId(),
      title: input.title,
      reference: input.reference,
      clientId: input.clientId,
      status: 'DRAFT',
      assignedReviewerIds: [],
      candidateIds: [],
      createdAt: now,
      updatedAt: now,
    };
    checkMissions.push(newMission);
    return newMission;
  },

  async updateCheckMission(
    id: string,
    input: Partial<Omit<CheckMission, 'id'>>
  ): Promise<CheckMission> {
    await delay();
    const index = checkMissions.findIndex(m => m.id === id);
    if (index === -1) {
      throw new Error(`CheckMission with id ${id} not found`);
    }
    checkMissions[index] = {
      ...checkMissions[index],
      ...input,
      updatedAt: new Date().toISOString(),
    };
    return checkMissions[index];
  },

  async deleteCheckMission(id: string): Promise<void> {
    await delay();
    const index = checkMissions.findIndex(m => m.id === id);
    if (index === -1) {
      throw new Error(`CheckMission with id ${id} not found`);
    }
    checkMissions.splice(index, 1);
  },

  // ----- Users -----

  async listUsers(): Promise<User[]> {
    await delay();
    return [...users];
  },

  async getUserById(id: string): Promise<User | undefined> {
    await delay();
    return users.find(u => u.id === id);
  },

  // ----- Candidates -----

  async listCandidatesByMission(checkMissionId: string): Promise<Candidate[]> {
    await delay();
    return candidates.filter(c => c.checkMissionId === checkMissionId);
  },

  async getCandidateById(id: string): Promise<Candidate | undefined> {
    await delay();
    return candidates.find(c => c.id === id);
  },

  async createCandidate(input: {
    user: { name: string; email: string };
    checkMissionId: string;
    githubUsername?: string;
    notes?: string;
  }): Promise<Candidate> {
    await delay();
    
    // Create user first
    const newUser: User = {
      id: generateUserId(),
      name: input.user.name,
      email: input.user.email,
      roles: ['CANDIDAT'],
    };
    users.push(newUser);

    // Create candidate
    const newCandidate: Candidate = {
      id: generateCandidateId(),
      userId: newUser.id,
      checkMissionId: input.checkMissionId,
      status: 'EN_ATTENTE',
      githubUsername: input.githubUsername,
      notes: input.notes,
    };
    candidates.push(newCandidate);

    // Update mission's candidateIds
    const mission = checkMissions.find(m => m.id === input.checkMissionId);
    if (mission) {
      mission.candidateIds.push(newCandidate.id);
      mission.updatedAt = new Date().toISOString();
    }

    return newCandidate;
  },

  async updateCandidate(
    id: string,
    input: Partial<Omit<Candidate, 'id' | 'userId' | 'checkMissionId'>>
  ): Promise<Candidate> {
    await delay();
    const index = candidates.findIndex(c => c.id === id);
    if (index === -1) {
      throw new Error(`Candidate with id ${id} not found`);
    }
    candidates[index] = { ...candidates[index], ...input };
    return candidates[index];
  },

  async deleteCandidate(id: string): Promise<void> {
    await delay();
    const index = candidates.findIndex(c => c.id === id);
    if (index === -1) {
      throw new Error(`Candidate with id ${id} not found`);
    }

    const candidate = candidates[index];

    // Remove from mission's candidateIds
    const mission = checkMissions.find(m => m.id === candidate.checkMissionId);
    if (mission) {
      mission.candidateIds = mission.candidateIds.filter(cId => cId !== id);
      mission.updatedAt = new Date().toISOString();
    }

    candidates.splice(index, 1);
  },

  // ----- Candidate Evaluation -----

  async getCandidateEvaluation(): Promise<undefined> {
    await delay();
    // TODO: implement mock data for candidate evaluation
    return undefined;
  },
};
