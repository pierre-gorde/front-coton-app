// ===========================================
// COTON Check > ADMIN - Mock API Implementation
// ===========================================

import type { User, Client, CheckMission, Candidate, Scorecard, ScorecardCriterion, CandidateReport, CandidateEvaluationView, ScorecardSuggestionRule, DomainRatio, ExpertiseLevel, CriterionGroup, CandidateReportRole, CriterionScore } from '@/lib/types';
import type { CheckAdminApi, ReportUpdatePayload } from './contracts';

// Simulate network delay
const delay = (ms: number = 200) => new Promise(resolve => setTimeout(resolve, ms));

// ID generators
let userIdCounter = 10;
let clientIdCounter = 10;
let missionIdCounter = 10;
let candidateIdCounter = 10;
let reportIdCounter = 10;

const generateUserId = () => `usr_${String(++userIdCounter).padStart(3, '0')}`;
const generateClientId = () => `cli_${String(++clientIdCounter).padStart(3, '0')}`;
const generateMissionId = () => `mis_${String(++missionIdCounter).padStart(3, '0')}`;
const generateCandidateId = () => `cand_${String(++candidateIdCounter).padStart(3, '0')}`;
const generateReportId = () => `rep_${String(++reportIdCounter).padStart(3, '0')}`;
let criterionIdCounter = 200;
const generateCriterionId = () => `crit_${String(++criterionIdCounter).padStart(3, '0')}`;

// ===========================================
// SCORECARD SUGGESTION RULES
// ===========================================

const EXPERTISE_LEVEL_ORDER: Record<ExpertiseLevel, number> = {
  JUNIOR: 1,
  INTERMEDIATE: 2,
  SENIOR: 3,
  EXPERT: 4,
};

const scorecardSuggestionRules: ScorecardSuggestionRule[] = [
  // Frontend SENIOR+
  {
    domainName: 'Frontend',
    minLevel: 'SENIOR',
    criteria: [
      { label: 'Lisibilité du code', group: 'PRIMARY', weightPercentage: 25 },
      { label: 'Architecture frontend', group: 'PRIMARY', weightPercentage: 25 },
      { label: 'Sécurité frontend', group: 'PRIMARY', weightPercentage: 15 },
      { label: 'Performance', group: 'SECONDARY', weightPercentage: 15 },
      { label: 'Testing', group: 'SECONDARY', weightPercentage: 10 },
      { label: 'Git & Versioning', group: 'SECONDARY', weightPercentage: 10 },
    ],
  },
  // Frontend JUNIOR
  {
    domainName: 'Frontend',
    minLevel: 'JUNIOR',
    criteria: [
      { label: 'Lisibilité du code', group: 'PRIMARY', weightPercentage: 40 },
      { label: 'Git & Versioning', group: 'PRIMARY', weightPercentage: 30 },
      { label: 'Testing', group: 'SECONDARY', weightPercentage: 30 },
    ],
  },
  // Backend SENIOR+
  {
    domainName: 'Backend',
    minLevel: 'SENIOR',
    criteria: [
      { label: 'Architecture API', group: 'PRIMARY', weightPercentage: 25 },
      { label: 'Sécurité backend', group: 'PRIMARY', weightPercentage: 20 },
      { label: 'Base de données', group: 'PRIMARY', weightPercentage: 20 },
      { label: 'Performance serveur', group: 'SECONDARY', weightPercentage: 15 },
      { label: 'Testing backend', group: 'SECONDARY', weightPercentage: 10 },
      { label: 'Documentation', group: 'SECONDARY', weightPercentage: 10 },
    ],
  },
  // Backend JUNIOR
  {
    domainName: 'Backend',
    minLevel: 'JUNIOR',
    criteria: [
      { label: 'Lisibilité du code', group: 'PRIMARY', weightPercentage: 35 },
      { label: 'Base de données', group: 'PRIMARY', weightPercentage: 35 },
      { label: 'Testing backend', group: 'SECONDARY', weightPercentage: 30 },
    ],
  },
  // DevOps
  {
    domainName: 'DevOps',
    minLevel: 'JUNIOR',
    criteria: [
      { label: 'CI/CD', group: 'PRIMARY', weightPercentage: 40 },
      { label: 'Conteneurisation', group: 'PRIMARY', weightPercentage: 35 },
      { label: 'Monitoring', group: 'SECONDARY', weightPercentage: 25 },
    ],
  },
];

/**
 * Generate scorecardCriteria from domainRatios using suggestion rules.
 * Selects the best matching rule per domain (highest minLevel that still applies).
 * Normalizes weights to sum to 100.
 */
function generateScorecardCriteria(domainRatios: DomainRatio[]): ScorecardCriterion[] {
  const collectedCriteria: Array<{ label: string; group: CriterionGroup; weightPercentage: number }> = [];

  for (const domain of domainRatios) {
    // Map SkillLevel to ExpertiseLevel for comparison
    const domainLevel = domain.level === 'CONFIRMÉ' ? 'INTERMEDIATE' : domain.level as ExpertiseLevel;
    const domainLevelOrder = EXPERTISE_LEVEL_ORDER[domainLevel];

    // Find all matching rules for this domain
    const matchingRules = scorecardSuggestionRules.filter(
      rule => rule.domainName === domain.domainName && EXPERTISE_LEVEL_ORDER[rule.minLevel] <= domainLevelOrder
    );

    if (matchingRules.length === 0) continue;

    // Select the rule with the highest minLevel that still applies
    const bestRule = matchingRules.reduce((best, current) =>
      EXPERTISE_LEVEL_ORDER[current.minLevel] > EXPERTISE_LEVEL_ORDER[best.minLevel] ? current : best
    );

    // Scale criteria weights by domain percentage
    const scaleFactor = domain.percentage / 100;
    for (const criterion of bestRule.criteria) {
      collectedCriteria.push({
        label: criterion.label,
        group: criterion.group,
        weightPercentage: Math.round(criterion.weightPercentage * scaleFactor),
      });
    }
  }

  // Normalize weights to sum to 100
  const totalWeight = collectedCriteria.reduce((sum, c) => sum + c.weightPercentage, 0);
  const normalizedCriteria = collectedCriteria.map(c => ({
    ...c,
    weightPercentage: totalWeight > 0 ? Math.round((c.weightPercentage / totalWeight) * 100) : 0,
  }));

  // Generate IDs and return
  return normalizedCriteria.map(c => ({
    id: generateCriterionId(),
    label: c.label,
    group: c.group,
    weightPercentage: c.weightPercentage,
  }));
}

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
    githubUsername: 'xanlucu',
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

// Domain ratios definitions (used to generate scorecard criteria)
const mis001DomainRatios: DomainRatio[] = [
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
];

const mis002DomainRatios: DomainRatio[] = [
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
    scorecard: {
      id: 'sc_001',
      checkMissionId: 'mis_001',
      domainRatios: mis001DomainRatios,
      scorecardCriteria: generateScorecardCriteria(mis001DomainRatios),
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-20T14:30:00Z',
      archived: false,
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
    scorecard: {
      id: 'sc_002',
      checkMissionId: 'mis_002',
      domainRatios: mis002DomainRatios,
      scorecardCriteria: generateScorecardCriteria(mis002DomainRatios),
      createdAt: '2024-01-18T09:00:00Z',
      updatedAt: '2024-01-22T11:00:00Z',
      archived: false,
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
    githubRepoUrl: 'https://github.com/coton-d3v/agregata-api',
    githubToken: import.meta.env.VITE_GITHUB_TOKEN,
    notes: 'Profil très intéressant, 5 ans XP React',
  },
  {
    id: 'cand_002',
    userId: 'usr_006',
    checkMissionId: 'mis_001',
    status: 'EN_ATTENTE',
    githubUsername: 'fmoreau-dev',
    githubRepoUrl: 'https://github.com/coton-d3v/agregata-api',
    githubToken: import.meta.env.VITE_GITHUB_TOKEN,
    notes: 'À évaluer',
  },
  {
    id: 'cand_003',
    userId: 'usr_007',
    checkMissionId: 'mis_002',
    status: 'VALIDÉ',
    githubUsername: 'gabriellesimon',
    githubRepoUrl: 'https://github.com/coton-d3v/agregata-api',
    githubToken: import.meta.env.VITE_GITHUB_TOKEN,
    notes: 'Excellente candidate, recommandée',
  },
];

// Note: scorecardCriteria are now embedded in Scorecard per mission

// ----- Candidate Reports -----
// Reports reference criteria from the mission's scorecard.scorecardCriteria
// We need to build these after missions are initialized

function buildCandidateReports(): CandidateReport[] {
  // Get criteria IDs from mis_001 (candidate cand_001 is on this mission)
  const mis001Criteria = checkMissions[0].scorecard?.scorecardCriteria ?? [];
  
  // Map scores to the generated criteria (in order)
  const getScoresForMis001 = (scores: number[], comments: string[]) => {
    return mis001Criteria.slice(0, scores.length).map((crit, i) => ({
      criterionId: crit.id,
      score: scores[i],
      comment: comments[i],
    }));
  };

  return [
    {
      id: 'rep_001',
      candidateId: 'cand_001',
      authorUserId: 'usr_002',
      role: 'PRIMARY_REVIEWER',
      finalScore: 78,
      summary: 'Emma démontre une solide maîtrise de React et TypeScript. Son code est propre et bien structuré. Elle répond aux attentes techniques du poste avec quelques axes d\'amélioration sur les patterns avancés.',
      positives: '- Excellente connaissance de React hooks\n- Code lisible et bien documenté\n- Bonne compréhension des principes SOLID',
      negatives: '- Quelques lacunes sur les design patterns avancés\n- Tests unitaires présents mais couverture perfectible',
      remarks: 'Candidate prometteuse, recommandée pour un second entretien technique approfondi.',
      criterionScores: getScoresForMis001(
        [85, 70, 75, 80, 78, 82, 76, 79, 81, 77],
        ['Très bonne maîtrise', 'Correcte', 'Tests présents', 'Clair', 'Autonome', 'Bon', 'OK', 'Satisfaisant', 'Bien', 'Correct']
      ),
      createdAt: '2024-01-10T14:30:00Z',
      updatedAt: '2024-01-10T14:30:00Z',
    },
    {
      id: 'rep_002',
      candidateId: 'cand_001',
      authorUserId: 'usr_003',
      role: 'SECONDARY_REVIEWER',
      finalScore: 82,
      summary: 'Évaluation positive. Emma a démontré une capacité à résoudre des problèmes complexes et à communiquer efficacement ses choix techniques.',
      positives: '- Résolution de problèmes méthodique\n- Bonne gestion du temps\n- Questions pertinentes posées',
      negatives: '- Expérience limitée sur les architectures micro-frontend\n- Pourrait améliorer la gestion des erreurs',
      remarks: 'Profil intéressant pour le poste, compatible avec l\'équipe.',
      criterionScores: getScoresForMis001(
        [88, 75, 80, 85, 82, 79, 83, 81, 84, 78],
        ['Maîtrise confirmée', 'Bonne base', 'Approche solide', 'Fluide', 'Proactive', 'Bon', 'Bien', 'OK', 'Satisfaisant', 'Correct']
      ),
      createdAt: '2024-01-11T10:00:00Z',
      updatedAt: '2024-01-11T10:00:00Z',
    },
    {
      id: 'rep_003',
      candidateId: 'cand_001',
      authorUserId: 'usr_001',
      role: 'FINAL',
      finalScore: 80,
      summary: 'Synthèse finale : Emma Petit est une candidate solide qui répond aux critères techniques du poste. Les deux reviewers s\'accordent sur ses compétences React/TS et sa capacité de communication. Recommandation positive.',
      positives: '- Compétences techniques validées par les deux reviewers\n- Soft skills au-dessus de la moyenne\n- Motivation évidente pour le projet',
      negatives: '- Points d\'amélioration identifiés sur l\'architecture avancée\n- Expérience à consolider sur certains patterns',
      remarks: 'Avis favorable à l\'embauche. Prévoir un accompagnement sur les sujets architecture les premiers mois.',
      criterionScores: getScoresForMis001(
        [86, 72, 77, 82, 80, 80, 79, 80, 82, 77],
        ['Moyenne évaluations', 'Point d\'attention', 'Satisfaisant', 'Point fort', 'Satisfaisant', 'OK', 'Bon', 'Bien', 'Correct', 'OK']
      ),
      createdAt: '2024-01-12T16:00:00Z',
      updatedAt: '2024-01-12T16:00:00Z',
    },
  ];
}

const candidateReports: CandidateReport[] = buildCandidateReports();

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
    title?: string;
    clientId?: string;
  }): Promise<CheckMission> {
    await delay();
    const now = new Date().toISOString();

    // Auto-generate title if not provided
    const generateMissionTitle = () => {
      const date = new Date();
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      return `Poste ${year}${month}${day}-${random}`;
    };

    const newMission: CheckMission = {
      id: generateMissionId(),
      title: input.title || generateMissionTitle(),
      reference: '', // Reference removed as per user request
      clientId: input.clientId || '',
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

  // ----- Scorecard -----

  async upsertScorecard(missionId: string, scorecard: Scorecard): Promise<CheckMission> {
    await delay();
    const mission = checkMissions.find(m => m.id === missionId);
    if (!mission) {
      throw new Error(`CheckMission with id ${missionId} not found`);
    }

    // Update or create scorecard
    mission.scorecard = {
      ...scorecard,
      checkMissionId: missionId,
      updatedAt: new Date().toISOString(),
    };

    return this.enrichMissionWithRelations(mission);
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

  async getCandidateEvaluation(candidateId: string): Promise<CandidateEvaluationView | undefined> {
    await delay();

    const candidate = candidates.find(c => c.id === candidateId);
    if (!candidate) {
      return undefined;
    }

    const mission = checkMissions.find(m => m.id === candidate.checkMissionId);
    if (!mission) {
      return undefined;
    }

    const client = clients.find(c => c.id === mission.clientId);
    const candidateUser = users.find(u => u.id === candidate.userId);
    
    if (!candidateUser) {
      return undefined;
    }

    const reviewers = users.filter(u => mission.assignedReviewerIds.includes(u.id));
    const reports = candidateReports.filter(r => r.candidateId === candidateId);

    const scorecardCriteria = mission.scorecard?.scorecardCriteria ?? [];

    return {
      candidate,
      candidateUser,
      mission,
      client: client!,
      reviewers,
      scorecardCriteria,
      reports,
    };
  },

  // ----- Candidate Reports -----

  async getReportByCandidateAndRole(
    candidateId: string,
    authorUserId: string,
    role: CandidateReportRole
  ): Promise<CandidateReport | undefined> {
    await delay();
    return candidateReports.find(
      r => r.candidateId === candidateId && r.authorUserId === authorUserId && r.role === role
    );
  },

  async createReport(input: {
    candidateId: string;
    authorUserId: string;
    role: CandidateReportRole;
    criterionScores: CriterionScore[];
  }): Promise<CandidateReport> {
    await delay();
    const now = new Date().toISOString();
    const newReport: CandidateReport = {
      id: generateReportId(),
      candidateId: input.candidateId,
      authorUserId: input.authorUserId,
      role: input.role,
      finalScore: 0,
      summary: '',
      positives: '',
      negatives: '',
      remarks: '',
      criterionScores: input.criterionScores,
      createdAt: now,
      updatedAt: now,
    };
    candidateReports.push(newReport);
    return newReport;
  },

  async updateReport(reportId: string, payload: ReportUpdatePayload): Promise<CandidateReport> {
    await delay();
    const index = candidateReports.findIndex(r => r.id === reportId);
    if (index === -1) {
      throw new Error(`Report with id ${reportId} not found`);
    }

    // Compute weighted finalScore
    const candidate = candidates.find(c => c.id === candidateReports[index].candidateId);
    const mission = checkMissions.find(m => m.id === candidate?.checkMissionId);
    const scorecardCriteria = mission?.scorecard?.scorecardCriteria ?? [];

    let totalWeight = 0;
    let weightedSum = 0;
    for (const cs of payload.criterionScores) {
      const criterion = scorecardCriteria.find(c => c.id === cs.criterionId);
      if (criterion) {
        totalWeight += criterion.weightPercentage;
        weightedSum += cs.score * criterion.weightPercentage;
      }
    }
    const finalScore = totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0;

    candidateReports[index] = {
      ...candidateReports[index],
      ...payload,
      finalScore,
      updatedAt: new Date().toISOString(),
    };
    return candidateReports[index];
  },

  async getReportsByCandidate(candidateId: string): Promise<CandidateReport[]> {
    await delay();
    return candidateReports.filter(r => r.candidateId === candidateId);
  },

  async upsertFinalReport(input: {
    candidateId: string;
    authorUserId: string;
    criterionScores: CriterionScore[];
    finalScore: number;
    summary: string;
    positives: string;
    negatives: string;
    remarks: string;
  }): Promise<CandidateReport> {
    await delay();
    const now = new Date().toISOString();
    
    // Find existing FINAL report for this candidate
    const existingIndex = candidateReports.findIndex(
      r => r.candidateId === input.candidateId && r.role === 'FINAL'
    );

    if (existingIndex !== -1) {
      // Update existing
      candidateReports[existingIndex] = {
        ...candidateReports[existingIndex],
        authorUserId: input.authorUserId,
        criterionScores: input.criterionScores,
        finalScore: input.finalScore,
        summary: input.summary,
        positives: input.positives,
        negatives: input.negatives,
        remarks: input.remarks,
        updatedAt: now,
      };
      return candidateReports[existingIndex];
    }

    // Create new FINAL report
    const newReport: CandidateReport = {
      id: generateReportId(),
      candidateId: input.candidateId,
      authorUserId: input.authorUserId,
      role: 'FINAL',
      finalScore: input.finalScore,
      summary: input.summary,
      positives: input.positives,
      negatives: input.negatives,
      remarks: input.remarks,
      criterionScores: input.criterionScores,
      createdAt: now,
      updatedAt: now,
    };
    candidateReports.push(newReport);
    return newReport;
  },
};
