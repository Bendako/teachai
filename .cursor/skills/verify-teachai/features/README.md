# TeachAI verification map

This directory is the maintained source for verifying TeachAI's user-facing web behavior. Read the index before driving the app, then use the matching feature file as the recipe.

## Baseline preconditions

- Build and start the secret-free production server at `http://127.0.0.1:3000` with `.cursor/skills/verify-teachai/bin/launch.sh`.
- Set `EVIDENCE_DIR=/tmp/teachai-verify-evidence/$RUN_ID` so proof from concurrent attempts is not overwritten. The server port is still shared: only one instance may listen on 3000.
- Leave Clerk and Convex variables empty. Do not load `.env.example` into `.env.local`.
- Install Playwright Chromium with `npx playwright install chromium`.
- Run `.cursor/skills/verify-teachai/bin/doctor.sh` and require HTTP 200, the public landing text, and a `next` version that matches `package.json`.
- Never drive an instance that was not started by this verification run.

## Driving conventions

- Start every recipe from the secret-free production server unless its preconditions say otherwise.
- Prefer ARIA roles and accessible names over CSS selectors or DOM position.
- Treat every command as literal. Keep quoted names and flags unchanged.
- Run the public landing proof with `node .cursor/skills/verify-teachai/bin/drive-public-landing.mjs`.
- Other feature files name the Playwright actions to run in the same browser session shape. Do not report a skipped entry point as verified through a different path.
- Do not remove proof artifacts during cleanup.

## Proof and skip reporting

- Capture the user action and the resulting state, not only the final screen.
- UI proof includes an ARIA snapshot and a screenshot with the `teachai` name visible.
- Record the feature ID and entry point used with every artifact.
- Report an unreachable path with the attempted command and the unmet precondition.
- Secret-free mode is a real production branch. It does not exercise signed-in teacher tools.

## Feature entry contract

Each feature file starts with an H1 title and one paragraph describing the user-visible behavior. It then uses exactly four H2 sections in this order.

1. `Sub-features` lists short IDs with one line for each behavior.
2. `How to get to it (user POV)` lists every user entry point.
3. `Driving it with Playwright` starts with `Preconditions:` and uses labeled bullets that pair each user action with an exact command and observable result.
4. `Gotchas` lists traps that can waste or invalidate a verification run.

## Features

- [Public landing](./public-landing.md) covers the secret-free home page, the hero heading, and the Features jump.
- [Missing page](./missing-page.md) covers the secret-free 404 for an unknown URL.
- [Pricing](./pricing.md) covers the pricing section and the monthly/yearly prices.
- [Teacher dashboard](./teacher-dashboard.md) covers the signed-in home page. It stays unverified until real Clerk and Convex configuration is present.
