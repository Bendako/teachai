# TeachAI T04 — Candidate convergence review

Date: 2026-09-01 (Asia/Jerusalem)
Branch: `work/t04-workspace-isolation`
Base: `f213d18`

## Scope and method

Reviewed the complete worktree diff from `f213d18`, all untracked T04 source/test files, the T04 acceptance manifest, the approved product/security specification, ticket breakdown, GitHub issue #5, and the prior RED/GREEN evidence. Review was limited to T04 authorization, Workspace/Learner isolation, legacy boundary containment, schema/index correctness, authorization ordering, fail-closed behavior, compatibility, data minimization, and focused-test quality. No production credentials, external sends, deployments, migrations, commits, or pushes were used.

## Findings and reproductions

No valid in-scope implementation defect was identified. The candidate already:

- derives server identity from `ctx.auth.getUserIdentity().subject` in `convex/auth.ts`;
- checks authentication before protected access and checks active Workspace membership and allowed role before Learner/Workspace access;
- binds legacy Student operations to the authenticated legacy Teacher profile;
- ignores caller-supplied Clerk identity and legacy role values in `users:createUser`;
- denies removed-member, unauthenticated, cross-Workspace, unassigned Teacher, and spoofed access;
- disables public seed, test/setup, all-user listing, and AI connection-probe paths without writing or exposing data.

The following focused reproduction commands were run against the current candidate:

```bash
npm test -- convex/workspaces.test.ts convex/learners.test.ts convex/legacy-boundaries.test.ts
npm run lint
npm run typecheck
git diff --check f213d18
```

Results:

- Focused authorization/boundary tests: exit 0; 3 files, 12 tests passed.
- Lint: exit 0.
- Typecheck: exit 0.
- Diff check: exit 0.

Additional full verification was run:

```bash
npm run test
npm run audit:prod
npm run build
```

Results:

- Full test suite: exit 0; 6 files, 19 tests passed.
- Production audit: exit 0 at configured Critical threshold; 3 High and 4 Moderate findings remain and are pre-existing/outside this bounded authorization review.
- Production build: exit 0; Next.js build completed successfully.

## Changes

No implementation or test changes were necessary. This document is the only convergence-review artifact added by this task.

## Deferred boundary

Assigned Teacher Learner reads remain deferred because T04 has no approved assignment representation in its schema. The candidate correctly denies unassigned Teachers rather than granting membership-wide access; assignment modeling belongs to the later approved scope unless Product/Security explicitly expands T04.

## QA handoff

QA should independently review and execute the focused commands above, then verify the acceptance manifest cases A1–A3 and A5–A13. In particular, confirm removed-member revocation, identity spoofing resistance, zero-write denial assertions, and disabled legacy public boundaries using synthetic fixtures only.
