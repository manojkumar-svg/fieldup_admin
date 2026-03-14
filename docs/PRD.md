# PRD: Field Up Admin
**Version**: 1.0 | **Status**: Approved

## Problem Statement
Sports facility owners, academy operators, and independent trainers lack a centralized platform to register and manage their offerings. Field Up Admin solves this by giving administrators a single dashboard to onboard and manage sports courts, academies, and trainers — making them discoverable and bookable by end users on the Field Up consumer app.

## Target Users
| Persona | Description | Primary Goal |
|---------|-------------|-------------|
| Super Admin | Platform operator who manages the entire Field Up ecosystem | Onboard and oversee all courts, academies, and trainers |
| Operations Manager | Staff member handling day-to-day onboarding | Add new entities, verify details, toggle availability |

## Goals & Success Metrics
| Goal | Metric | Target |
|------|--------|--------|
| Streamline onboarding | Avg time to onboard a new entity | < 5 minutes |
| Data completeness | % of entities with all required fields filled | > 95% |
| Admin efficiency | Entities managed per admin per day | 20+ |
| System reliability | Uptime | 99.5% |

## User Stories — MVP
- As an admin, I want to log in securely so that only authorized users can manage the platform
- As an admin, I want to see a dashboard overview so that I can monitor total courts, academies, and trainers at a glance
- As an admin, I want to add a new sports court with details (name, sport type, location, capacity, pricing, images, availability) so that it appears on the consumer app
- As an admin, I want to view all sports courts in a searchable, filterable table so that I can find and manage them quickly
- As an admin, I want to edit a sports court's details so that information stays accurate
- As an admin, I want to activate/deactivate a sports court so that unavailable courts are hidden from consumers
- As an admin, I want to delete a sports court so that permanently closed facilities are removed
- As an admin, I want to add a new academy with details (name, sports offered, location, contact, description, images) so that it is listed for consumers
- As an admin, I want to view, edit, activate/deactivate, and delete academies
- As an admin, I want to add a new trainer with details (name, sport specialization, experience, certifications, hourly rate, bio, photo) so that they are available for booking
- As an admin, I want to view, edit, activate/deactivate, and delete trainers
- As an admin, I want to search and filter entities by name, sport type, status, and location
- As an admin, I want to see confirmation dialogs before destructive actions so that I don't accidentally delete data
- As an admin, I want to log out securely

## Out of Scope (v1)
- Consumer-facing booking interface
- Payment processing / billing
- Push notifications
- Multi-tenant / multi-organization support
- Reporting and analytics dashboards
- Trainer scheduling / calendar management
- Review and rating system
- Mobile app (admin is desktop-first)
- Bulk import via CSV/Excel

## Screens
| Screen | Purpose | Key Actions |
|--------|---------|-------------|
| Login | Authenticate admin | Enter email + password, submit |
| Dashboard | Overview of platform stats | View counts, quick-add links |
| Courts List | Browse all courts | Search, filter, sort, paginate |
| Court Form | Add / Edit a court | Fill details, upload images, save |
| Academies List | Browse all academies | Search, filter, sort, paginate |
| Academy Form | Add / Edit an academy | Fill details, upload images, save |
| Trainers List | Browse all trainers | Search, filter, sort, paginate |
| Trainer Form | Add / Edit a trainer | Fill details, upload photo, save |

## Non-Functional Requirements
| Concern | Requirement |
|---------|-------------|
| Auth | Email + password with bcrypt hashing |
| Scale | ~50 admins, ~10,000 entities at launch |
| Latency | p95 < 500ms for all API calls |
| Browser support | Chrome, Firefox, Safari (latest 2 versions) |
| Accessibility | WCAG 2.1 AA compliance |
| Security | OWASP Top 10 mitigations |

## Definition of Done
- [ ] All MVP user stories implemented
- [ ] All tests passing
- [ ] Zero critical security findings
- [ ] Deployed and health check passing
