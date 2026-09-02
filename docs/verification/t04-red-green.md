# TeachAI T04 — RED/GREEN and verification evidence

Date: 2026-08-31 (Asia/Jerusalem)
Branch: `work/t04-workspace-isolation`
Base: `f213d1808884579b1cd4774c3687fcd831219623`
Issue: https://github.com/Bendako/teachai/issues/5

## Authority boundary

Synthetic test identities and records only. No Clerk, Convex, Vercel, or other production credentials were used. No commit, push, PR, merge, deployment, or real-data operation was performed.

## RED → GREEN evidence

The RED and focused GREEN runs below were observed in the append-only Dev transcript at `/root/.hermes/cache/delegation/live/deleg_18d00969/task-0.log`.

### Workspace owner slice

- RED: `npm test -- convex/workspaces.test.ts`
- Result: exit 1; one test failed because module `workspaces` did not exist.
- GREEN: same focused command after the minimum schema/auth/workspace implementation.
- Result: one test passed.

### Learner tenant-isolation slice

- RED: `npm test -- convex/learners.test.ts`
- Result: exit 1; two tests failed because module `learners` did not exist.
- GREEN and boundary expansion: same focused command after implementation.
- Result: five tests passed, covering owner create/read, active Teacher access, removed-member revocation, unauthenticated denial, and cross-Workspace create/read denial.

### Legacy public-bypass containment slice

- RED: `npm test -- convex/legacy-boundaries.test.ts`
- Result: exit 1; three tests failed, demonstrating unauthenticated legacy Student creation, spoofable Clerk identity input, and public seed/test/setup/admin bypasses.
- GREEN: same focused command after containment.
- Result: three tests passed.

### Combined focused GREEN

Command:

```bash
npm test -- convex/workspaces.test.ts convex/learners.test.ts convex/legacy-boundaries.test.ts
```

Result: 3 files passed, 9 tests passed.

## Independent full-gate verification

### Clean install

Command: `npm ci`

Result: exit 0; 537 packages installed. Full dependency audit reported 15 advisories (1 Critical, 8 High, 5 Moderate, 1 Low), including the pre-existing development-only Critical advisory. No dependency was auto-upgraded.

### Lint

Command: `npm run lint`

Result: exit 0.

### Typecheck repair and verification

Initial command: `npm run typecheck`

Initial result: exit 2 because the three new Convex tests used `import.meta.glob` without loading `vite/client` types. Each test received the scoped `/// <reference types="vite/client" />` declaration.

Re-run result: exit 0.

### Full test suite

Command: `npm run test`

Result: exit 0; 6 files passed, 16 tests passed.

### Production dependency audit

Command: `npm run audit:prod`

Result: exit 0 at the configured Critical threshold. Remaining production findings: 3 High and 4 Moderate; no production Critical advisory. These advisories predate and are outside the bounded T04 authorization slice.

### Production build

Command: `npm run build`

Result: exit 0; Next.js 15.5.24 compiled and generated all routes successfully.

### Browser smoke

Command: `npm run test:e2e`

Result: exit 0; Playwright Chromium 2/2 passed for the secret-free public page and generated not-found page.

### Diff hygiene

Command: `git diff --check`

Result: exit 0.

## Post-review repair and fresh verification

The independent review found one valid High-risk authorization defect: the legacy `users:createUser` mutation accepted a caller-supplied role and could promote or demote the authenticated profile. A regression test was added, observed failing, and the mutation was changed to derive the Clerk identity and retain the existing role (new legacy profiles default to `teacher`). The compatibility `role` argument remains accepted but is ignored.

Fresh focused verification after the repair:

- `npm test -- convex/workspaces.test.ts convex/learners.test.ts convex/legacy-boundaries.test.ts` — exit 0; 3 files, 10 tests passed.
- `npm run lint` — exit 0.
- `npm run typecheck` — exit 0.
- `npm run test` — exit 0; 6 files, 17 tests passed.
- `npm run audit:prod` — exit 0 at the configured Critical threshold; 3 High and 4 Moderate production findings remain (listed literally in command output; no production Critical advisory).
- `npm run build` — exit 0; Next.js production build completed.
- `npm run test:e2e` — exit 0; Playwright Chromium 2/2 passed.
- `git diff --check` — exit 0.

The candidate remains uncommitted and is ready for independent QA. No commit, push, PR, merge, deployment, or real-data operation was performed.
