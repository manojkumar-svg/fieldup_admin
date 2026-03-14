# PRD: FieldUp Partner Onboarding
**Version**: 1.0 | **Status**: Approved

## Problem Statement
FieldUp needs a structured onboarding process to capture and manage partner registrations (Venues/Courts, Coaches/Trainers, Academies). Currently there is no self-service intake — partners must be manually entered by admins. A multi-section onboarding form captures high-intent data from partners so that admins can review, approve/reject, and convert them into active entities.

## Target Users
| Persona | Description | Primary Goal |
|---------|-------------|-------------|
| Operations Manager | Internal FieldUp team member reviewing applications | Review, approve/reject partner applications efficiently |
| Super Admin | Platform administrator | Oversee the entire onboarding pipeline, configure settings |

## Goals & Success Metrics
| Goal | Metric | Target |
|------|--------|--------|
| Streamline partner intake | Time to onboard a partner | < 5 minutes to review |
| Data completeness | % of required fields filled | 100% on submission |
| Pipeline visibility | Applications in each status | Real-time dashboard |

## User Stories — MVP

### Public Onboarding Form
- As a partner, I want to fill a multi-section form so that I can register with FieldUp
- As a partner, I want to select my partner type (Venue, Coach, Academy) so that relevant sections appear
- As a partner, I want to upload certifications and ID proof so that FieldUp can verify me
- As a partner, I want to accept the terms agreement before submitting

### Admin Review
- As an admin, I want to see all onboarding applications in a list with status filters
- As an admin, I want to view full application details to review a partner's submission
- As an admin, I want to approve an application so the partner becomes active
- As an admin, I want to reject an application with a reason
- As an admin, I want to see onboarding stats on the dashboard

## Out of Scope (v1)
- Email notifications to partners on approval/rejection
- Partner self-service portal (login and edit their profile)
- Automated KYC verification
- Commission calculator integration
- Stripe/payment integration

## Sections (from Google Form structure)
| Section | Fields | Applies To |
|---------|--------|------------|
| 1. Basic Details | Partner type, name, contact person, phone, email, city, address, maps link | All |
| 2. Sports & Services | Sports offered, experience, certifications, bio | All |
| 3. Facility/Training | Courts count, surface type, facilities OR session types, max students | Venue / Coach |
| 4. Availability | Available days, operating hours, slot duration | All |
| 5. Pricing | Price per slot, weekend pricing different, cancellation allowed | All |
| 6. Payment & Legal | Payment method (cash), bank details, GST, ID proof, photos | All |
| 7. Agreement | Terms acceptance | All |

## Screens
| Screen | Purpose | Key Actions |
|--------|---------|-------------|
| /onboarding | Public multi-step form | Fill sections, upload, submit |
| /onboarding/success | Confirmation page | Show submission ID |
| /dashboard/onboarding | Admin list of applications | Filter, search, view |
| /dashboard/onboarding/[id] | Application detail view | Review, approve, reject |

## Non-Functional Requirements
| Concern | Requirement |
|---------|-------------|
| Auth | Public form (no login), admin review behind auth |
| Scale | ~100 applications/month initially |
| Validation | All required fields validated client + server side |

## Definition of Done
- [ ] Public multi-step onboarding form with all 7 sections
- [ ] Conditional sections based on partner type
- [ ] Admin list page with filters (status, partner type, city)
- [ ] Admin detail view with approve/reject actions
- [ ] Dashboard stats include onboarding counts
- [ ] All form validations working
- [ ] Sports list includes all 40+ sports from requirement
