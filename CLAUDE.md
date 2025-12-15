# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

COTON Dashboard - A React-based candidate evaluation and technical assessment platform. This application manages check missions where candidates are evaluated by multiple reviewers through structured scorecards and technical tests.

**Tech Stack**: Vite + React 18 + TypeScript + shadcn-ui + Tailwind CSS + React Query

## Development Commands

```bash
# Install dependencies
yarn

# Start dev server (runs on http://[::]:8080)
yarn dev

# Build for production
yarn build

# Build for development mode
yarn build:dev

# Lint code
yarn lint

# Preview production build
yarn preview
```

## Architecture

### Core Domain Model

The application centers around **Check Missions** - technical evaluation workflows managed by admins:

- **CheckMission**: A technical evaluation assignment for a specific client
- **Candidate**: User being evaluated for a check mission
- **CandidateReport**: Evaluation report with criterion scores (PRIMARY_REVIEWER, SECONDARY_REVIEWER, or FINAL)
- **ScorecardCriterion**: Weighted evaluation criteria (PRIMARY or SECONDARY groups)
- **TechnicalTestDetail**: Domain/expertise ratios and scorecard configuration for a mission

### Multi-Reviewer Workflow

1. Admin creates a check mission with assigned reviewers
2. Candidate submits technical test
3. Primary and secondary reviewers independently evaluate using the scorecard
4. Admin generates merged FINAL report by averaging criterion scores
5. Report merge logic: [src/lib/utils/reportMerge.ts](src/lib/utils/reportMerge.ts)

### Key Directories

- **[src/pages/](src/pages/)**: Route pages (Dashboard, Login, Settings, admin subdirectory)
- **[src/components/](src/components/)**: UI components organized by domain
  - `candidat/`: Reviewer report forms, evaluation cards
  - `layout/`: AppShell (sidebar + topbar), navigation
  - `ui/`: shadcn-ui components
- **[src/lib/](src/lib/)**: Core business logic
  - `types.ts`: All domain types (User, Client, CheckMission, Candidate, Reports)
  - `api/contracts.ts`: CheckAdminApi interface (contract-first design)
  - `api/mockClient.ts`: In-memory mock implementation with sample data
  - `utils/reportMerge.ts`: Report merging algorithms
- **[src/contexts/](src/contexts/)**: React contexts (AuthContext, ThemeContext)
- **[src/hooks/](src/hooks/)**: Custom hooks (use-toast, use-mobile)

### Routing Structure

All authenticated routes wrapped in AppShell layout (sidebar + topbar):

```
/dashboard (root)
/dashboard/admin/check (mission list)
/dashboard/admin/check/:checkId (mission detail)
/dashboard/admin/candidat/:candidatId (candidate evaluation view)
/dashboard/admin/clients
/dashboard/admin/freelances
/dashboard/admin/candidats
/dashboard/settings
/login (public)
```

### API Layer

Uses contract-first design with `CheckAdminApi` interface. Currently implemented with in-memory mock ([src/lib/api/mockClient.ts](src/lib/api/mockClient.ts)) for development. Real implementation would implement the same interface.

Access mock client via:
```typescript
import { checkAdminService } from '@/lib/services/checkAdminService';
```

### State Management

- **React Query** (`@tanstack/react-query`): Server state management
- **React Context**: Auth state (currentRole, userId, userName)
- **Local State**: Component-level UI state

### Path Alias

Uses `@/` alias for [src/](src/) directory (configured in [vite.config.ts](vite.config.ts) and [tsconfig.json](tsconfig.json))

### Current Authentication

Mock authentication in [src/contexts/AuthContext.tsx](src/contexts/AuthContext.tsx) - hardcoded to user "Alice Martin" (usr_001) with ADMIN role. No real auth flow implemented.

## Important Notes

- This is a Lovable.dev project - changes can be made via Lovable IDE or local development
- Mock data includes sample users, clients, missions, candidates, and reports in [src/lib/api/mockClient.ts](src/lib/api/mockClient.ts)
- Report merging uses weighted averaging for criterion scores (see [src/lib/utils/reportMerge.ts](src/lib/utils/reportMerge.ts))
- Scorecard criteria have weight percentages that must sum logically per evaluation group
- Dev server uses IPv6 `::` host binding on port 8080
