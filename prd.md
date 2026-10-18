# WorkNest CRM — Product Requirements Document (PRD)

- **Product:** WorkNest CRM
- **Document status:** Initial product specification
- **Version:** 1.0
- **Last updated:** 2026-10-18
- **Audience:** Product, design, frontend, backend, QA, and AI coding agents

## 1. Product summary

WorkNest CRM is a web application for operating co-working spaces. It brings prospect management, workspace tours, memberships, bookings, billing visibility, and member engagement into one operational system.

The product should support the complete customer lifecycle:

**Inquiry → qualification → follow-up → tour → membership conversion → booking and engagement → renewal or churn prevention.**

The first release should prioritize a dependable CRM foundation and a polished, responsive frontend. Do not present mock metrics as real business data.

## 2. Problem statement

Co-working operators may manage inquiries across website forms, phone calls, referrals, social media, and walk-ins. Spreadsheets and disconnected tools make it difficult to:

- Respond to every prospect on time.
- Understand which prospects are likely to convert.
- Coordinate tours and workspace availability.
- Track member status, membership terms, and renewals.
- Monitor bookings, invoices, and outstanding payments.
- Compare performance between locations.
- Maintain a consistent record of customer interactions.

WorkNest CRM should provide a single, permission-controlled source of truth and make the next useful action clear to each staff member.

## 3. Goals

1. Centralize leads and customer contact history.
2. Make the sales pipeline visible and actionable.
3. Help staff schedule and complete follow-ups.
4. Manage members, membership plans, and renewals.
5. Support workspace and meeting-room booking workflows.
6. Provide accurate, explainable operational metrics.
7. Support multiple locations without mixing their data.
8. Provide a responsive, accessible, maintainable interface.
9. Protect customer data through authentication, authorization, and auditing.

## 4. Non-goals for the initial release

- Building a full accounting system or general ledger.
- Storing raw payment-card details.
- Replacing a dedicated access-control or door-entry system.
- Building a native iOS or Android application.
- AI lead scoring or predictive churn models before reliable data exists.
- Complex enterprise resource planning.
- Claiming real-time booking, payment, or notification capabilities before integrations exist.

## 5. Target users and permissions

### 5.1 Workspace owner / organization admin
- Configure organization and locations.
- Invite and deactivate staff.
- Manage roles, plans, workspace inventory, and settings.
- View organization-wide reports and financial summaries.
- Review audit events.

### 5.2 Sales / community team
- Create and qualify leads.
- Record calls, emails, notes, and follow-up tasks.
- Schedule tours and update pipeline status.
- Convert qualified leads into members when permitted.

### 5.3 Front-desk staff
- View relevant member and booking information.
- Check guests in and out when the feature is enabled.
- Create or update bookings according to permissions.
- Avoid access to unrelated financial or administrative data.

### 5.4 Finance staff
- View invoices, payment status, refunds, and outstanding balances.
- Record or reconcile payments only through authorized workflows.
- Do not access payment-provider secrets or raw card data.

### 5.5 Member / prospect (future portal)
- Submit inquiries.
- Request tours and bookings.
- View their own membership, bookings, and invoices.
- Manage consent and communication preferences.

The member-facing portal is a later phase unless explicitly prioritized.

## 6. Product scope and modules

### 6.1 Dashboard / Overview
Display:
- Active members.
- Open leads.
- Tours scheduled for a selected period.
- Revenue collected or recognized, with the definition clearly labelled.
- Lead pipeline by stage.
- Today's and overdue activities.
- Upcoming renewals and booking conflicts where relevant.

Requirements:
- Metrics must come from persisted data and documented business rules.
- Show loading, empty, stale, and error states.
- Include a date-range selector when metrics support it.
- Do not show fabricated trends or unsupported percentage changes.

### 6.2 Lead management
A lead represents a prospective individual or company.

Minimum fields:
- ID.
- Contact name.
- Email and/or phone, with validation.
- Company or profession (optional).
- Interested workspace plan.
- Preferred location.
- Team size (optional).
- Lead source.
- Status.
- Assigned owner.
- Created and updated timestamps.
- Next follow-up date.
- Notes and activity history.
- Consent / communication preferences where applicable.

Initial statuses:
1. New
2. Contacted
3. Tour Booked
4. Converted
5. Lost

Requirements:
- Create, view, edit, search, filter, sort, and archive leads.
- Validate required fields and duplicate candidates.
- Track stage changes and who made them.
- Provide a reason when a lead is marked Lost.
- Support pagination for large lists.
- Convert a lead to a member without creating duplicate contact records.
- Make follow-up ownership and due dates visible.

### 6.3 Activities and follow-ups
Activity types may include call, email, meeting, tour, note, and task.

Requirements:
- Associate each activity with a lead or member and a staff owner.
- Store due date, completion state, and outcome where applicable.
- Highlight overdue activities.
- Allow a user to mark an activity complete.
- Design notifications to be idempotent and respect communication preferences.
- Keep an audit trail for important edits.

### 6.4 Members and memberships
Member fields should include contact information, organization/company, status, linked membership(s), and relevant activity history.

Membership statuses:
- Trial
- Active
- Past Due
- Expiring
- Cancelled
- Expired

Requirements:
- Manage membership plans, pricing, billing interval, capacity/entitlements, and availability.
- Track start date, end/renewal date, and cancellation state.
- Show upcoming renewals and past-due states.
- Keep historical membership records rather than overwriting history.
- Allow authorized users to convert a lead into a member.

### 6.5 Locations and spaces
Location fields:
- Name, address, timezone, operating hours, and status.

Space fields:
- Location.
- Type: hot desk, dedicated desk, private office, meeting room, or other configurable type.
- Capacity.
- Availability state.
- Pricing or booking rules.
- Amenities (optional).
- Active/inactive state.

Requirements:
- All booking times must be interpreted in the location's timezone and stored consistently.
- Availability checks must prevent overlapping confirmed reservations.
- Capacity and membership entitlements must be enforced server-side.
- A location-scoped user must not access another location unless authorized.

### 6.6 Bookings and tours
Booking types may include prospect tours, desks, offices, and meeting rooms.

Requirements:
- Create, view, reschedule, cancel, and check in to bookings according to role.
- Show location, space, date/time, status, attendee/member, and creator.
- Validate duration, opening hours, capacity, and conflicts.
- Handle concurrent booking attempts safely on the server/database.
- Keep cancellation and rescheduling history.
- Send confirmations only after the booking is successfully persisted.

### 6.7 Payments and invoices
Requirements:
- Display invoice amount, currency, issue/due dates, status, and related member/membership.
- Support statuses such as Draft, Open, Paid, Partially Paid, Overdue, Void, and Refunded where appropriate.
- Integrate a payment provider rather than storing card data.
- Verify payment webhooks and make webhook processing idempotent.
- Reconcile displayed totals with defined financial rules.
- Restrict financial access by role and location/organization scope.

### 6.8 Settings and administration
- Organization profile and locations.
- Staff users and roles.
- Membership plans and space types.
- Notification and communication settings.
- Audit-log access for authorized administrators.

### 6.9 Search and notifications
- Search should respect the user's permissions and selected organization/location.
- Notifications may cover new leads, overdue follow-ups, upcoming tours, booking changes, overdue invoices, and renewals.
- Provide a notification preference mechanism.
- Do not expose private customer data in notification previews unnecessarily.

## 7. Primary user journeys

### Journey A: New inquiry to tour
1. Staff creates a lead or a website form creates one through a validated API.
2. The lead is assigned to a staff member.
3. Staff records contact attempts and schedules a follow-up.
4. Staff books a tour.
5. The system confirms the tour only after persistence succeeds.
6. Staff records the tour outcome and updates the lead stage.

### Journey B: Lead conversion
1. Staff reviews a qualified prospect.
2. Staff confirms contact details, selected plan, location, and intended start date.
3. The system converts the lead using a transaction-safe operation.
4. A member and membership record are created or linked without duplicates.
5. The lead is marked Converted and the action is audited.

### Journey C: Member booking
1. Authorized staff selects a location, space, date, and time.
2. The system checks opening hours, capacity, entitlements, and conflicts.
3. The reservation is persisted atomically.
4. The user receives a confirmation.
5. Changes and cancellations update availability and preserve history.

### Journey D: Renewal follow-up
1. The dashboard identifies memberships approaching renewal.
2. An authorized staff member reviews the member and payment status.
3. A follow-up task or approved notification is created.
4. Renewal, cancellation, or expiry is recorded and reflected in reporting.

## 8. Functional requirements

- **FR-01:** Users can authenticate and sign out securely.
- **FR-02:** Every protected API request is authorized server-side.
- **FR-03:** Users can view only records within their organization and permitted locations.
- **FR-04:** Authorized users can create and manage leads.
- **FR-05:** Lead filters, search, and pagination work together correctly.
- **FR-06:** Lead stage transitions are validated and audited.
- **FR-07:** Users can create, assign, complete, and review follow-up activities.
- **FR-08:** Authorized users can manage members and memberships.
- **FR-09:** Booking creation prevents conflicting confirmed reservations.
- **FR-10:** Financial summaries use documented definitions and persisted records.
- **FR-11:** Dashboard metrics are derived from the same source of truth as module records.
- **FR-12:** UI actions provide clear success, validation, empty, loading, and error feedback.
- **FR-13:** The interface is usable on mobile, tablet, and desktop.
- **FR-14:** Important changes have audit events.
- **FR-15:** Destructive actions require confirmation and enforce permissions.

## 9. Non-functional requirements

### Performance
- Keep common list and dashboard interactions responsive under normal expected load.
- Use server-side pagination and filtering for growing datasets.
- Avoid repeated API requests and unnecessary component re-renders.
- Set measurable performance budgets after baseline profiling.

### Accessibility
- Target WCAG 2.2 AA.
- Support keyboard navigation and visible focus.
- Associate form labels and validation messages with their controls.
- Use semantic headings, tables, and buttons.
- Do not rely on color alone to communicate state.
- Respect reduced-motion preferences.

### Security and privacy
- Enforce authorization on the backend, not only in the UI.
- Validate input server-side and use parameterized database queries.
- Store secrets in environment variables or a secret manager; never commit them.
- Use secure session/cookie settings or a well-reviewed token strategy.
- Apply rate limits to authentication and public inquiry endpoints.
- Protect against CSRF where applicable, XSS, injection, IDOR, and insecure direct object access.
- Minimize personal data collection and define retention/deletion policies.
- Use verified, signed payment webhooks.
- Keep logs free of passwords, tokens, payment secrets, and unnecessary personal data.

### Reliability and observability
- Provide structured server logs and actionable error responses.
- Add database backups and a tested restore procedure before production.
- Monitor failed jobs, webhook retries, API errors, and booking conflicts.
- Make retryable operations idempotent where appropriate.

### Maintainability
- Use TypeScript strict mode.
- Separate UI, domain logic, API access, and persistence.
- Add automated tests for business-critical workflows.
- Document environment setup, migrations, and deployment steps.

## 10. UX and visual direction

Brand direction:
- Product name: WorkNest.
- Visual tone: calm, modern, community-oriented, professional.
- Primary color: deep forest green (`#20382F`).
- Surfaces: warm off-white (`#F7F8F6`) and white.
- Use muted, distinct status colors with adequate contrast.
- Use consistent spacing, clear typography, restrained shadows, and rounded cards.
- Prioritize information hierarchy and task completion over decoration.

Interface principles:
- Desktop: persistent sidebar and spacious dashboard.
- Mobile: collapsible navigation and responsive stacked cards.
- Tables: searchable/filterable, horizontally usable on narrow screens, with an explicit empty state.
- Forms: concise labels, inline validation, helpful defaults, and clear save/cancel actions.
- Destructive actions: confirmation plus clear consequences.
- Every visible control must work or be explicitly presented as disabled/coming soon.

## 11. Recommended technical architecture

### Frontend
- Next.js with the App Router and React.
- TypeScript with strict mode.
- Tailwind CSS.
- Lucide React icons.
- React Server Components for server-rendered, primarily read-only UI where appropriate.
- Client Components for interactive tables, filters, dialogs, and forms.
- TanStack Query when client-side caching, refetching, or mutation coordination provides value.
- A form library and Zod for client-side form validation where useful; all input must still be validated by the backend.
- Vitest and React Testing Library for component and frontend logic tests.

### Backend
- Python with FastAPI for the REST API.
- Pydantic for request/response schemas and validation.
- PostgreSQL for relational data.
- SQLAlchemy 2.x for database access and Alembic for migrations, unless an existing repository convention dictates otherwise.
- Backend-enforced authentication and role-based authorization.
- Background jobs for reminders and notifications when required; select a queue/scheduler only when the use case is defined.
- A payment provider integration for checkout and verified webhooks.

### Application boundary
- Treat Next.js as the web frontend and Python/FastAPI as the authoritative business API.
- The browser communicates with the FastAPI API over HTTPS.
- Keep business rules, permission checks, booking conflict prevention, payment state transitions, and authoritative validation in the Python backend.
- Next.js Server Components may call the backend for server-rendered data, but must not bypass backend authorization or duplicate domain rules.
- Do not build a second competing business API in Next.js Route Handlers. Use Next.js Route Handlers only for frontend-specific needs such as a carefully designed proxy/BFF or webhooks that explicitly belong there.
- Keep API base URLs and secrets in server-only environment variables. Any `NEXT_PUBLIC_` variable is exposed to the browser and must not contain secrets.

### Suggested repository organization
```text
worknest-crm/
  apps/
    web/                         # Next.js frontend
      src/
        app/                     # App Router pages, layouts, route groups
        components/
          layout/
          ui/
        features/
          dashboard/
          leads/
          activities/
          members/
          memberships/
          locations/
          spaces/
          bookings/
          payments/
          settings/
        lib/                     # frontend helpers and API client
        types/
      public/
    api/                         # Python/FastAPI backend
      app/
        main.py
        api/v1/                   # versioned route modules
        core/                     # settings, security, dependencies
        models/                   # database models
        schemas/                  # Pydantic request/response schemas
        services/                 # business logic
        repositories/             # persistence queries, if useful
        db/                       # session and migrations setup
      tests/
      alembic/
      pyproject.toml
  docs/
  AGENTS.md
  prd.md
```

### Domain model principles
- Use stable IDs and timestamps.
- Model organization and location boundaries explicitly.
- Keep leads, contacts, members, memberships, bookings, invoices, and payments as distinct but related concepts.
- Use transactions for conversion and booking workflows.
- Add database constraints for invariants that must hold under concurrency.
- Use decimal-safe numeric types for money; never use floating-point arithmetic for financial totals.
- Store timestamps consistently and display them in the relevant location/user timezone.
- Keep historical records for financial and membership events.

## 12. API outline (initial proposal)

Examples only; final endpoint naming should follow the implemented conventions.

- `GET /api/v1/dashboard/summary`
- `GET /api/v1/leads`
- `POST /api/v1/leads`
- `GET /api/v1/leads/:id`
- `PATCH /api/v1/leads/:id`
- `POST /api/v1/leads/:id/activities`
- `POST /api/v1/leads/:id/convert`
- `GET /api/v1/members`
- `GET /api/v1/memberships`
- `GET /api/v1/locations`
- `GET /api/v1/spaces/availability`
- `POST /api/v1/bookings`
- `PATCH /api/v1/bookings/:id`
- `POST /api/v1/bookings/:id/cancel`
- `GET /api/v1/invoices`
- `GET /api/v1/notifications`

All endpoints must authenticate as needed, authorize every record access, validate input, return consistent error structures, and document pagination/filter conventions.

## 13. Acceptance criteria for the initial usable release

- [ ] A user can sign in and see only authorized organization/location data.
- [ ] Dashboard numbers are backed by persisted records and definitions are documented.
- [ ] A lead can be created, edited, searched, filtered, and viewed after refresh.
- [ ] Lead status transitions persist and are audited.
- [ ] Follow-up activities can be assigned, completed, and shown as overdue.
- [ ] A lead can be converted into a member without duplicate records.
- [ ] Booking availability is checked server-side and conflicting bookings are rejected.
- [ ] Invoices and payment statuses are linked to the appropriate member/membership.
- [ ] Forms have accessible labels and actionable validation errors.
- [ ] Empty, loading, error, and success states are implemented.
- [ ] Critical flows have automated tests.
- [ ] Secrets are not committed, and setup instructions are documented.
- [ ] Mobile and desktop layouts are verified.
- [ ] Backup, restore, and basic production monitoring are documented before launch.

## 14. Delivery phases

### Phase 1 — Frontend foundation
- Establish app shell, design tokens, navigation, and responsive layout.
- Build dashboard with clearly labelled demo data.
- Implement lead table, search/filter, add/edit form, and status updates.
- Add linting, formatting, and basic component tests.

### Phase 2 — Persistent CRM foundation
- Add authentication, users, roles, database migrations, and API client.
- Persist leads and activities.
- Implement server-side search/filter/pagination and audit events.
- Replace all mock dashboard metrics.

### Phase 3 — Members and memberships
- Build member profiles, plan management, conversion, renewals, and cancellation workflows.

### Phase 4 — Booking operations
- Model locations/spaces, availability, tours, bookings, check-in, and conflict prevention.

### Phase 5 — Billing and automation
- Add invoices, payment-provider integration, webhook verification, reminders, and renewal alerts.

### Phase 6 — Analytics and production hardening
- Add conversion, occupancy, revenue, and churn reporting.
- Complete security review, accessibility checks, load testing, monitoring, backups, and restore drills.

## 15. Product decisions and open questions

The following should be resolved before production implementation:
- Is the initial deployment for one operator or a multi-tenant SaaS serving independent operators?
- Which authentication provider or session strategy will be used?
- Which payment provider and currencies are required?
- Are member self-service and public booking included in the first release?
- Are bookings charged per hour, day, membership entitlement, or a combination?
- Which channels should be supported for email/SMS/WhatsApp notifications, and what consent is required?
- What are the exact definitions for revenue, occupancy, active member, and conversion?
- Which data-retention and privacy policies apply to the operating jurisdictions?

Until these are decided, use configurable interfaces and explicit assumptions rather than hard-coding business rules.
