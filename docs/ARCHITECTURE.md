# Architecture: Field Up Admin

## System Diagram
```
┌──────────────────────────────────────────────────────────┐
│                     BROWSER (Admin)                      │
│                                                          │
│   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│   │  Login Page   │  │  Dashboard   │  │  CRUD Pages  │  │
│   └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  │
│          │                 │                  │           │
└──────────┼─────────────────┼──────────────────┼──────────┘
           │                 │                  │
           ▼                 ▼                  ▼
┌──────────────────────────────────────────────────────────┐
│                  NEXT.JS 14 APP ROUTER                   │
│                                                          │
│   ┌─────────────┐  ┌─────────────┐  ┌────────────────┐  │
│   │ Middleware   │  │  API Routes │  │ Server         │  │
│   │ (Auth Gate)  │──│  /api/*     │  │ Components     │  │
│   └─────────────┘  └──────┬──────┘  └────────────────┘  │
│                           │                              │
│            ┌──────────────┼──────────────┐               │
│            ▼              ▼              ▼               │
│   ┌────────────┐  ┌────────────┐  ┌────────────┐        │
│   │ Auth       │  │ Validation │  │ Services   │        │
│   │ (NextAuth) │  │ (Zod)      │  │ (Business) │        │
│   └─────┬──────┘  └────────────┘  └─────┬──────┘        │
│         │                                │               │
│         ▼                                ▼               │
│   ┌──────────────────────────────────────────┐           │
│   │          PRISMA ORM (DB Client)          │           │
│   └──────────────────┬───────────────────────┘           │
│                      │                                   │
└──────────────────────┼───────────────────────────────────┘
                       │
                       ▼
              ┌────────────────┐
              │  PostgreSQL    │
              │  Database      │
              └────────────────┘
```

## Tech Stack
| Layer | Choice | Reason |
|-------|--------|--------|
| Framework | Next.js 14 App Router | SSR + API routes in one, React Server Components |
| Language | TypeScript (strict) | Type safety, better DX |
| Database | PostgreSQL + Prisma | Relational data, type-safe ORM, migrations |
| Auth | NextAuth.js v5 | Battle-tested, session management, middleware support |
| Styling | Tailwind CSS | Utility-first, fast iteration, design tokens |
| Forms | React Hook Form + Zod | Performant forms with schema validation |
| Data Fetching | TanStack Query (client) + Server Components | Cache, revalidation, optimistic updates |
| Icons | Lucide React | Consistent, tree-shakeable icon set |
| Deployment | Docker + GitHub Actions | Reproducible builds, automated CI/CD |

## ADRs

### ADR-001: Next.js 14 App Router
- **Decision**: Use Next.js 14 with App Router
- **Why**: Combines frontend and API in a single deployment, supports RSC for fast loads, middleware for auth gating
- **Alternatives rejected**: Separate React SPA + Express API (more infrastructure overhead), Remix (smaller ecosystem)

### ADR-002: PostgreSQL + Prisma
- **Decision**: PostgreSQL as the database, Prisma as the ORM
- **Why**: Relational data model fits courts/academies/trainers well; Prisma gives type-safe queries, auto-generated migrations, and schema-as-code
- **Alternatives rejected**: MongoDB (relational data is better suited for SQL), Drizzle (less mature migration tooling)

### ADR-003: NextAuth.js v5 for Authentication
- **Decision**: Use NextAuth.js v5 with Credentials provider
- **Why**: Integrates natively with Next.js middleware, handles session management, supports multiple providers for future expansion
- **Alternatives rejected**: Custom JWT (more code to maintain), Clerk (vendor lock-in, cost), Lucia (less mature)

### ADR-004: Tailwind CSS for Styling
- **Decision**: Tailwind CSS with custom design tokens
- **Why**: Rapid development, consistent spacing/sizing, small bundle with purging, no CSS-in-JS runtime cost
- **Alternatives rejected**: styled-components (runtime cost), CSS Modules (harder to maintain consistency)

### ADR-005: Server-Side Mutations via API Route Handlers
- **Decision**: Use Next.js API Route Handlers for all mutations
- **Why**: Clear separation of concerns, easier to test, consistent REST API surface for potential future mobile admin app
- **Alternatives rejected**: Server Actions (harder to test independently, less discoverable API surface)

## Database Schema (Prisma)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum UserRole {
  SUPER_ADMIN
  OPERATIONS_MANAGER
}

enum EntityStatus {
  ACTIVE
  INACTIVE
}

enum SportType {
  CRICKET
  FOOTBALL
  BASKETBALL
  TENNIS
  BADMINTON
  SWIMMING
  HOCKEY
  VOLLEYBALL
  TABLE_TENNIS
  SQUASH
  OTHER
}

model User {
  id             String    @id @default(cuid())
  email          String    @unique
  name           String
  passwordHash   String
  role           UserRole  @default(OPERATIONS_MANAGER)
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt

  @@map("users")
}

model Court {
  id             String       @id @default(cuid())
  name           String
  sportType      SportType
  description    String?
  address        String
  city           String
  state          String
  pincode        String
  latitude       Float?
  longitude      Float?
  capacity       Int
  pricePerHour   Float
  images         String[]
  amenities      String[]
  openTime       String       // "06:00"
  closeTime      String       // "22:00"
  status         EntityStatus @default(ACTIVE)
  contactPhone   String?
  contactEmail   String?
  createdAt      DateTime     @default(now())
  updatedAt      DateTime     @updatedAt

  @@index([sportType])
  @@index([status])
  @@index([city])
  @@map("courts")
}

model Academy {
  id             String       @id @default(cuid())
  name           String
  description    String?
  sportsOffered  SportType[]
  address        String
  city           String
  state          String
  pincode        String
  latitude       Float?
  longitude      Float?
  contactPhone   String
  contactEmail   String?
  website        String?
  images         String[]
  establishedYear Int?
  status         EntityStatus @default(ACTIVE)
  createdAt      DateTime     @default(now())
  updatedAt      DateTime     @updatedAt

  trainers       AcademyTrainer[]

  @@index([status])
  @@index([city])
  @@map("academies")
}

model Trainer {
  id               String       @id @default(cuid())
  name             String
  email            String?
  phone            String
  sportSpecialization SportType
  experience       Int          // years
  certifications   String[]
  hourlyRate       Float
  bio              String?
  photo            String?
  city             String
  state            String
  status           EntityStatus @default(ACTIVE)
  createdAt        DateTime     @default(now())
  updatedAt        DateTime     @updatedAt

  academies        AcademyTrainer[]

  @@index([sportSpecialization])
  @@index([status])
  @@index([city])
  @@map("trainers")
}

model AcademyTrainer {
  id         String   @id @default(cuid())
  academyId  String
  trainerId  String
  joinedAt   DateTime @default(now())

  academy    Academy  @relation(fields: [academyId], references: [id], onDelete: Cascade)
  trainer    Trainer  @relation(fields: [trainerId], references: [id], onDelete: Cascade)

  @@unique([academyId, trainerId])
  @@map("academy_trainers")
}
```

## API Contracts

### Authentication
| Method | Path | Auth | Request | Response |
|--------|------|------|---------|----------|
| POST | `/api/auth/signin` | No | `{ email, password }` | `{ user, session }` |
| POST | `/api/auth/signout` | Yes | — | `{ success: true }` |
| GET | `/api/auth/session` | Yes | — | `{ user }` |

### Dashboard
| Method | Path | Auth | Request | Response |
|--------|------|------|---------|----------|
| GET | `/api/dashboard/stats` | Yes | — | `{ totalCourts, totalAcademies, totalTrainers, activeCourts, activeAcademies, activeTrainers, recentlyAdded[] }` |

### Courts
| Method | Path | Auth | Request | Response |
|--------|------|------|---------|----------|
| GET | `/api/courts` | Yes | Query: `?search&sportType&status&city&page&limit` | `{ courts[], total, page, totalPages }` |
| GET | `/api/courts/:id` | Yes | — | `{ court }` |
| POST | `/api/courts` | Yes | `{ name, sportType, address, city, state, pincode, capacity, pricePerHour, ... }` | `{ court }` (201) |
| PUT | `/api/courts/:id` | Yes | `{ ...partial court fields }` | `{ court }` |
| PATCH | `/api/courts/:id/status` | Yes | `{ status: "ACTIVE" \| "INACTIVE" }` | `{ court }` |
| DELETE | `/api/courts/:id` | Yes | — | `{ success: true }` |

### Academies
| Method | Path | Auth | Request | Response |
|--------|------|------|---------|----------|
| GET | `/api/academies` | Yes | Query: `?search&sportType&status&city&page&limit` | `{ academies[], total, page, totalPages }` |
| GET | `/api/academies/:id` | Yes | — | `{ academy }` |
| POST | `/api/academies` | Yes | `{ name, sportsOffered[], address, city, state, pincode, contactPhone, ... }` | `{ academy }` (201) |
| PUT | `/api/academies/:id` | Yes | `{ ...partial academy fields }` | `{ academy }` |
| PATCH | `/api/academies/:id/status` | Yes | `{ status: "ACTIVE" \| "INACTIVE" }` | `{ academy }` |
| DELETE | `/api/academies/:id` | Yes | — | `{ success: true }` |

### Trainers
| Method | Path | Auth | Request | Response |
|--------|------|------|---------|----------|
| GET | `/api/trainers` | Yes | Query: `?search&sportType&status&city&page&limit` | `{ trainers[], total, page, totalPages }` |
| GET | `/api/trainers/:id` | Yes | — | `{ trainer }` |
| POST | `/api/trainers` | Yes | `{ name, phone, sportSpecialization, experience, hourlyRate, ... }` | `{ trainer }` (201) |
| PUT | `/api/trainers/:id` | Yes | `{ ...partial trainer fields }` | `{ trainer }` |
| PATCH | `/api/trainers/:id/status` | Yes | `{ status: "ACTIVE" \| "INACTIVE" }` | `{ trainer }` |
| DELETE | `/api/trainers/:id` | Yes | — | `{ success: true }` |

### Error Response Shape
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human-readable message",
    "details": [{ "field": "email", "message": "Invalid email" }]
  }
}
```

### HTTP Status Codes
| Code | Usage |
|------|-------|
| 200 | Successful GET / PUT / PATCH |
| 201 | Successful POST (creation) |
| 400 | Bad request / validation error |
| 401 | Unauthenticated |
| 403 | Unauthorized (wrong role) |
| 404 | Resource not found |
| 500 | Internal server error |
