# AGENTS.md — Autonomous Build Pipeline

This file is read by GitHub Copilot Agent Mode and the Copilot Coding Agent.
When given an app idea, execute the full pipeline below **autonomously** from
start to finish. Do not stop and ask the user between phases. Complete each
phase fully before moving to the next. Show a progress header at the start
of each phase so the user can follow along.

---

## ▶ HOW TO TRIGGER

### Fresh project
```
Build: [your app idea]
```

### Existing project — add a feature
```
Add: [feature description]
```
Example:
```
Add: A subscription billing system with Stripe. Users pick a plan,
enter payment details, and get access to premium features.
```

### Existing project — build the whole app
```
Build: [your app idea]
```

**In all cases**, Phase 0 runs first and audits what already exists.
The pipeline then builds only what is missing and extends what is there.
It will never overwrite your existing code.

---

## PIPELINE EXECUTION ORDER

```
Phase 0: CODEBASE AUDIT     → Understand existing project before touching anything
Phase 1: PRODUCT MANAGER    → PRD + user stories
Phase 2: ARCHITECT          → System design + schema + API contracts
Phase 3: UI/UX DESIGNER     → Screens + components + design tokens
Phase 4: BACKEND DEVELOPER  → APIs + auth + database + services
Phase 5: FRONTEND DEVELOPER → React components + pages + wiring
Phase 6: QA ENGINEER        → Tests (unit + integration + E2E)

```

Each phase writes its output to a file in `docs/` before proceeding.
This gives the user a paper trail and lets each phase read the previous one.

---

## PHASE 0 — CODEBASE AUDIT (runs always, even on fresh projects)

**Announce**: `🔍 PHASE 0 — CODEBASE AUDIT: Reading existing project...`

**Task**: Understand everything about the existing project before writing a single file.

**Steps**:

1. **Detect project type** — check for these files in order:
   - `package.json` → read it fully (dependencies, scripts, name, version)
   - `tsconfig.json` → note strict mode settings
   - `next.config.*` → Next.js version and config
   - `vite.config.*` → Vite-based project
   - `prisma/schema.prisma` → existing DB schema
   - `tailwind.config.*` → existing Tailwind setup
   - `.env.example` or `.env` → existing environment variables

2. **Map existing structure** — scan the full directory tree:
   - What folders exist? (`src/`, `app/`, `pages/`, `components/`, `lib/`, etc.)
   - What routing pattern is used? (App Router vs Pages Router vs other)
   - What is the component naming convention? (PascalCase files? kebab-case folders?)
   - Are there existing base components? (`Button`, `Input`, etc. — do not recreate them)
   - Is there an existing auth setup? (NextAuth, Clerk, Lucia, custom JWT)
   - Is there an existing DB setup? (Prisma, Drizzle, Mongoose, raw SQL)

3. **Identify existing patterns** — read 3–5 existing source files to extract:
   - Import style (absolute `@/` aliases vs relative)
   - How API routes are structured
   - How components are typed (props interfaces vs type)
   - Whether Server Actions or Route Handlers are used for mutations
   - Error handling patterns

4. **List what already exists vs what needs to be built**:
   - Auth → exists / partial / missing
   - Database schema → exists / partial / missing
   - Base UI components → exists (list them) / missing
   - CI/CD → exists / missing
   - Tests → exists / missing

5. **Write audit to `docs/CODEBASE-AUDIT.md`**:

```markdown
# Codebase Audit

## Project
- Name: [from package.json]
- Framework: [Next.js 14 App Router / Vite + React / etc.]
- Language: TypeScript [strict: true/false] / JavaScript
- Package manager: npm / yarn / pnpm

## Existing Stack
| Layer | Library | Version |
|-------|---------|---------|
| Framework | Next.js | 14.x |
| Database | Prisma + PostgreSQL | ... |
| Auth | NextAuth | ... |
| Styling | Tailwind | ... |
| State | Zustand / TanStack Query | ... |
| Testing | Vitest / Jest | ... |

## Directory Structure
[actual tree of existing project]

## Existing Patterns (pipeline must follow these)
- Imports: [absolute with @/ / relative]
- Components: [naming convention found]
- API routes: [pattern found]
- Mutations: [Server Actions / Route Handlers]
- Error handling: [pattern found]

## What Already Exists (DO NOT recreate)
- [list existing components, routes, services, schemas]

## What Needs to Be Built
- [gap list — what the user's idea requires that doesn't exist yet]

## Conflicts / Risks
- [anything in the existing code that might conflict with the new feature]
```

**CRITICAL RULES for existing projects**:
- **Never overwrite an existing file** — only append, extend, or create new files
- **Match the existing import style** — if the project uses `@/components`, use that
- **Match the existing component pattern** — if components use `interface Props`, don't switch to `type`
- **If auth already exists** — use it, don't install a second auth library
- **If a base component already exists** — use it, don't create a duplicate
- **If Prisma schema already exists** — add new models, don't replace the file

**Then proceed immediately to Phase 1.**

---

## PHASE 1 — PRODUCT MANAGER

**Announce**: `🗂️ PHASE 1 — PRODUCT MANAGER: Writing PRD...`

**Task**: Analyse the user's idea and produce a complete Product Requirements Document.

**Steps**:
1. Extract the core problem, target users, and primary use case from the idea
2. Infer reasonable assumptions for anything not specified (scale, auth, integrations)
3. Define MVP scope — what is IN and explicitly what is OUT for v1
4. Write the full PRD to `docs/PRD.md`

**Output file** → `docs/PRD.md`:

```markdown
# PRD: [App Name]
**Version**: 1.0 | **Status**: Approved

## Problem Statement
[2–3 sentences on the pain, who has it, and why now]

## Target Users
| Persona | Description | Primary Goal |
|---------|-------------|-------------|
| ...     | ...         | ...         |

## Goals & Success Metrics
| Goal | Metric | Target |
|------|--------|--------|
| ...  | ...    | ...    |

## User Stories — MVP
- As a [user], I want to [action] so that [outcome]
[list all must-have stories]

## Out of Scope (v1)
- [list explicitly excluded features]

## Screens
| Screen | Purpose | Key Actions |
|--------|---------|-------------|
| ...    | ...     | ...         |

## Non-Functional Requirements
| Concern | Requirement |
|---------|-------------|
| Auth | [e.g. email + password] |
| Scale | [e.g. ~500 users at launch] |
| Latency | p95 < 500ms |

## Definition of Done
- [ ] All MVP user stories implemented
- [ ] All tests passing
- [ ] Zero critical security findings
- [ ] Deployed and health check passing
```

**Then proceed immediately to Phase 2.**

---

## PHASE 2 — ARCHITECT

**Announce**: `📐 PHASE 2 — ARCHITECT: Designing system...`

**Input**: Read `docs/PRD.md`

**Task**: Design the complete system before any code is written.

**Steps**:
1. Draw the system diagram (ASCII)
2. Choose the tech stack and write ADRs for every major decision
3. Write the full Prisma database schema
4. Define every API endpoint with request/response shapes
5. Write everything to `docs/ARCHITECTURE.md`

**Output file** → `docs/ARCHITECTURE.md`:

```markdown
# Architecture: [App Name]

## System Diagram
[ASCII diagram showing: client, API layer, database, cache, queues, external services]

## Tech Stack
| Layer | Choice | Reason |
|-------|--------|--------|
| Framework | Next.js 14 App Router | SSR + API routes in one |
| Database | PostgreSQL + Prisma | ... |
| Cache | Redis (Upstash) | ... |
| Auth | NextAuth v5 | ... |
| Styling | Tailwind CSS | ... |
| Deployment | [Railway / Vercel / AWS] | ... |

## ADRs
### ADR-001: [Decision]
- **Decision**: [what was chosen]
- **Why**: [reasoning]
- **Alternatives rejected**: [and why]

[one ADR per major decision]

## Database Schema (Prisma)
[full schema.prisma content]

## API Contracts
[every endpoint: method, path, auth, request, response, errors]
```

**Then proceed immediately to Phase 3.**

---

## PHASE 3 — UI/UX DESIGNER

**Announce**: `🎨 PHASE 3 — UI/UX DESIGNER: Designing experience...`

**Input**: Read `docs/PRD.md` and `docs/ARCHITECTURE.md`

**Task**: Design every screen and component in enough detail for a developer to build without guessing.

**Steps**:
1. Map every user flow with ASCII diagrams
2. Spec every screen (layout, components, states, data needs)
3. Define the full component inventory with variants
4. Write design tokens as a TypeScript file
5. Write everything to `docs/DESIGN-SPEC.md` and create `src/styles/tokens.ts`

**Output files**:

→ `docs/DESIGN-SPEC.md`:
```markdown
# Design Spec: [App Name]

## User Flows
[ASCII flow diagrams for every journey: onboarding, main feature, error paths]

## Screens
### [Screen Name] — Route: /path
**Layout**: [ASCII wireframe]
**Components**: [list]
**States**: Loading | Empty | Error | Success
**Interactions**: [what happens on each action]
**Data needed**: [from which API endpoint]

[repeat for every screen in PRD]

## Component Inventory
[every component with: variants, sizes, states, props]

## Interaction Patterns
[form submission, table sorting, modals, toasts, etc.]
```

→ `src/styles/tokens.ts`:
```typescript
export const tokens = {
  colors: { /* brand, semantic, neutrals */ },
  spacing: { /* xs through 2xl */ },
  radius: { /* sm, md, lg, full */ },
  shadow: { /* sm, md, lg */ },
  typography: { /* font families, scale */ },
  animation: { /* fast, base, slow */ },
}
```

**Then proceed immediately to Phase 4.**

---

## PHASE 4 — BACKEND DEVELOPER

**Announce**: `🖥️ PHASE 4 — BACKEND DEVELOPER: Building APIs...`

**Input**: Read `docs/ARCHITECTURE.md`

**Task**: Implement the complete server-side application.

**Steps** (in this order):
1. Create `prisma/schema.prisma` from the architecture schema
2. Create `src/lib/db.ts` — Prisma singleton
3. Create `src/lib/auth.ts` — NextAuth configuration
4. Create `src/lib/redis.ts` — Redis client (if needed)
5. Create Zod validation schemas in `src/lib/validations/`
6. Create service layer in `src/lib/services/` (business logic, no HTTP)
7. Create API route handlers in `src/app/api/`
8. Create auth middleware in `src/middleware.ts`
9. Create `prisma/seed.ts` with dev seed data
10. Create `.env.example` with all required variables

**Code standards to follow**:
- TypeScript strict mode, no `any`
- Service layer owns business logic — route handlers are HTTP-only
- Every route handler: authenticate → validate → call service → respond
- Never `SELECT *` — always specify Prisma `select` fields
- All passwords: bcrypt with cost 12
- All sessions: httpOnly + Secure + SameSite=Strict cookies
- All errors: friendly message to user, full detail to server logs only
- N+1 queries are bugs — use Prisma `include` or `$transaction`

**After implementing**, run:
```bash
npx tsc --noEmit
```
Fix any TypeScript errors before proceeding.

**Then proceed immediately to Phase 5.**

---

## PHASE 5 — FRONTEND DEVELOPER

**Announce**: `⚡ PHASE 5 — FRONTEND DEVELOPER: Building UI...`

**Input**: Read `docs/DESIGN-SPEC.md` and `docs/ARCHITECTURE.md`

**Task**: Implement every screen and component from the design spec, wired to real APIs.

**Steps** (in this order):
1. Create base UI components in `src/components/ui/`:
   - `Button.tsx` — variants: primary, secondary, ghost, destructive; sizes: sm, md, lg
   - `Input.tsx` — with label, error state, hint text
   - `Card.tsx` — with variants
   - `Skeleton.tsx` — for loading states
   - `Toast.tsx` / `Toaster.tsx` — for notifications
   - `Modal.tsx` — accessible dialog
   - `EmptyState.tsx` — with icon + message + CTA
   - `ErrorState.tsx` — with retry button
2. Create the root layout `src/app/layout.tsx`
3. Create auth pages: `/login`, `/register`
4. Create the dashboard layout `src/app/(dashboard)/layout.tsx`
5. Create every screen listed in `docs/DESIGN-SPEC.md`
6. Wire all forms with React Hook Form + Zod
7. Wire all data fetching with TanStack Query (client) or Server Components (server)

**Code standards to follow**:
- Server Components by default — `'use client'` only for: event handlers, hooks, browser APIs
- Every component that loads data must handle ALL FOUR states: loading skeleton, error, empty, success
- All forms: React Hook Form + Zod — no uncontrolled inputs
- All interactive elements: keyboard accessible, correct ARIA labels
- Use `cn()` utility and Tailwind classes — no hardcoded hex or inline styles
- Use design tokens from `src/styles/tokens.ts`
- Name components exactly as specified in the design spec

**After implementing**, run:
```bash
npx next build 2>&1 | head -50
```
Fix any build errors before proceeding.

**Then proceed immediately to Phase 6.**

---

## PHASE 6 — QA ENGINEER

**Announce**: `🧪 PHASE 6 — QA ENGINEER: Writing and running tests...`

**Input**: Read the full codebase

**Task**: Write and run a complete test suite. Fix any failures found.

**Steps**:
1. Install test dependencies if not present:
   ```bash
   npm install -D vitest @testing-library/react @testing-library/user-event @playwright/test @axe-core/playwright
   ```
2. Write unit tests in `tests/unit/` for every service function
3. Write integration tests in `tests/integration/` for every API endpoint:
   - Auth check (unauthenticated → 401)
   - Input validation (invalid input → 422)
   - Happy path (valid input + auth → success)
4. Write E2E tests in `tests/e2e/` for every critical user flow
5. Write accessibility tests for every page (axe-core)
6. Run the tests:
   ```bash
   npx vitest run --coverage
   npx playwright test
   ```
7. Fix any failures — update the **implementation**, not the tests
8. Write the QA report to `docs/QA-REPORT.md`

**QA Report** → `docs/QA-REPORT.md`:
```markdown
# QA Report
**Date**: [date] | **Status**: [PASSED / FAILED]

## Results
| Suite | Tests | Passed | Failed |
|-------|-------|--------|--------|
| Unit        | ... | ... | ... |
| Integration | ... | ... | ... |
| E2E         | ... | ... | ... |
| A11y        | ... | ... | ... |

## Critical Paths Verified
- [x] User registration
- [x] User login + logout
- [x] Auth-protected routes redirect when unauthenticated
- [x] [main feature flow]
- [x] Error states display correctly

## Issues Found & Fixed
[list any bugs found during QA and how they were fixed]
```

**Do not proceed to Phase 7 if there are failing Critical/High tests.**

**Then proceed immediately to Phase 7.**

---


```
✅ PIPELINE COMPLETE

📄 docs/PRD.md               — Product requirements
📐 docs/ARCHITECTURE.md      — System design + ADRs + schema
🎨 docs/DESIGN-SPEC.md       — UI/UX spec + component inventory
🧪 docs/QA-REPORT.md         — Test results
🚀 docs/DEPLOYMENT.md        — Deployment guide

📁 Files created:
   prisma/schema.prisma
   src/lib/db.ts
   src/lib/auth.ts
   src/lib/services/[...]
   src/app/api/[...]
   src/components/ui/[...]
   src/app/[all pages]
   tests/[unit + integration + e2e]
   Dockerfile
   docker-compose.yml
   .github/workflows/deploy.yml
   .env.example

▶ Next steps:
  1. cp .env.example .env.local
  2. Fill in your secrets in .env.local
  3. docker-compose up -d   (starts postgres + redis)
  4. npx prisma migrate dev --name init
  5. npx prisma db seed
  6. npm run dev
  7. Open http://localhost:3000
```

---

## UNIVERSAL CODING RULES

These apply to every phase that produces code:

**TypeScript**
- Strict mode always — `"strict": true` in tsconfig
- No `any` — use `unknown` and narrow it
- Explicit return types on all exported functions

**Security (non-negotiable)**
- Passwords: bcrypt cost ≥ 12 or argon2id only
- Sessions: httpOnly + Secure + SameSite=Strict cookies
- Every non-public route: auth check before any data access
- Secrets: env vars only, never hardcoded, never logged
- Input: Zod validation on every API endpoint and every form

**Quality**
- No `console.log` in production code — use structured logging
- No hardcoded strings for UI copy — use constants
- No magic numbers — name your constants
- Every async operation wrapped in try/catch with meaningful error handling

**File Structure**
```
src/
├── app/                     # Next.js App Router pages
├── components/ui/           # Base reusable components
├── components/[feature]/    # Feature-specific components
├── lib/
│   ├── db.ts               # Prisma singleton
│   ├── auth.ts             # Auth config
│   ├── services/           # Business logic (no HTTP)
│   ├── validations/        # Zod schemas
│   └── utils.ts            # Helpers
├── styles/tokens.ts         # Design tokens
└── types/index.ts           # Shared TypeScript types
prisma/schema.prisma
tests/unit/
tests/integration/
tests/e2e/
docs/
.github/workflows/
```
