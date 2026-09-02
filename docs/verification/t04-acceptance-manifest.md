# TeachAI T04 — Acceptance Manifest

Date: 2026-09-01 (Asia/Jerusalem)
Issue: [#5 — Enforce Workspace isolation through one Learner tracer flow](https://github.com/Bendako/teachai/issues/5)
Planning reference: `T04`
Branch: `work/t04-workspace-isolation`
Base: `f213d1808884579b1cd4774c3687fcd831219623`

## 1. Purpose and authority

This manifest is the objective acceptance contract for the bounded T04 slice. It reconciles GitHub issue #5, the approved product/security specification, the approved ticket breakdown, the complete current worktree diff (including untracked files), and `docs/verification/t04-red-green.md`.

Execution boundary: synthetic fixtures only; no Clerk, Convex, Vercel, or other production credentials; no real Learner data; no commit, push, PR, merge, Preview/Production deployment, or external send.

T04 is a backend authorization tracer, not the complete Learner product. Later tickets own invitations, assignment UX, broader Learner fields, Groups, and migration.

## 2. Intended data model

The T04 model introduces:

- `workspaces`: private tenant boundary, with name, creator Clerk identity, and timestamps.
- `memberships`: Workspace membership keyed by `workspaceId + memberIdentityId`, with role `owner | admin | teacher`, status `active | removed`, and lifecycle timestamps.
- `learners`: the minimal tracer record, keyed to exactly one Workspace, with name, creator Clerk identity, and timestamps.

The pre-existing legacy tables (`users`, `students`, `lessons`, `progress`, and related tables) remain in the schema for compatibility. They are not the v2 authorization model and must not be treated as proof of Workspace isolation.

## 3. Identity and authorization contract

1. The authoritative caller identity is the authenticated Clerk identity exposed server-side by Convex `ctx.auth.getUserIdentity()`; its stable `subject` is the identity key.
2. Next.js uses Clerk middleware and `ClerkProvider` (indirectly through `AppProviders`); backend authorization must not rely on browser state or UI protection.
3. Client-supplied `teacherId`, `clerkId`, `memberIdentityId`, `workspaceId`, or record IDs are references only. They never establish authority. Compatibility arguments may remain in legacy APIs only when ignored or checked against the authenticated identity.
4. Every private operation is default-deny and authorization-before-data-access:
   - authenticate first;
   - resolve only the minimum routing information needed to identify the target Workspace;
   - verify active Membership for that Workspace;
   - verify role and, for Teacher operations, the explicit assignment/ownership rule;
   - only then load or return protected Learner fields, or perform a write.
   A code review or instrumented test must show that denied requests do not read or disclose the protected Learner document before the membership/role decision.
5. Missing, unauthenticated, removed, cross-Workspace, spoofed, and otherwise unauthorized requests fail with a non-authorizing result. The tracer uses `Unauthenticated` for no identity and `Not found or access denied` for protected-resource denial; no protected record is returned or inserted.
6. Intended role policy:
   - Owner: create/read all Learners in their Workspace.
   - Admin: read all Learners and, for this tracer, create Learners in their Workspace.
   - Teacher: read only Learners explicitly assigned to that Teacher; creation is not granted by Membership alone unless a later approved policy explicitly grants it.
   - Removed Membership: no access, effective immediately.

## 4. Acceptance cases

Each case must be exercised with isolated synthetic identities and records. “Pass” means the expected result is observed and the database side effect/count is verified where applicable.

| ID | Scenario | Expected result / evidence |
|---|---|---|
| A1 | Authenticated Owner creates a Workspace | `createWorkspace` succeeds; exactly one Workspace and one active owner Membership are created for the authenticated Clerk subject. |
| A2 | Same Owner creates and reads own-Workspace Learner | `createLearner` succeeds; `getLearner` returns only the expected minimal record and its Workspace; no caller-supplied authority ID is used. |
| A3 | Active Admin operates in its Workspace | Admin can read and create a Learner in the Workspace, if this remains the approved tracer role policy; evidence includes successful mutation and read. |
| A4 | Active Teacher Member access to an allowed Learner tracer | An active Teacher with an explicit assignment can read that Learner and cannot read an unassigned Learner. Membership alone is insufficient. The assignment representation and synthetic fixture must be defined before this case is claimed green; with the current T04 schema, this case is explicitly deferred rather than silently treated as passing. |
| A5 | Active Teacher attempts unauthorized create | Unless a separately approved policy says otherwise, Membership alone does not grant create; mutation is denied and Learner count is unchanged. |
| A6 | Cross-Workspace read | Owner/Member of Workspace B presents a Learner ID from Workspace A; read is denied with no Learner data disclosed. |
| A7 | Cross-Workspace create/mutation | Caller authorized in Workspace B submits Workspace A’s ID; mutation is denied and no row is inserted. |
| A8 | Removed Member read and mutation | After Membership status changes to `removed`, both read and create/mutation are denied immediately; historical Membership/Audit data is not deleted. |
| A9 | Unauthenticated read and mutation | No Clerk identity: both operations are denied before any protected result or write. |
| A10 | Spoofed identity/authority input | Caller authenticated as subject X supplies subject Y’s `teacherId`/`clerkId` or a victim record ID; server binds to X, denies unauthorized access, and does not alter the victim profile/role. |
| A11 | Legacy public Student boundary | Unauthenticated and cross-identity calls to legacy Student create/read/update/delete/list surfaces are denied; client-supplied `teacherId` cannot impersonate another teacher. |
| A12 | Legacy public seed boundary | Public `seedSampleData` is disabled/denied; it creates zero Students, Lessons, or Progress rows. |
| A13 | Legacy public test/setup/admin boundaries | Public integration-test, setup/configuration, AI probe, and all-user listing/admin surfaces are disabled/denied and expose no secrets, configuration, or bulk data. |

Required evidence is the focused RED/GREEN test output, database side-effect assertions, authorization-order evidence (code review or instrumentation), schema/index inspection, and the full verification gate recorded in `t04-red-green.md`. Tests must remain synthetic and must not require production credentials.

## 5. Schema, index, and compatibility requirements

- Every v2 private domain record in this tracer has exactly one `workspaceId`; Learner access is never inferred from a caller-supplied teacher or user ID.
- `memberships` has an index for `(workspaceId, memberIdentityId)` and the authorization helper uses it to find the current caller's membership. The lookup must distinguish `active` from `removed`.
- `learners` has an index by `workspaceId` for future Workspace-scoped listing and does not duplicate a mutable authority field such as `teacherId`.
- Workspace creation and its initial active Owner membership are committed together; a partial Workspace without its Owner membership is not an accepted state.
- The minimal tracer payload is limited to the Workspace reference, Learner name, creator identity, and timestamps. Email, guardian data, progress, lessons, groups, assignments, and audit-event payloads are not added for T04.
- Legacy tables and function argument shapes may remain for compatibility, but legacy public operations must fail closed or bind authority to authenticated identity. Compatibility arguments never grant authority and must not re-enable seed, setup, test, admin-listing, or identity-spoofing paths.

## 6. In-scope and out-of-scope decisions

### In scope

- The backend Workspace/Membership boundary and one minimal Learner create/read tracer.
- Clerk-derived identity, active membership, role checks, cross-Workspace denial, immediate removed-member revocation, unauthenticated denial, and legacy public-bypass containment.
- Synthetic Convex fixtures, focused regression tests, and the documented lint/typecheck/test/build/audit verification gate.

### Out of scope

- Clerk/Convex/Vercel production configuration, deployment, migrations, real Learner data, invitations, membership-management UX, Workspace switching UI, and external integrations.
- Assignment modeling and Teacher assignment UX; therefore A4 cannot be marked green until an explicitly approved representation exists.
- Guardians, Groups, Subjects, Lessons, Progress, communications, AI workflows, exports/deletion workflows, and full audit-event implementation.
- Broad legacy migration or declaring legacy `students` equivalent to v2 Workspace-scoped `learners`.

## 7. Current candidate reconciliation

Evidence already recorded in `docs/verification/t04-red-green.md`:

- Focused RED/GREEN and combined GREEN runs cover Workspace owner create/read, Admin create/read, unauthenticated denial, removed-member denial, cross-Workspace denial, legacy Student containment, identity spoofing, role spoofing, and disabled public seed/test/setup/admin surfaces.
- Fresh focused verification reports 3 files / 10 tests passed; full suite reports 6 files / 17 tests passed.
- Lint, typecheck, production audit threshold, build, browser smoke, and `git diff --check` passed in the recorded run.

Observed implementation alignment:

- `convex/auth.ts` centralizes authenticated identity, active Membership, and legacy identity checks.
- `convex/workspaces.ts` creates the owner Membership atomically with the Workspace and protects Workspace reads.
- `convex/learners.ts` protects create/read and scopes records by Workspace.
- Legacy `students.ts`, `users.ts`, `seedData.ts`, `test.ts`, and `testSetup.ts` reject bypass paths or bind authority to authenticated identity.
- The current Learner create/read tests are synthetic and verify no-write behavior for denied mutations.

The candidate does not yet prove the full authorization-before-data-access requirement for `getLearner`: it retrieves the Learner by ID before checking active membership. This is recorded as an acceptance/review finding, not a reason to broaden T04; the implementation must be reordered or otherwise instrumentably shown to avoid protected-data access before authorization.

## 8. Ambiguities and conflicts (do not expand scope)

1. **Teacher permission conflict:** The approved product/security specification says Teachers are limited to assigned Learners, while the current `learners.ts` implementation allows only Owner/Admin roles for Learner create and read and the current tests explicitly describe an *unassigned* Teacher denial. There is no Learner-to-Teacher assignment table or field in the T04 schema. Therefore A4 (permitted assigned Teacher read) cannot be objectively accepted by the current candidate without an approved assignment representation; this is a gap/decision, not permission to add T06 functionality to T04. The safe interim behavior is denial, never membership-wide Teacher access.
2. **“Ownership checks” wording:** The issue requests centralized membership and ownership checks. T04 currently proves Workspace membership and Learner Workspace ownership, but not Teacher assignment ownership. Treat record `workspaceId` plus active Membership as the bounded tracer check; assignment ownership remains deferred unless explicitly approved.
3. **Legacy vs v2 model:** Legacy `students` are keyed by `teacherId`, not `workspaceId`. Their containment is a compatibility boundary only and does not establish v2 tenant isolation. Migration and domain unification belong to T16.
4. **Admin and Teacher creation policy:** The ticket explicitly names roles but does not state whether an Admin or assigned Teacher may create a Learner. This manifest recommends Owner/Admin create and assigned Teacher read, with Teacher create denied by default. Any change is a product/security decision and must update tests and this manifest.
5. **Audit Events:** The approved specification requires audit coverage, but no Audit Event table/flow is part of the bounded current diff. Do not mark full audit compliance as a T04 acceptance claim; retain it for the appropriate later scope.
6. **Authorization ordering:** The security contract requires authorization before protected-data access, but the current Learner read path fetches the target document before membership validation. Treat this as a review finding that must be resolved or explicitly waived by Security before acceptance; do not claim it is covered merely because the final response is denied.

## 9. Acceptance decision rule

T04 is acceptance-ready only when all applicable cases A1–A3 and A5–A13 pass with objective evidence, the authorization-order finding is resolved or formally waived, and A4 is either implemented within an explicitly approved T04 boundary or formally recorded as deferred with the assignment dependency preserved. A deferred A4 is not evidence of Teacher access; it is an explicit product/security boundary. No implementation, test, or scope expansion is implied by this manifest.
