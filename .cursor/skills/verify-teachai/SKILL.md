---
name: verify-teachai
description: Drive the TeachAI Next.js web app the way a teacher would, in secret-free public mode, and capture browser proof. Use when verifying the landing page, pricing, missing routes, or a production build of this repo.
---

# Verify TeachAI

TeachAI's primary surface is a web UI. The path this skill can prove without secrets is the public marketing site served by `next start` after `next build`. Signed-in teaching tools (students, lessons, AI planner) need Clerk and Convex and are not part of a secret-free run. There is no CLI product.

Two runs cannot share port 3000. If something is already listening there, stop and report it. Do not start a second server, and do not kill a process this run did not start.

## Launch

From the repository root, with npm 10.9.x (the repo `packageManager` is `npm@10.9.8`):

```bash
export RUN_ID="verify-$(date +%Y%m%d%H%M%S)"
export EVIDENCE_DIR="/tmp/teachai-verify-evidence/${RUN_ID}"
mkdir -p "$EVIDENCE_DIR"
.cursor/skills/verify-teachai/bin/launch.sh
```

`launch.sh` refuses to start when TCP 3000 is already open. It builds with empty `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `NEXT_PUBLIC_CONVEX_URL`, and `CONVEX_DEPLOYMENT` (the same secret-free values CI uses), then runs `npm run start -- --hostname 127.0.0.1 --port 3000` in its own session. The server is ready when `http://127.0.0.1:3000/` returns HTTP 200 and a browser can see the heading `Transform Your English Teaching with AI`. The first HTML response is only a spinner (`useMounted` is false on the server), so a curl of the hero text is not readiness. Public mode does not migrate or seed a database; Convex is skipped when `NEXT_PUBLIC_CONVEX_URL` is empty. If the heading never appears, launch stops the process it started.

Do not copy `.env.example` into `.env.local` for this run. Those placeholders are non-empty and turn Clerk on, which hides the public landing page this skill drives. `.env.local` is gitignored; leave it absent.

Chromium for the drive step comes from the repo's Playwright install:

```bash
npx playwright install chromium
```

## Doctor

Run this before driving, and again if a click or assertion looks wrong:

```bash
.cursor/skills/verify-teachai/bin/doctor.sh
```

Doctor exits 0 only when all of these are true:

- `EVIDENCE_DIR/server.pid` is alive and is the process this launch started
- TCP 3000 is held by that process or one of its children
- `GET http://127.0.0.1:3000/` returns 200 with `<title>teachai</title>`
- a headless Chromium page shows the heading `Transform Your English Teaching with AI`
- `node_modules/next/package.json` version equals the `next` version in `package.json`

A doctor failure means do not drive this instance.

## Drive

The harness is Playwright, using accessible roles and names. Recipes live in `features/`. Drive one feature file end to end; do not substitute a different entry point and call it the same proof.

Public landing (the feature proven by the generator):

```bash
node .cursor/skills/verify-teachai/bin/drive-public-landing.mjs
```

The script opens `http://127.0.0.1:3000/`, requires the hero heading, records that state, chooses the header `Features` link (the one inside `navigation`, not the footer link), and requires the features heading plus the `#features` URL. The repo's `tests/e2e/public-build.spec.ts` covers the same hero and the secret-free 404, and `npm run test:e2e` starts its own server on port 3000. Stop this skill's server before running that command so the two do not share the port.

## Evidence

Proof for a run is stored only under `$EVIDENCE_DIR` (default parent `/tmp/teachai-verify-evidence/<RUN_ID>/`). Capture the action and the resulting state.

For `public-landing` the drive script writes:

- `public-landing/hero.png` and `public-landing/hero.aria.txt` before the click
- `public-landing/features.png` and `public-landing/features.aria.txt` after the click
- `public-landing/action.log` with the HTTP status and the URL after navigation

The hero screenshot must show the `teachai` header and the heading `Transform Your English Teaching with AI`. The features snapshot must include `Everything you need to teach effectively`. `server.log` in the same evidence directory is the server transcript.

Mocks are not used. Secret-free mode is the production middleware branch for an empty Clerk publishable key, not a test-only endpoint. Confirm that branch by the visible landing page and by `GET /baseline-missing-page` returning 404 with `This page could not be found` (see `features/missing-page.md`). Signed-in dashboard proof is not available in this mode; that gap is a failure of that feature file, not a pass.

## Cleanup

```bash
.cursor/skills/verify-teachai/bin/cleanup.sh
```

Cleanup reads `$EVIDENCE_DIR/server.pid` and signals that process group. It does not delete `$EVIDENCE_DIR`. After cleanup, the evidence files listed above must still exist, and nothing this run started should still be listening on port 3000.

## Helpers

All three scripts are executable and expect `EVIDENCE_DIR` to be set. `launch.sh` also requires `RUN_ID`.

- `.cursor/skills/verify-teachai/bin/launch.sh`
- `.cursor/skills/verify-teachai/bin/doctor.sh`
- `.cursor/skills/verify-teachai/bin/drive-public-landing.mjs`
- `.cursor/skills/verify-teachai/bin/cleanup.sh`

Keep this map current with `/maintain-verification-skill` when routes or the public landing page change.
