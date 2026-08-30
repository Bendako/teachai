# TeachAI v2 — Proposed Ticket Breakdown

- **Status:** Approved
- **Approved by user:** 2026-08-30
- **Source:** `docs/product/teachai-v2-product-security-spec.md`
- **Branch:** `spec/teachai-v2-product-security`
- **Publishing authorization:** User authorized commit, push, and publication of the parent specification plus the 17 approved GitHub issues on 2026-08-30. PR creation, merge, deployment, real-data import, and external sends remain unauthorized.

The tickets below are narrow, verifiable slices. `T01`–`T17` are temporary planning references; real GitHub issue numbers will be inserted only after publication approval.

## Proposed dependency graph

```text
T01 ──┬── T02
      ├── T04 ── T05 ── T06 ── T07 ── T08 ── T09 ── T10 ── T11 ── T12 ── T13
      │                                  │       │      │
T03 ──┘                                  ├── T15 │      └── T16
                                         └── T14 ┘

T17 is blocked by every release-scope ticket T02–T16.
```

## T01 — Establish a reproducible security and test baseline

**Blocked by:** None — can start immediately.

**What it delivers:** The existing application can be installed and verified consistently before domain refactoring begins.

**Acceptance criteria:**

- [ ] One package manager and one lockfile are authoritative; stale package artifacts are removed only after verification.
- [ ] The public build succeeds in a secret-free CI configuration, including `/_not-found`.
- [ ] Known direct Critical dependency advisories affecting Next.js and Clerk are removed through bounded compatible upgrades.
- [ ] Unit/integration and browser test runners are installed with one verified smoke test at each required seam.
- [ ] GitHub Actions runs clean install, lint, typecheck, tests, dependency audit, and production build.
- [ ] No feature behavior, production deployment, real credentials, or real Learner data is added.

## T02 — Contain the current public landing-page trust failures

**Blocked by:** T01.

**What it delivers:** The currently public site stops advertising unsupported product claims and dead actions while TeachAI v2 is rebuilt.

**Acceptance criteria:**

- [ ] Unsupported claims about customer count, uptime, compliance, pricing, free trials, and testimonials are removed or replaced with truthful pre-release copy.
- [ ] Dead `Watch Demo`, `Contact Sales`, `Schedule Demo`, pricing, and footer links either work or are removed.
- [ ] Public production no longer uses Clerk development keys.
- [ ] The landing page describes TeachAI as subject-agnostic and pre-release without implying school/SIS breadth.
- [ ] Desktop/mobile, keyboard, links, console, and production build checks pass.

## T03 — Approve the TeachAI v2 core UX prototype

**Blocked by:** None — can run in parallel with T01.

**What it delivers:** An interactive, disposable prototype locks the main workflows before broad UI implementation.

**Acceptance criteria:**

- [ ] Prototype covers Today, Planner, post-Lesson capture, Learner timeline, Progress, and Approvals.
- [ ] Desktop and mobile states are represented.
- [ ] Hebrew RTL and English LTR modes are represented.
- [ ] Empty, loading, error, permission-denied, and draft/approved states are represented.
- [ ] Internal notes are visibly separate from externally shareable content.
- [ ] The user approves the interaction direction before implementation tickets depend on it.

## T04 — Enforce Workspace isolation through one Learner tracer flow

**Blocked by:** T01.

**What it delivers:** An authenticated Owner can create and read one Learner inside one Workspace, while another Workspace is denied end to end.

**Acceptance criteria:**

- [ ] Workspace, Membership, and Owner/Admin/Teacher roles exist.
- [ ] Server authorization derives identity from Clerk and never trusts client-supplied authority IDs.
- [ ] One create/read Learner flow is protected by centralized membership and ownership checks.
- [ ] Cross-Workspace read and mutation tests fail before implementation and pass after it.
- [ ] Removed Members and unauthenticated users are denied.
- [ ] Public test/seed/admin functions cannot bypass the boundary.

## T05 — Build the bilingual accessible application shell

**Blocked by:** T03 and T04.

**What it delivers:** Authenticated Members can navigate a responsive Hebrew/English shell that preserves Workspace context and permission states.

**Acceptance criteria:**

- [ ] Navigation includes Today, Lessons, Learners, Groups, Planner, Progress, Approvals, Templates, and Settings.
- [ ] Hebrew RTL and English LTR switch without mixed-direction layout defects.
- [ ] Workspace switching is explicit and does not leak cached data from the prior Workspace.
- [ ] Keyboard navigation, focus states, landmarks, labels, and core contrast meet the WCAG 2.2 AA target.
- [ ] Mobile and desktop shell E2E tests pass.

## T06 — Complete Workspace-scoped Learners, Guardians, Groups, and assignments

**Blocked by:** T04 and T05.

**What it delivers:** Authorized Teachers can manage their assigned Learners and Groups without exposing other Workspace records.

**Acceptance criteria:**

- [ ] Learner records collect only required information and support archive without silent history deletion.
- [ ] Guardians are normalized records with relationship and communication-preference fields.
- [ ] Groups and Enrollments support individual and group teaching.
- [ ] Owner/Admin can assign Teachers; Teachers see only permitted Learners/Groups.
- [ ] Internal notes and shareable information are separate.
- [ ] Cross-Workspace and cross-assignment authorization tests cover every public operation.

## T07 — Add subject-agnostic Subjects, Learning Objectives, and Rubrics

**Blocked by:** T06.

**What it delivers:** Teachers can configure progress structures for different Subjects without subject-specific code branches.

**Acceptance criteria:**

- [ ] Teachers can create Subjects or start from built-in templates.
- [ ] English, mathematics, and music demo templates use the same domain model.
- [ ] Learning Objectives can be grouped in an optional Curriculum Framework.
- [ ] Rubrics support numeric, ordinal, checklist, and narrative evidence.
- [ ] Existing English levels and six skills are represented as an English template, not fixed schema fields.
- [ ] Tests prove a new Subject can be added without schema or source-code changes.

## T08 — Implement the authorized Lesson lifecycle and scheduling flow

**Blocked by:** T06 and T07.

**What it delivers:** A Teacher can schedule and move a Lesson for an authorized Learner or Group through explicit lifecycle states.

**Acceptance criteria:**

- [ ] The allowed state path is enforced: `draft → scheduled → in_progress → awaiting_review → completed`.
- [ ] `cancelled` and `missed` are supported terminal alternatives.
- [ ] A Lesson cannot become completed without a confirmed Lesson Outcome.
- [ ] Rescheduling preserves identity and audit history.
- [ ] Unauthorized Learner, Group, Subject, or Workspace references are rejected.
- [ ] Calendar UI, timezone, conflict, empty, and permission states are tested.

## T09 — Create versioned manual Lesson Plans and reusable templates

**Blocked by:** T08.

**What it delivers:** Teachers can plan a complete Lesson without AI and reuse approved structures.

**Acceptance criteria:**

- [ ] A Lesson Plan includes objectives, activities, timing, materials, and optional Assignment.
- [ ] Plans are versioned; edits do not silently rewrite prior versions.
- [ ] Teachers can create, copy, and apply templates within their Workspace.
- [ ] Template and plan access follows Workspace and Teacher assignment rules.
- [ ] Manual planning remains complete when AI providers are unavailable.

## T10 — Capture and confirm the post-Lesson Outcome on mobile

**Blocked by:** T08 and T09.

**What it delivers:** A Teacher can complete post-Lesson administration in a short mobile flow and create confirmed evidence for future work.

**Acceptance criteria:**

- [ ] Flow captures attendance, content covered, objective-linked observations, notes, Assignment, and next focus.
- [ ] Outcome can be saved as draft and resumed.
- [ ] Only the Teacher can confirm the official Outcome.
- [ ] Confirmation moves the Lesson to completed and creates Progress Observations atomically.
- [ ] Corrections create audited revisions instead of silent rewrites.
- [ ] Flow works in Hebrew/English, mobile/desktop, online retry, and without AI.

## T11 — Build the Learner timeline and explainable Progress Snapshots

**Blocked by:** T10.

**What it delivers:** Teachers can understand progress from dated evidence rather than opaque global scores.

**Acceptance criteria:**

- [ ] Timeline combines Lessons, Outcomes, Progress Observations, Assignments, and Communications.
- [ ] Filters support Subject, objective, and timeframe.
- [ ] Progress Snapshots link back to every underlying observation.
- [ ] Narrative-only and rubric-based Subjects both render correctly.
- [ ] AI suggestions are visually distinct from teacher-confirmed evidence.
- [ ] Internal notes never appear in externally shareable views by default.

## T12 — Generate AI drafts with provenance and Teacher Approval

**Blocked by:** T09, T10, and T11.

**What it delivers:** Teachers can request grounded Lesson Plan, summary, Assignment, and next-Lesson drafts without granting AI authority.

**Acceptance criteria:**

- [ ] Provider adapters support deterministic test doubles and at least one configured provider.
- [ ] Prompts use only authorized, confirmed records by default.
- [ ] Every Automation Run records provider, model, template version, input references, status, usage, latency, and failure.
- [ ] AI output is labelled and remains a draft until Teacher Approval.
- [ ] AI cannot modify confirmed observations, permissions, recipients, or delivery state.
- [ ] Workspace quotas, rate limits, safe logging, failure fallback, and prompt-injection handling are tested.

## T13 — Deliver approved Communications safely by email

**Blocked by:** T10 and T12.

**What it delivers:** A Teacher can approve and send a Lesson summary or progress message with observable delivery status.

**Acceptance criteria:**

- [ ] Communication lifecycle is enforced: `draft → approved → queued → sent`, with `cancelled` and `failed` alternatives.
- [ ] Editing approved content invalidates Approval.
- [ ] Recipient, Guardian relationship, communication preference, and excluded internal notes are previewed before Approval.
- [ ] Sending uses a verified domain, idempotency key, retry policy, suppression handling, and delivery events.
- [ ] Audit Events record Approval, actor, recipient, content version, and delivery result without logging unnecessary Sensitive data.
- [ ] No external email is sent in automated tests or preview verification.

## T14 — Export Lessons safely to Google Calendar

**Blocked by:** T04 and T08.

**What it delivers:** A Teacher can connect Calendar and export authorized Lessons one way without duplicate events or exposed tokens.

**Acceptance criteria:**

- [ ] Real OAuth uses least-privilege scopes, state/PKCE protections where supported, reconnect, disconnect, and revocation.
- [ ] Tokens are encrypted/isolated server-side and never returned to clients or logs.
- [ ] Lesson export is idempotent and stores the provider event reference.
- [ ] Updates/cancellations modify the correct event without duplicating it.
- [ ] Demo success responses and simulated event counts are removed.
- [ ] Two-way sync remains out of scope.

## T15 — Authorize and protect teaching-material files

**Blocked by:** T04 and T09.

**What it delivers:** Teachers can attach and retrieve materials without cross-Workspace access or unsafe file handling.

**Acceptance criteria:**

- [ ] Upload uses type and size allowlists and a documented malware-scanning strategy.
- [ ] Storage references and downloads verify Workspace ownership and assignment.
- [ ] Downloads use safe content/disposition headers.
- [ ] Deletion, retention, and orphan cleanup are explicit and audited.
- [ ] Cross-Workspace, malicious filename, oversized, disallowed type, and missing-file tests pass.

## T16 — Migrate legacy TeachAI data into the v2 domain safely

**Blocked by:** T06, T07, T08, T09, T10, and T11.

**What it delivers:** Existing records can be mapped to the approved v2 model with dry-run evidence and rollback.

**Acceptance criteria:**

- [ ] Live deployment inventory determines whether non-synthetic data exists without copying private content into development.
- [ ] Migration supports dry-run, counts, validation errors, and rollback snapshot.
- [ ] Users map to Workspace Owner Memberships; students/parent info map to Learners/Guardians.
- [ ] English skills map to the built-in English Subject objectives/rubric.
- [ ] Lessons, plans, progress, and usable AI provenance retain original timestamps and source references.
- [ ] Legacy Google OAuth tokens are not migrated; reconnection is required.

## T17 — Pass the TeachAI v2 preview and release-readiness gate

**Blocked by:** T02–T16.

**What it delivers:** A synthetic public-safe preview demonstrates the complete Teaching Cycle with independent QA/security evidence.

**Acceptance criteria:**

- [ ] Synthetic demo Workspace completes onboarding, Learner/Subject setup, planning, Lesson, Outcome, Progress, Approval, and simulated delivery.
- [ ] Clean install, lint, typecheck, unit, integration, E2E, dependency/secret scan, and production build pass in CI.
- [ ] Desktop/mobile, Hebrew/English, keyboard, accessibility, error, offline/retry, and permission paths are verified.
- [ ] Independent review reports zero unresolved Critical/High security or launch findings.
- [ ] Development credentials, real Learner data, unsupported claims, fake testimonials, and unimplemented CTAs are absent.
- [ ] Backup/restore and migration rollback are exercised.
- [ ] Production deployment, real data import, payment setup, and external sends remain separate explicit approval gates.

## Proposed frontier

After ticket publication, the initial ready frontier is:

1. `T01` — security/test baseline.
2. `T03` — UX prototype, which can run independently in parallel.

`T02` and `T04` unlock only after `T01`; all later implementation remains blocked by explicit predecessor evidence.

## Review questions

1. Is 17 tickets the right granularity, or should any be merged/split?
2. Should the UX prototype (`T03`) run in parallel with the technical baseline (`T01`)?
3. Are the first release boundaries correct: one-way Calendar, email only after Approval, no payments, no Student/Guardian app, and no school SIS/LMS scope?
4. After approval, should SBEA be authorized to commit/push the approved specification and publish the parent spec plus implementation issues to GitHub?
