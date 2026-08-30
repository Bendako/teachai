# TeachAI v2 — Product and Security Specification

- **Status:** Approved
- **Date:** 2026-08-30
- **Approved by user:** 2026-08-30
- **Repository:** `Bendako/teachai`
- **Related task:** `OTSK-20260830-C2F176`
- **Decision:** TeachAI v2 supports teachers across subjects; the initial market is independent teachers and small teaching businesses.

## 1. Problem Statement

Teachers routinely manage lesson preparation, student information, attendance, notes, assignments, progress, parent communication, and preparation for the next lesson across disconnected documents, messaging apps, calendars, and memory.

The existing TeachAI codebase attempts to combine these activities, but it is hard-coded for English instruction, lacks verified tenant isolation, has no automated tests or CI, contains placeholder integrations, and publicly advertises capabilities and traction that are not verified.

The user needs TeachAI to become a trustworthy teaching operations system that:

1. works across subjects rather than only English;
2. shortens preparation and post-lesson administration;
3. preserves teacher judgment and approval;
4. tracks progress using subject-specific objectives and evidence;
5. safely handles learner and guardian information;
6. can evolve from solo teachers to small teaching businesses without becoming a school SIS/LMS in the first release.

## 2. Product Vision

TeachAI is the operational workspace for the complete teaching cycle:

`Plan → Teach → Capture Outcome → Observe Progress → Approve Follow-up → Share → Prepare Next Lesson`

The product should help a teacher answer five questions quickly:

1. What am I teaching today?
2. What does this Learner or Group need next?
3. What happened in the previous Lesson?
4. What follow-up is waiting for my approval?
5. How is the Learner progressing against explicit Learning Objectives?

TeachAI may use AI to prepare drafts and recommendations. AI never becomes the source of truth for attendance, assessment, progress, or external communication without teacher Approval.

## 3. Target Users

### 3.1 Initial primary user

An independent teacher or tutor who:

- teaches one or more Subjects;
- works with individual Learners and optionally small Groups;
- prepares recurring Lessons;
- tracks informal or rubric-based progress;
- assigns follow-up work;
- communicates with Learners or Guardians;
- currently uses a mix of calendar, notes, spreadsheets, documents, email, and messaging apps.

### 3.2 Initial secondary user

A small teaching business Owner or Admin who coordinates several Teachers and needs:

- shared Workspace administration;
- Member roles;
- Learner and Group ownership;
- visibility into operational status;
- templates and standards;
- controlled access to sensitive information.

### 3.3 Deferred users

- schools and districts requiring SIS/LMS replacement;
- universities;
- students requiring a full authenticated learning portal;
- guardians requiring a dedicated application;
- administrators requiring formal report cards, procurement, timetabling, or government integrations.

## 4. Product Principles

1. **Teacher authority:** AI proposes; the teacher decides.
2. **Default deny:** access is granted by verified Workspace membership and role, never by possession of a record ID.
3. **Evidence over opaque scores:** progress is built from dated observations against Learning Objectives.
4. **Subject-agnostic core:** English is a template, not a privileged domain.
5. **Fast after-Lesson capture:** the highest-frequency administrative flow must be mobile-friendly and concise.
6. **Truthful product claims:** public marketing describes only implemented, verified behavior.
7. **Data minimization:** collect only information required for the teaching workflow.
8. **Accessible by default:** Hebrew RTL and English are first-class; keyboard and screen-reader use are part of acceptance.
9. **Explicit lifecycle:** Lessons, communications, assignments, and automations have visible states.
10. **No hidden automation:** every automated result has provenance, status, and failure evidence.

## 5. User Stories

### Workspace and identity

1. As an Owner, I want to create a Workspace, so that my teaching data has a clear private boundary.
2. As an Owner, I want to invite a Member as an Admin or Teacher, so that I can operate a small teaching business.
3. As an Owner, I want to remove a Member, so that former staff lose access immediately.
4. As an Admin, I want to see Members and roles, so that access remains understandable.
5. As a Teacher, I want the system to derive my identity from authentication, so that I never need to select or submit my own authority ID.
6. As a Member of multiple Workspaces, I want to switch context explicitly, so that records cannot be mixed accidentally.

### Learners, Guardians, and Groups

7. As a Teacher, I want to create a Learner with minimal information, so that I can begin planning without unnecessary data collection.
8. As a Teacher, I want to add optional Guardian contact details and communication preferences, so that follow-up goes to the right person.
9. As an Admin, I want to assign a Learner or Group to one or more Teachers, so that access follows teaching responsibility.
10. As a Teacher, I want to create a Group and enroll Learners, so that I can manage group Lessons without duplicating records.
11. As a Teacher, I want to archive a Learner without deleting history, so that records remain coherent.
12. As an authorized Member, I want to export or delete a Learner's data through a controlled workflow, so that privacy requests can be fulfilled.

### Subjects, objectives, and rubrics

13. As a Teacher, I want to create or select a Subject, so that the system reflects what I teach.
14. As a Teacher, I want to use a built-in Subject template, so that I do not start from a blank page.
15. As a Teacher, I want to define Learning Objectives, so that Lessons and progress share a common language.
16. As a Teacher, I want to organize objectives within an optional Curriculum Framework, so that I can align teaching to an external or personal syllabus.
17. As a Teacher, I want to define a Rubric, so that evidence can be described appropriately for the Subject.
18. As a Teacher, I want different Subjects to use different Rubrics, so that math, music, English, and programming are not forced into one scoring model.

### Lesson planning and scheduling

19. As a Teacher, I want to schedule a Lesson for a Learner or Group, so that my teaching calendar is organized.
20. As a Teacher, I want to create a Lesson Plan manually, so that AI is optional.
21. As a Teacher, I want to reuse a template, so that recurring preparation is faster.
22. As a Teacher, I want an AI draft grounded in prior confirmed outcomes and selected objectives, so that the plan reflects actual history.
23. As a Teacher, I want to review and edit an AI draft before using it, so that I remain accountable for the plan.
24. As a Teacher, I want a Lesson Plan to show objectives, activities, timing, materials, and assignment, so that it is executable during teaching.
25. As a Teacher, I want plan versions, so that edits do not destroy the record of what was prepared.
26. As a Teacher, I want to cancel or reschedule a Lesson without losing history, so that operational changes are auditable.

### Teaching and post-Lesson capture

27. As a Teacher, I want to start a scheduled Lesson, so that the system enters an active teaching state.
28. As a Teacher, I want to record attendance, so that completed and missed Lessons are distinguishable.
29. As a Teacher, I want a mobile-friendly post-Lesson form, so that I can complete administration immediately.
30. As a Teacher, I want to record content covered, notes, assignments, and next focus, so that the next Lesson has reliable context.
31. As a Teacher, I want to attach observations to Learning Objectives, so that progress is evidence-based.
32. As a Teacher, I want the post-Lesson record to remain a draft until I confirm it, so that accidental input is not treated as official.
33. As a Teacher, I want incomplete post-Lesson records shown on Today's screen, so that administration is not forgotten.
34. As a Teacher, I want to reopen a confirmed outcome through an audited correction flow, so that mistakes can be fixed without silently rewriting history.

### Progress

35. As a Teacher, I want a chronological Learner timeline, so that Lessons, observations, assignments, and communications are visible together.
36. As a Teacher, I want to filter progress by Subject and objective, so that unrelated evidence is not combined.
37. As a Teacher, I want to see the evidence behind a Progress Snapshot, so that summaries are explainable.
38. As a Teacher, I want AI-suggested interpretations labelled clearly, so that they are not confused with teacher observations.
39. As a Teacher, I want to compare recent and earlier observations, so that I can identify change over time.
40. As a Teacher, I want to add narrative progress notes without numeric grading, so that qualitative Subjects are supported.

### Assignments

41. As a Teacher, I want to assign work to a Learner or Group, so that follow-up is connected to the Lesson.
42. As a Teacher, I want to record completion and feedback, so that the next Lesson can use assignment evidence.
43. As a Teacher, I want AI to draft assignment instructions, so that routine writing is faster.
44. As a Teacher, I want to approve assignment text before it is shared, so that AI cannot send unsuitable work.

### Communications

45. As a Teacher, I want a Communication Draft generated from confirmed Lesson Outcomes, so that summaries do not rely on unverified data.
46. As a Teacher, I want to select the recipient and channel, so that information is shared appropriately.
47. As a Teacher, I want to edit and approve a draft, so that no message leaves the Workspace accidentally.
48. As a Guardian, I want messages to respect my communication preferences, so that I receive appropriate updates.
49. As a Teacher, I want delivery status and failure details, so that I know whether follow-up arrived.
50. As an Admin, I want an audit trail of external communications, so that sensitive disclosures can be reviewed.

### Automation and AI

51. As a Teacher, I want the next Lesson draft to use confirmed history, so that hallucinated or abandoned drafts do not become context.
52. As a Teacher, I want to know which provider/model created a draft, so that the result has provenance.
53. As an Owner, I want usage limits, so that AI and email costs cannot grow without control.
54. As a Teacher, I want a useful fallback when AI is unavailable, so that core teaching workflows remain usable.
55. As an Admin, I want every Automation Run to show trigger, status, approval, delivery, and errors, so that automation is observable.
56. As a Teacher, I want to provide feedback on generated plans, so that prompt and template quality can be evaluated.

### Localization, accessibility, and reliability

57. As a Hebrew-speaking Teacher, I want a complete RTL interface, so that the product is natural to use.
58. As an English-speaking Teacher, I want a complete English interface, so that the product is not tied to one locale.
59. As a keyboard user, I want to complete core workflows without a mouse, so that the system is accessible.
60. As a Teacher on mobile, I want to complete post-Lesson capture and approvals, so that I do not postpone administration.
61. As a Teacher, I want clear empty, loading, permission-denied, offline, and failure states, so that I understand what happened.
62. As an Owner, I want backups and recovery procedures, so that teaching records are not dependent on one deployment event.

## 6. Functional Requirements

### 6.1 Workspace and authorization

- Every private domain record MUST belong to exactly one Workspace.
- The server MUST derive the authenticated Member from the identity provider.
- Client-supplied `teacherId`, `workspaceId`, `learnerId`, or other IDs MUST NOT grant authority.
- Every read and write MUST verify Workspace ownership and the required role/assignment.
- Default roles are Owner, Admin, and Teacher.
- Owner and Admin may access all operational records within their Workspace.
- Teacher access is limited to assigned Learners, Groups, Lessons, and related records unless Workspace policy explicitly grants broader access.
- Membership removal MUST revoke future access without deleting historical Audit Events.

### 6.2 Lesson lifecycle

Canonical Lesson states:

`draft → scheduled → in_progress → awaiting_review → completed`

Alternative terminal states:

`cancelled`, `missed`

Rules:

- A Lesson cannot become `completed` without a teacher-confirmed Lesson Outcome.
- AI may prepare a draft but cannot transition a Lesson to `completed`.
- Corrections after completion create an audited revision.
- Rescheduling preserves the Lesson identity and history.

### 6.3 Communication lifecycle

Canonical Communication Draft states:

`draft → approved → queued → sent`

Alternative terminal states:

`cancelled`, `failed`

Rules:

- Only an authorized Teacher, Admin, or Owner may approve.
- Editing approved content returns it to `draft` unless the change is delivery metadata only.
- Delivery MUST be idempotent and MUST record provider status without exposing provider secrets.

### 6.4 Progress model

- Progress is represented by dated Progress Observations attached to Learning Objectives.
- A Progress Observation records actor, evidence source, optional Rubric result, narrative, Subject, Learner, Lesson, and confirmation status.
- Progress Snapshots are derived and MUST link back to their observations.
- AI interpretations are suggestions and MUST be visibly distinguished from teacher-confirmed evidence.
- The system MUST support Rubrics with numeric, ordinal, checklist, and narrative values without subject-specific schema forks.

### 6.5 AI behavior

- AI features are optional enhancements; manual workflows remain complete.
- Inputs use only data the authenticated Member is authorized to access.
- Prompts use confirmed outcomes by default; unconfirmed drafts require explicit selection.
- Every generation records provider, model, prompt/template version, input references, status, latency, usage, and teacher feedback when provided.
- Generated content is always labelled as AI-generated until edited/approved.
- AI cannot autonomously send communications, grade Learners, alter confirmed observations, or change access permissions.

### 6.6 Integrations

- Calendar MVP supports safe one-way Lesson export before two-way sync.
- OAuth uses least-privilege scopes, state/PKCE protections where supported, secure server-side token handling, revocation, and reconnect flows.
- Email requires a verified sending domain, recipient preference checks, idempotency, retry policy, delivery events, and suppression handling.
- File upload requires type/size allowlists, Workspace authorization, malware-scanning strategy, safe download headers, and deletion lifecycle.

## 7. UX Requirements

### 7.1 Primary navigation

- Today
- Calendar / Lessons
- Learners
- Groups
- Planner
- Progress
- Approvals
- Templates
- Settings

### 7.2 Today

The default working screen shows:

- upcoming and active Lessons;
- Lessons missing Outcomes;
- Communication Drafts waiting for Approval;
- failed Automation Runs or deliveries;
- prioritized next actions, not generic analytics cards.

### 7.3 Post-Lesson capture

The mobile-first flow contains:

1. attendance;
2. content covered;
3. objective-linked observations;
4. notes;
5. assignment/homework;
6. next focus;
7. preview of proposed summary;
8. confirm outcome;
9. optionally approve or defer communication.

The flow MUST support saving a draft, returning later, and completing manually without AI.

### 7.4 Learner timeline

The timeline combines:

- Lessons and Outcomes;
- Progress Observations;
- Assignments and feedback;
- Communications and delivery status;
- significant audited corrections.

Sensitive internal teacher notes MUST be visually and semantically separate from shareable content.

### 7.5 Visual and content requirements

- Hebrew RTL and English LTR are complete product modes.
- The visual identity must communicate education, trust, and operational clarity rather than generic “AI SaaS”.
- WCAG 2.2 AA is the target for core workflows.
- Core actions have keyboard access, visible focus, descriptive labels, and semantic validation.
- Public copy MUST not claim users, uptime, testimonials, pricing, trials, security compliance, or integrations without verifiable evidence.

## 8. Security and Privacy Requirements

### 8.1 Threat boundaries

Primary threats include:

- cross-Workspace access by changing record IDs;
- privilege escalation through client-supplied role or Teacher IDs;
- unauthorized access to minors' or Guardians' information;
- accidental disclosure through AI prompts, logs, email, files, or previews;
- repeated or spoofed automation delivery;
- OAuth token theft or overbroad scopes;
- exposed test, seed, debug, or admin functions;
- unbounded AI/email usage;
- malicious uploaded content;
- prompt injection inside teaching materials or imported text.

### 8.2 Required controls

- Central authorization helpers enforce identity, Workspace membership, role, assignment, and record ownership.
- Security-sensitive functions are internal by default and exposed only through validated public boundaries.
- All identifiers are treated as references, never as authorization.
- Logs exclude secrets, raw OAuth tokens, full prompt content containing private learner data, and unnecessary PII.
- OAuth tokens are encrypted using managed keys or isolated provider-backed secret storage and are never returned to clients.
- Rate limits and quotas apply per Workspace and Member to AI, email, file, invite, and integration operations.
- Outbound operations use idempotency keys.
- Audit Events cover membership, role, learner export/delete, sensitive reads where appropriate, confirmed outcomes, approved communications, integration changes, and administrative actions.
- Preview/test environments contain only synthetic data and separate credentials.
- Dependency and secret scanning run in CI.
- Development keys MUST NOT be used in public production deployments.
- Backup and restore are tested before production launch.

### 8.3 Data classification

- **Restricted:** OAuth tokens, authentication/session material.
- **Sensitive:** Learner identity, date of birth, Guardian contact details, private teacher notes, accommodations, progress evidence, communications.
- **Internal:** Workspace configuration, templates, AI usage metadata, operational logs without PII.
- **Public:** approved marketing content and explicitly public documentation.

Restricted and Sensitive fields require explicit access rules, minimized logging, retention policy, and controlled export/delete procedures.

### 8.4 Consent and communication

- The product records recipient, purpose, channel, and communication preference.
- A Guardian link does not automatically authorize all information sharing.
- Internal notes are excluded from external messages unless explicitly selected.
- Teachers preview and approve messages in the initial release.
- Legal/privacy review is required before production use with real minors' data in any target jurisdiction.

## 9. Implementation Decisions

1. Retain the Next.js + Convex + Clerk modular-monolith architecture unless an implementation spike disproves its suitability.
2. Upgrade dependencies in bounded stages: first remove known critical vulnerabilities, then perform major framework migrations with tests.
3. Introduce Workspace/Membership authorization before migrating teaching features.
4. Replace fixed English levels and skill columns with Subject, Learning Objective, Rubric, and Progress Observation records.
5. Preserve English behavior as a built-in Subject template and migration mapping.
6. Keep Learner separate from authenticated Member. Student/Guardian accounts are deferred.
7. Use a versioned Lesson Plan and teacher-confirmed Lesson Outcome.
8. Make Automation Run and Communication Draft first-class records.
9. Prefer one-way Calendar export in the MVP; two-way sync is deferred until idempotency and conflict behavior are proven.
10. Use provider adapters for AI, email, calendar, and file scanning.
11. Use one package manager and one lockfile.
12. Add typed environment validation and separate dev/test/preview/production configurations.
13. Remove placeholder integrations, fake-success responses, unsupported pricing, fake testimonials, and unverifiable public claims.
14. Create a deterministic synthetic demo Workspace for QA and public preview.
15. Make Hebrew-first RTL and English localization architectural requirements, not post-launch translation work.

## 10. Testing Decisions

### 10.1 Primary test seams

The highest-value seams are:

1. authenticated Convex public API boundaries for authorization and domain behavior;
2. complete browser workflows for the Teaching Cycle;
3. provider adapters for external delivery and generation.

Tests should verify externally visible behavior rather than internal implementation details.

### 10.2 Required test layers

- **Unit:** Lesson state transitions, Rubric validation, progress derivation, communication approval transitions, data-minimization helpers.
- **Authorization integration:** every read/write boundary, cross-Workspace denial, removed Member denial, Teacher assignment limits, internal-function isolation.
- **Domain integration:** plan → outcome → observation → summary draft → approval → delivery status.
- **Provider contract:** AI, email, calendar, and file adapters with deterministic fakes in CI.
- **E2E:** onboarding, Subject setup, Learner creation, scheduling, planning, post-Lesson capture, Approval, timeline, localization, permission denial, failed delivery.
- **Accessibility:** automated checks plus keyboard and screen-reader-oriented manual testing of core flows.
- **Security:** dependency/secret scanning, abusive identifier changes, rate limits, upload restrictions, idempotency, log redaction, and OAuth state/revocation.
- **Migration:** dry-run, record counts, ownership mapping, English objective mapping, rollback, and explicit reauthorization of integrations.

### 10.3 TDD rule

Every new behavior begins with a failing test at the highest practical seam. Existing behavior being retained receives a characterization test before refactoring.

## 11. Migration Strategy

1. Inventory the live Convex deployment and confirm whether any non-synthetic data exists without exporting private content into development.
2. Take a verified backup/snapshot before schema migration.
3. Introduce Workspace and Membership records.
4. Map each existing Teacher user to an Owner Membership in a Workspace.
5. Map `students` to Learners and normalize embedded `parentInfo` into Guardian relationships.
6. Convert English level and six skills into a built-in English Subject template, Learning Objectives, and Rubric.
7. Map `lessons` to the new lifecycle and versioned Lesson Plans.
8. Map `progress` records to Progress Observations, preserving original timestamps and source references.
9. Map AI history to Automation Runs where provenance is sufficient; otherwise retain it as archived migration evidence.
10. Do not migrate stored Google OAuth tokens. Require explicit reconnection after the secure integration is implemented.
11. Run migration in dry-run and synthetic preview first.
12. Verify counts, ownership, referential integrity, and rollback before any production cutover.

## 12. MVP Scope

### Included

- Workspace and Owner/Admin/Teacher roles.
- Individual Learners and basic Groups.
- Any teacher-defined Subject.
- Built-in templates for several Subjects, including English.
- Learning Objectives and flexible Rubrics.
- Lesson scheduling and lifecycle.
- Manual and AI-assisted Lesson Plans.
- Mobile-friendly post-Lesson capture.
- Progress Observations and Learner timeline.
- Assignment creation and feedback status.
- AI-assisted summary/homework/next-Lesson drafts.
- Teacher Approval before communication.
- Email delivery after security and domain verification.
- One-way Calendar export after OAuth security review.
- Hebrew and English product modes.
- Audit trail, quotas, error handling, CI, and synthetic demo data.

### Explicitly out of scope

- full SIS/LMS replacement;
- institutional procurement and district administration;
- formal report-card compliance;
- payments and subscriptions;
- dedicated Learner or Guardian application;
- social network, chat, or marketplace;
- autonomous grading or autonomous communication;
- real-time video classroom;
- two-way Calendar sync;
- unsupported marketing claims or public launch.

## 13. Acceptance Criteria

The specification is implementation-ready only when the following criteria are accepted:

1. Subject-agnostic terminology is used throughout schema, prompts, UI, analytics, and copy.
2. Every private record has a Workspace owner.
3. Authentication identity is derived server-side.
4. Cross-Workspace reads and writes fail in automated tests.
5. Teacher assignment restrictions are tested.
6. No public test/seed/debug function can access production data.
7. The Lesson lifecycle and allowed transitions are enforced.
8. A Lesson cannot complete without a confirmed Outcome.
9. Progress Snapshots are explainable through underlying observations.
10. AI-generated material is labelled and cannot become official without Approval.
11. External communication cannot send before Approval.
12. Editing approved message content invalidates the Approval.
13. Delivery is idempotent and records provider status.
14. OAuth tokens are not client-visible and require secure reconnection after migration.
15. Restricted/Sensitive data is excluded from unnecessary logs.
16. AI/email/file operations have Workspace-level limits.
17. The post-Lesson workflow works on mobile and without AI.
18. Hebrew RTL and English LTR pass core E2E workflows.
19. Core flows meet the WCAG 2.2 AA target under automated and manual checks.
20. Clean install, lint, typecheck, unit, integration, E2E, audit, and production build run in CI.
21. Dependency scanning reports zero Critical/High production vulnerabilities at release gate.
22. Preview and automated tests use synthetic data and separate credentials.
23. Backup/restore and migration rollback are tested.
24. Google Calendar demo success responses are removed; only verified behavior is shown.
25. Public CTAs either work or are removed.
26. Pricing, trial, customer count, uptime, security, and testimonials are absent unless verified.
27. The production release gate has zero unresolved Critical/High security findings.
28. Production deployment, real Learner import, and external sends require separate explicit approval.

## 14. Release Gates

### Gate A — Specification approval

- Domain language, initial market, MVP, non-goals, role model, security boundary, and Teaching Cycle approved.

### Gate B — Security foundation

- Tenant isolation and role tests pass.
- Critical dependency vulnerabilities removed.
- Public test/demo trust-boundary flaws removed.

### Gate C — UX prototype

- Today, Planner, post-Lesson capture, Learner timeline, and Approval flows approved in desktop/mobile prototypes.

### Gate D — Preview readiness

- CI and E2E pass.
- Synthetic demo Workspace works.
- No development credentials or unsupported claims.
- Independent QA/security review has zero unresolved Critical/High findings.

### Gate E — Production

- Privacy/legal review appropriate to the target market.
- Backup and rollback verified.
- Production configuration verified.
- Explicit user approval for deployment and any real data onboarding.

## 15. Success Measures for the Pilot

The pilot should measure rather than assume:

- percentage of scheduled Lessons with a completed Outcome;
- time between Lesson end and confirmed Outcome;
- percentage of generated drafts accepted, edited, or discarded;
- frequency of next-Lesson plans created from confirmed history;
- communication delivery success/failure;
- repeat weekly use by active Teachers;
- teacher-reported reduction in administrative effort;
- number and severity of privacy/security incidents or near misses.

Targets will be set only after a baseline pilot; no usage or time-saving claim is approved in advance.

## 16. Recommended First Implementation Slice

After this specification is approved, the first bounded implementation slice is:

> **Workspace authorization foundation plus cross-Workspace isolation tests, with no UI redesign and no production deployment.**

This slice proves the most important trust boundary before data migration, AI, email, calendar, or visual work begins.
