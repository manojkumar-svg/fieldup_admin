# Design Spec: Field Up Admin

## User Flows

### Login Flow
```
[Login Page] ──enter credentials──▶ [Validate] ──success──▶ [Dashboard]
                                        │
                                        └──fail──▶ [Show Error on Login Page]
```

### Court Onboarding Flow
```
[Dashboard] ──click "Add Court"──▶ [Court Form (empty)]
    │                                    │
    │                               fill details
    │                                    │
    │                               ──save──▶ [Validate]
    │                                           │      │
    │                                        success   fail
    │                                           │      │
    │                                    [Courts List] [Show errors on form]
    │
    └──click "Courts" in sidebar──▶ [Courts List]
                                        │
                                   click row──▶ [Court Form (prefilled)]
                                        │              │
                                   toggle status   edit + save
                                        │              │
                                   [Update status] [Validate + Save]
                                        │
                                   click delete──▶ [Confirm Dialog]──yes──▶ [Delete + Refresh]
                                                        │
                                                       no──▶ [Close Dialog]
```

### Academy Onboarding Flow
```
[Dashboard / Sidebar] ──▶ [Academies List] ──▶ [Academy Form] ──▶ [Save/Validate]
```
(Same CRUD pattern as Courts)

### Trainer Onboarding Flow
```
[Dashboard / Sidebar] ──▶ [Trainers List] ──▶ [Trainer Form] ──▶ [Save/Validate]
```
(Same CRUD pattern as Courts)

## Screens

### Login — Route: /login
**Layout**:
```
┌──────────────────────────────────────────────┐
│                                              │
│          ┌───────────────────────┐           │
│          │    🏟️ Field Up Admin   │           │
│          │                       │           │
│          │  Email                │           │
│          │  ┌─────────────────┐  │           │
│          │  │                 │  │           │
│          │  └─────────────────┘  │           │
│          │                       │           │
│          │  Password             │           │
│          │  ┌─────────────────┐  │           │
│          │  │                 │  │           │
│          │  └─────────────────┘  │           │
│          │                       │           │
│          │  ┌─────────────────┐  │           │
│          │  │    Sign In      │  │           │
│          │  └─────────────────┘  │           │
│          │                       │           │
│          └───────────────────────┘           │
│                                              │
└──────────────────────────────────────────────┘
```
**Components**: Logo, Input (email), Input (password), Button (primary)
**States**: Default | Loading (spinner on button) | Error (red alert above form)
**Interactions**: Submit → validate → redirect to /dashboard
**Data needed**: POST /api/auth/signin

### Dashboard — Route: /dashboard
**Layout**:
```
┌─────────────────────────────────────────────────────────────┐
│ ┌──────────┐  ┌────────────────────────────────────────────┐│
│ │ SIDEBAR  │  │ Dashboard                           [User]││
│ │          │  │                                            ││
│ │ Dashboard│  │ ┌──────────┐ ┌──────────┐ ┌──────────┐   ││
│ │ Courts   │  │ │ Courts   │ │Academies │ │ Trainers │   ││
│ │ Academies│  │ │   156    │ │    42    │ │    89    │   ││
│ │ Trainers │  │ │ 140 actv │ │ 38 actv  │ │ 80 actv  │   ││
│ │          │  │ └──────────┘ └──────────┘ └──────────┘   ││
│ │          │  │                                            ││
│ │          │  │ Recently Added                             ││
│ │          │  │ ┌────────────────────────────────────────┐ ││
│ │          │  │ │ Name       │ Type    │ Date   │ Status│ ││
│ │          │  │ │ ABC Court  │ Court   │ Mar 1  │ Active│ ││
│ │          │  │ │ XYZ Acad.  │Academy  │ Feb 28 │ Active│ ││
│ │          │  │ │ John D.    │Trainer  │ Feb 27 │ Active│ ││
│ │          │  │ └────────────────────────────────────────┘ ││
│ │          │  │                                            ││
│ │ ──────── │  │ Quick Actions                              ││
│ │ Logout   │  │ [+ Add Court] [+ Add Academy] [+ Add Trainer] ││
│ └──────────┘  └────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```
**Components**: Sidebar, StatCard (x3), DataTable (recent), Button (quick actions)
**States**: Loading (skeleton cards + table) | Error (error state) | Success (data shown)
**Interactions**: Click stat card → navigate to list; Click quick action → navigate to form
**Data needed**: GET /api/dashboard/stats

### Courts List — Route: /dashboard/courts
**Layout**:
```
┌──────────┬──────────────────────────────────────────────────┐
│ SIDEBAR  │ Courts                          [+ Add Court]   │
│          │                                                  │
│          │ ┌─────────────┐ ┌────────┐ ┌────────┐          │
│          │ │ Search...   │ │Sport ▼ │ │Status ▼│          │
│          │ └─────────────┘ └────────┘ └────────┘          │
│          │                                                  │
│          │ ┌────────────────────────────────────────────┐   │
│          │ │ Name    │ Sport  │ City  │ Price │ Status │   │
│          │ │─────────│────────│───────│───────│────────│   │
│          │ │ Court A │Cricket │Mumbai │ ₹500  │ 🟢    │   │
│          │ │ Court B │Tennis  │Delhi  │ ₹800  │ 🟢    │   │
│          │ │ Court C │Football│Pune   │ ₹600  │ 🔴    │   │
│          │ └────────────────────────────────────────────┘   │
│          │                                                  │
│          │ Showing 1-10 of 156      [◀ Prev] [Next ▶]     │
└──────────┴──────────────────────────────────────────────────┘
```
**Components**: SearchInput, Select (sport filter), Select (status filter), DataTable, Pagination, Button (add), StatusBadge
**States**: Loading (skeleton table) | Empty ("No courts found" + CTA) | Error | Success
**Interactions**: Search → debounced filter; Click row → edit form; Toggle status inline; Delete → confirm dialog
**Data needed**: GET /api/courts?search&sportType&status&page&limit

### Court Form — Route: /dashboard/courts/new & /dashboard/courts/[id]/edit
**Layout**:
```
┌──────────┬──────────────────────────────────────────────────┐
│ SIDEBAR  │ ← Back to Courts                                │
│          │ Add New Court / Edit Court                        │
│          │                                                  │
│          │ ┌─General Info────────────────────────────────┐  │
│          │ │ Name           [________________]           │  │
│          │ │ Sport Type     [▼ Select sport ]            │  │
│          │ │ Description    [________________]           │  │
│          │ │                [________________]           │  │
│          │ └────────────────────────────────────────────┘  │
│          │                                                  │
│          │ ┌─Location───────────────────────────────────┐  │
│          │ │ Address        [________________]           │  │
│          │ │ City           [________] State [________]  │  │
│          │ │ Pincode        [________]                   │  │
│          │ └────────────────────────────────────────────┘  │
│          │                                                  │
│          │ ┌─Details────────────────────────────────────┐  │
│          │ │ Capacity       [____]                       │  │
│          │ │ Price/Hour     [____]                       │  │
│          │ │ Open Time      [____]  Close Time [____]    │  │
│          │ │ Amenities      [tag input area]             │  │
│          │ │ Contact Phone  [____________]               │  │
│          │ │ Contact Email  [____________]               │  │
│          │ └────────────────────────────────────────────┘  │
│          │                                                  │
│          │         [Cancel]  [Save Court]                   │
└──────────┴──────────────────────────────────────────────────┘
```
**Components**: Input, Select, Textarea, TagInput, Button (primary + ghost), FormSection (card)
**States**: Pristine | Dirty | Submitting | Validation errors | Success (toast + redirect)
**Interactions**: Fill form → validate on blur → submit → show toast → redirect to list
**Data needed**: POST /api/courts (new) or PUT /api/courts/:id (edit); GET /api/courts/:id (edit prefill)

### Academies List — Route: /dashboard/academies
(Same layout pattern as Courts List)
**Columns**: Name | Sports Offered | City | Contact | Status
**Data needed**: GET /api/academies?search&sportType&status&page&limit

### Academy Form — Route: /dashboard/academies/new & /dashboard/academies/[id]/edit
**Fields**: Name, Description, Sports Offered (multi-select), Address, City, State, Pincode, Contact Phone, Contact Email, Website, Established Year
**Data needed**: POST /api/academies or PUT /api/academies/:id

### Trainers List — Route: /dashboard/trainers
(Same layout pattern as Courts List)
**Columns**: Name | Sport | Experience | Hourly Rate | City | Status
**Data needed**: GET /api/trainers?search&sportType&status&page&limit

### Trainer Form — Route: /dashboard/trainers/new & /dashboard/trainers/[id]/edit
**Fields**: Name, Email, Phone, Sport Specialization (select), Experience (years), Certifications (tags), Hourly Rate, Bio, City, State
**Data needed**: POST /api/trainers or PUT /api/trainers/:id

## Component Inventory

### Base UI Components
| Component | Variants | Sizes | States |
|-----------|----------|-------|--------|
| Button | primary, secondary, ghost, destructive | sm, md, lg | default, hover, active, disabled, loading |
| Input | text, email, password, number, tel | sm, md | default, focus, error, disabled |
| Textarea | default | sm, md | default, focus, error, disabled |
| Select | single, multi | sm, md | default, open, error, disabled |
| Card | default, bordered | — | default |
| Badge | success, warning, error, info | sm, md | — |
| Skeleton | text, card, table-row | — | pulsing |
| Modal | default | sm, md, lg | open, closed |
| Toast | success, error, warning, info | — | entering, visible, exiting |
| EmptyState | default | — | — |
| ErrorState | default | — | — |
| Sidebar | default | — | collapsed, expanded |
| DataTable | default | — | loading, empty, error, data |
| Pagination | default | — | — |
| SearchInput | default | — | default, active |
| TagInput | default | — | default, focus |
| FormSection | default | — | — |
| StatusBadge | active, inactive | — | — |

### Feature Components
| Component | Purpose |
|-----------|---------|
| StatCard | Dashboard stat display with icon + count + subtitle |
| CourtForm | Complete court creation/edit form |
| AcademyForm | Complete academy creation/edit form |
| TrainerForm | Complete trainer creation/edit form |
| EntityTable | Reusable data table for courts/academies/trainers |
| ConfirmDialog | "Are you sure?" modal for destructive actions |
| PageHeader | Page title + breadcrumb + action button |

## Interaction Patterns

### Form Submission
1. User fills form fields
2. Validation runs on blur for each field (inline errors)
3. User clicks Submit → full validation runs
4. If invalid → scroll to first error, show red borders + messages
5. If valid → show loading spinner on button, disable form
6. On success → show success toast, redirect to list page
7. On error → show error toast with message, re-enable form

### Table Actions
1. Search → debounced 300ms, resets to page 1
2. Filter change → resets to page 1, fetches new data
3. Row click → navigate to edit form
4. Status toggle → inline PATCH, optimistic update, toast confirmation
5. Delete → open ConfirmDialog → on confirm → DELETE API → remove row → toast

### Toasts
- Auto-dismiss after 5 seconds
- Stack from top-right
- Max 3 visible at once
