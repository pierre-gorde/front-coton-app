# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

COTON Dashboard - A React-based candidate evaluation and technical assessment platform. This application manages check missions where candidates are evaluated by multiple reviewers through structured scorecards and technical tests.

**Tech Stack**: Vite + React 18 + TypeScript + shadcn-ui + Tailwind CSS

## Development Commands

```bash
# Install dependencies
yarn

# Start dev server (runs on http://[::]:8080)
yarn dev

# Build for production
yarn build

# Lint code
yarn lint
```

## Architecture Overview

### Directory Structure

```
src/
├── components/           # UI components organized by domain
│   ├── candidat/        # Evaluation forms and cards
│   ├── check/           # Mission-related components
│   ├── layout/          # AppShell (sidebar + topbar)
│   └── ui/              # shadcn-ui components
├── lib/                 # Core business logic
│   ├── api/            # Contract-first API design
│   ├── services/       # Service layer (GitHub, checkAdmin)
│   ├── utils/          # Pure functions (reportMerge, pdfExport)
│   └── types.ts        # All domain types
├── pages/              # Route pages
├── contexts/           # React contexts (Auth, Theme)
└── hooks/              # Custom React hooks
```

### Core Concepts

- **CheckMission**: Technical evaluation assignment
- **Candidate**: User being evaluated (can have GitHub repo link)
- **CandidateReport**: Evaluation report (PRIMARY_REVIEWER, SECONDARY_REVIEWER, or FINAL)
- **ScorecardCriterion**: Weighted evaluation criteria
- **PRReviewComment**: GitHub code review comments

### Mission Creation & Management Workflow

1. **Quick Creation**: Admin creates a mission with auto-generated name, then navigates to detail page
2. **Configuration**: On detail page, admin configures:
   - Mission title (inline edit)
   - Client (select existing or create new)
   - Scorecard criteria
   - Assigned reviewers
   - Candidates
3. **Evaluation**: PRIMARY and SECONDARY reviewers independently fill evaluation forms
4. **Report Merging**: Admin generates FINAL report by merging both reviews (see [Report Merging](#report-merging))
5. **Display/Edit Modes**: All reports can be viewed (card) or edited (form)
6. **PDF Export**: Final report can be exported as professional PDF

## Coding Patterns & Best Practices

### 1. Constants & Magic Values

**ALWAYS use constants for fixed values** - never hardcode strings, numbers, or configuration:

```typescript
// ✅ GOOD - Constants exported for reuse
export const SCORE_THRESHOLDS = {
  EXCELLENT: 80,
  GOOD: 60,
  POOR: 0,
} as const;

export const REPORT_ROLES = {
  PRIMARY: 'PRIMARY_REVIEWER',
  SECONDARY: 'SECONDARY_REVIEWER',
  FINAL: 'FINAL',
} as const;

// Usage
if (score >= SCORE_THRESHOLDS.EXCELLENT) { ... }

// ❌ BAD - Magic numbers and strings
if (score >= 80) { ... }
if (role === 'PRIMARY_REVIEWER') { ... }
```

**Location**: Define constants at the top of files or in dedicated constant files.

### 2. Exports & Imports - DRY Principle

**ALWAYS export reusable code** - avoid duplication across files:

```typescript
// ✅ GOOD - Utility functions exported from utils
// src/lib/utils/reportMerge.ts
export function calculateWeightedScore(
  criterionScores: CriterionScore[],
  criteria: ScorecardCriterion[]
): number {
  const totalWeight = criteria.reduce((sum, c) => sum + c.weightPercentage, 0);
  const weightedSum = criterionScores.reduce((sum, score) => {
    const criterion = criteria.find(c => c.id === score.criterionId);
    return sum + (score.score * (criterion?.weightPercentage || 0));
  }, 0);
  return totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0;
}

// Multiple files import and reuse
import { calculateWeightedScore } from '@/lib/utils/reportMerge';

// ❌ BAD - Duplicating calculation logic in multiple components
```

**When to extract**:
- Same logic used 2+ times → Extract to utility function
- Same UI pattern → Extract to component
- Same type/interface → Define once in `types.ts`

### 3. Type Safety

**Use TypeScript strictly** - leverage the type system:

```typescript
// ✅ GOOD - Strict typing with domain types
import type { CandidateReport, CriterionScore } from '@/lib/types';

interface EvaluationFormProps {
  candidateId: string;
  missionId: string;
  report?: CandidateReport;
  onSave: (report: CandidateReport) => Promise<void>;
}

// ❌ BAD - Any types or implicit any
function handleSave(data: any) { ... }
```

**All domain types** are centralized in [src/lib/types.ts](src/lib/types.ts).

### 4. Contract-First API Design

**Define interfaces before implementation**:

```typescript
// src/lib/api/contracts.ts - Interface contract
export interface CheckAdminApi {
  getCandidateEvaluationView(candidateId: string): Promise<CandidateEvaluationView>;
  upsertCandidateReport(candidateId: string, report: CandidateReport): Promise<CandidateReport>;
  // ... all methods
}

// src/lib/api/mockClient.ts - Mock implementation
export class MockCheckAdminClient implements CheckAdminApi {
  async getCandidateEvaluationView(candidateId: string) { ... }
  // ... implements all methods
}

// Future: Real API client will implement the same interface
export class RealCheckAdminClient implements CheckAdminApi { ... }
```

**Benefits**: Swap implementations without changing consumers.

### 5. Service Layer Pattern

**Business logic goes in service layer**, not directly in API clients:

```typescript
// src/lib/services/checkAdminService.ts
import { mockCheckAdminClient } from '@/lib/api/mockClient';

export const checkAdminService = {
  async getCandidateEvaluationView(candidateId: string) {
    return mockCheckAdminClient.getCandidateEvaluationView(candidateId);
  },

  async generateFinalReport(candidateId: string) {
    const view = await this.getCandidateEvaluationView(candidateId);
    // Business logic: merge reports
    const finalReport = mergeCandidateReports(view.primaryReport, view.secondaryReport);
    return this.upsertFinalReport(candidateId, finalReport);
  },
};

// Components import service, not API client directly
import { checkAdminService } from '@/lib/services/checkAdminService';
```

### 6. Pure Functions for Business Logic

**Extract algorithms to pure utility functions**:

```typescript
// src/lib/utils/reportMerge.ts
export function mergeCandidateReports(
  primary: CandidateReport | null,
  secondary: CandidateReport | null,
  criteria: ScorecardCriterion[]
): CandidateReport {
  // Pure function: same inputs → same output
  // No side effects, easily testable
  const mergedScores = mergeCriterionScores(
    primary?.criterionScores || [],
    secondary?.criterionScores || []
  );
  // ...
  return mergedReport;
}
```

**Benefits**: Testable, reusable, predictable.

### 7. Component State Management

**Organize state by purpose**:

```typescript
function ReviewerReportForm({ candidateId, report, onSave }: Props) {
  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  // Form data
  const [criterionScores, setCriterionScores] = useState<CriterionScore[]>(report?.criterionScores || []);
  const [summary, setSummary] = useState(report?.summary || '');

  // Derived state (compute from existing state)
  const finalScore = useMemo(() =>
    calculateWeightedScore(criterionScores, criteria),
    [criterionScores, criteria]
  );

  // ...
}
```

### 8. Path Alias Usage

**ALWAYS use `@/` alias** for imports from `src/`:

```typescript
// ✅ GOOD
import { checkAdminService } from '@/lib/services/checkAdminService';
import { Button } from '@/components/ui/button';
import type { CandidateReport } from '@/lib/types';

// ❌ BAD - Relative paths
import { checkAdminService } from '../../../lib/services/checkAdminService';
```

### 9. Error Handling

**Handle errors gracefully with user feedback**:

```typescript
import { useToast } from '@/hooks/use-toast';

function MyComponent() {
  const { toast } = useToast();

  const handleSave = async () => {
    try {
      setIsLoading(true);
      await checkAdminService.upsertCandidateReport(candidateId, report);
      toast({
        title: "Succès",
        description: "Rapport enregistré avec succès",
      });
    } catch (error) {
      console.error('Failed to save report:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'enregistrer le rapport",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
}
```

### 10. Component Organization

**Structure components consistently**:

```typescript
// 1. Imports
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { checkAdminService } from '@/lib/services/checkAdminService';
import type { CandidateReport } from '@/lib/types';

// 2. Types/Interfaces
interface MyComponentProps {
  candidateId: string;
  onComplete: () => void;
}

// 3. Constants (component-specific)
const MAX_COMMENT_LENGTH = 500;

// 4. Component
export function MyComponent({ candidateId, onComplete }: MyComponentProps) {
  // Hooks
  const [state, setState] = useState();

  // Derived values
  const isValid = useMemo(() => ..., []);

  // Event handlers
  const handleSubmit = async () => { ... };

  // Render
  return <div>...</div>;
}
```

## Feature Documentation

### Report Merging

**Location**: [src/lib/utils/reportMerge.ts](src/lib/utils/reportMerge.ts)

The FINAL report is generated by merging PRIMARY_REVIEWER and SECONDARY_REVIEWER reports:

**Merge Algorithm**:
1. **Criterion Scores**: Average scores when both exist, use single value if only one
2. **Final Score**: Recalculate weighted average from merged criterion scores
3. **Text Sections** (summary, remarks): Concatenate intelligently, deduplicate
4. **Bullet Sections** (positivePoints, negativePoints):
   - Parse into individual bullets
   - Normalize (lowercase, trim)
   - Deduplicate semantically similar items
   - Limit to 8 items max
   - Sort alphabetically
5. **PR Comments**: Combine all review comments from both reviewers

**Key Functions**:
- `mergeCandidateReports()`: Main merge orchestrator
- `mergeCriterionScores()`: Merge criterion scores array
- `mergeBulletSection()`: Parse, deduplicate, limit bullets
- `calculateWeightedScore()`: Compute final score from weighted criteria

### GitHub Integration

**Location**: [src/lib/services/githubService.ts](src/lib/services/githubService.ts)

Reviewers can fetch their GitHub code review comments to include in evaluation reports.

**Workflow**:
1. **Setup**: Candidate has `githubRepoUrl` (e.g., `https://github.com/owner/repo`)
2. **Authentication**: Token read from `VITE_GITHUB_TOKEN` env var (see `.env.example`)
3. **Fetch**: Reviewer clicks "Récupérer code reviews" button in form
4. **Filter**: Comments filtered by reviewer's `githubUsername`
5. **Display**: Comments shown in dedicated section within report

**Key Functions**:
- `parseGitHubRepoUrl(url)`: Extract owner/repo from GitHub URL
- `fetchAllPRsWithComments(owner, repo, token)`: Get all PRs with review comments
- `fetchPRCommentsByAuthor(url, author, token, limit)`: Get last N PRs, filter by reviewer
- `fetchPullRequests(owner, repo, token)`: Paginated PR fetching
- `fetchPRReviewComments(owner, repo, prNumber, token)`: Get comments for specific PR

**GitHub Token Setup**:
1. Generate Personal Access Token: https://github.com/settings/tokens
2. Required scope: `repo`
3. Copy `.env.example` to `.env`
4. Set `VITE_GITHUB_TOKEN=your_token_here`

**Note**: `.env` is gitignored for security.

### PDF Export

**Location**: [src/lib/utils/pdfExport.ts](src/lib/utils/pdfExport.ts)

Export final evaluation reports as professional PDFs using jsPDF.

**Features**:
- **Header**: Title, candidate/mission/client info, date
- **Score Display**: Large color-coded final score (green ≥80, amber ≥60, red <60)
- **Sections**: Summary, positivePoints, negativePoints, remarks with proper formatting
- **Criterion Tables**: Separate tables for PRIMARY and SECONDARY criteria groups
- **Auto-pagination**: Adds pages as needed
- **Footer**: Page numbers and generation timestamp

**Usage**:
```typescript
import { exportFinalReportToPDF } from '@/lib/utils/pdfExport';

// In FinalEvaluationCard component
const handleExportPDF = () => {
  exportFinalReportToPDF(
    finalReport,
    candidate,
    mission,
    client,
    criteria
  );
};
```

**Filename**: `evaluation_finale_[candidateName]_[timestamp].pdf`

### Display/Edit Modes

Evaluation components support two modes:

**Display Mode** (Default):
- Collapsible cards showing report summary
- Read-only view of all sections
- "Edit" button to switch to form mode
- Used by: `ReviewerEvaluationCard`, `FinalEvaluationCard`

**Edit Mode** (Form):
- Full forms with inputs for all fields
- Live calculation of weighted scores
- Dirty state tracking (unsaved changes warning)
- Save/Cancel buttons
- Used by: `ReviewerReportForm`, `FinalReportForm`

**State Management**:
```typescript
// In parent component (CandidatDetail.tsx)
const [editingReportId, setEditingReportId] = useState<string | null>(null);

// Show form if editing, otherwise show card
{editingReportId === report.id ? (
  <ReviewerReportForm report={report} onSave={handleSave} />
) : (
  <ReviewerEvaluationCard report={report} onEdit={() => setEditingReportId(report.id)} />
)}
```

### Scorecard Generation

**Location**: [src/lib/api/mockClient.ts](src/lib/api/mockClient.ts) - `generateScorecardCriteria()`

Scorecards are auto-generated from mission domain ratios:

**Process**:
1. Map domain ratios to skill levels (e.g., Frontend 80% → SENIOR)
2. Apply scorecard rules (different criteria per domain + level)
3. Scale criterion weights by domain percentage
4. Normalize all weights to sum to 100%
5. Split into PRIMARY (high-weight) and SECONDARY (low-weight) groups

**Example**: Mission with Frontend 60% (SENIOR) + Backend 40% (JUNIOR)
- Generates 4-5 criteria weighted accordingly
- PRIMARY group: Main criteria (60-80% of weight)
- SECONDARY group: Supporting criteria (20-40% of weight)

## Environment Setup

### Required Files

**`.env`** (create from `.env.example`):
```bash
# API Backend URL
VITE_API_URL=http://localhost:3001

# API Mode Toggle (true = mock, false = real backend)
VITE_USE_MOCK_API=true

# GitHub Personal Access Token
VITE_GITHUB_TOKEN=ghp_your_token_here
```

### API Integration

The application supports **two API modes**:

1. **Mock API** (default) - `VITE_USE_MOCK_API=true`
   - Uses in-memory data from [src/lib/api/mockClient.ts](src/lib/api/mockClient.ts)
   - Perfect for frontend development without backend
   - Includes complete sample data (missions, candidates, reports)

2. **Real API** - `VITE_USE_MOCK_API=false`
   - Connects to actual backend at `VITE_API_URL`
   - Requires backend server running
   - Uses [src/lib/api/realClient.ts](src/lib/api/realClient.ts)

**Switching between modes:**
```typescript
// src/lib/services/checkAdminService.ts
const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API !== 'false';
const apiClient = USE_MOCK_API ? mockCheckAdminApi : realCheckAdminClient;
```

**Architecture:**
```
Components → Service Layer → API Client (Mock OR Real) → Backend
```

### Authentication

**Magic Link Authentication** - Cookie-based session management:
- Login: User enters email, receives magic link via email
- Verify: Click link → backend sets HTTP-only cookie (7 days)
- Auto-logout: 401 errors trigger automatic redirect to login
- Session: Cookie automatically included in all API calls (`credentials: 'include'`)

**Key Files:**
- [src/lib/api/auth.ts](src/lib/api/auth.ts) - Auth API endpoints
- [src/lib/services/authService.ts](src/lib/services/authService.ts) - Auth business logic
- [src/contexts/AuthContext.tsx](src/contexts/AuthContext.tsx) - Auth state management
- [src/pages/Login.tsx](src/pages/Login.tsx) - Magic link request page
- [src/pages/AuthVerify.tsx](src/pages/AuthVerify.tsx) - Token verification page

## Key Files Reference

| File | Purpose |
|------|---------|
| [src/lib/types.ts](src/lib/types.ts) | All domain types - single source of truth |
| [src/lib/api/contracts.ts](src/lib/api/contracts.ts) | API interface contract (CheckAdminApi) |
| [src/lib/api/client.ts](src/lib/api/client.ts) | HTTP client with auth (credentials: 'include') |
| [src/lib/api/mockClient.ts](src/lib/api/mockClient.ts) | Mock API implementation with sample data |
| [src/lib/api/realClient.ts](src/lib/api/realClient.ts) | Real API implementation (HTTP calls to backend) |
| [src/lib/api/auth.ts](src/lib/api/auth.ts) | Authentication API endpoints |
| [src/lib/services/checkAdminService.ts](src/lib/services/checkAdminService.ts) | Service layer with business logic + API toggle |
| [src/lib/services/authService.ts](src/lib/services/authService.ts) | Auth service layer |
| [src/lib/services/githubService.ts](src/lib/services/githubService.ts) | GitHub API integration |
| [src/lib/utils/reportMerge.ts](src/lib/utils/reportMerge.ts) | Report merging algorithms |
| [src/lib/utils/pdfExport.ts](src/lib/utils/pdfExport.ts) | PDF generation |
| [src/contexts/AuthContext.tsx](src/contexts/AuthContext.tsx) | Auth state management + event listeners |
| [src/pages/Login.tsx](src/pages/Login.tsx) | Magic link login page |
| [src/pages/AuthVerify.tsx](src/pages/AuthVerify.tsx) | Magic link verification page |
| [src/pages/admin/CandidatDetail.tsx](src/pages/admin/CandidatDetail.tsx) | Main evaluation orchestration page |
| [src/components/candidat/ReviewerReportForm.tsx](src/components/candidat/ReviewerReportForm.tsx) | Form for reviewer evaluation |
| [src/components/candidat/FinalReportForm.tsx](src/components/candidat/FinalReportForm.tsx) | Form for editing final report |
| [src/components/candidat/FinalEvaluationCard.tsx](src/components/candidat/FinalEvaluationCard.tsx) | Display card for final evaluation |
| [src/components/check/MissionCreateDialog.tsx](src/components/check/MissionCreateDialog.tsx) | Minimal mission creation dialog (auto-generates name) |
| [src/components/check/MissionHeader.tsx](src/components/check/MissionHeader.tsx) | Mission header with inline editing (title, client) |
| [src/components/check/ClientSelectCreate.tsx](src/components/check/ClientSelectCreate.tsx) | Combobox for selecting/creating clients |

## Common Tasks

### Add a New Criterion to Scorecard Rules

1. Define criterion in `SCORECARD_RULES` in [mockClient.ts](src/lib/api/mockClient.ts:L50-L150)
2. Add to appropriate domain + skill level
3. Ensure weights are balanced

### Add a New Report Section

1. Add field to `CandidateReport` type in [types.ts](src/lib/types.ts)
2. Update merge logic in [reportMerge.ts](src/lib/utils/reportMerge.ts)
3. Add form input in `ReviewerReportForm` and `FinalReportForm`
4. Add display in evaluation cards
5. Update PDF export if needed

### Integrate Real API

1. Create new class implementing `CheckAdminApi` interface
2. Replace `mockCheckAdminClient` import in [checkAdminService.ts](src/lib/services/checkAdminService.ts)
3. No changes needed in components (they use service layer)

## GitHub Issues Management

When creating GitHub issues for this project, follow the standardized pattern defined in [.github/CLAUDE_ISSUE_CONFIG.md](.github/CLAUDE_ISSUE_CONFIG.md).

**Quick reference**:
- Use emoji labels: `✨ feature`, `🐛 bug`, `🔐 auth`, `🚀 high-priority`, etc.
- Always assign to `@me`
- Follow the structured body template (Objectif, Contexte, Tâches, Tests)
- Include relevant code patterns from this CLAUDE.md

**Command**:
```bash
gh issue create \
  --title "🔐 [Title with emoji]" \
  --body-file /path/to/issue.md \
  --label "✨ feature,🔐 auth,🚀 high-priority" \
  --assignee "@me"
```

## Important Notes

- This is a **Lovable.dev** project - changes can be made via Lovable IDE or local development
- Dev server uses IPv6 `::` host binding on port 8080
- All routes except `/login` require authentication (currently auto-logged as admin)
- Mock data includes complete evaluation workflows for testing
