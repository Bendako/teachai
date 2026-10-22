# Missing page

An unknown URL on the secret-free server returns a 404 page instead of the marketing site or a redirect to sign-in.

## Sub-features

- `missing-status` responds with HTTP 404.
- `missing-copy` shows the not-found message.

## How to get to it (user POV)

- Type an unknown path such as `/baseline-missing-page` into the address bar.

## Driving it with Playwright

Preconditions:

- Doctor reports the secret-free server at `http://127.0.0.1:3000`.
- `EVIDENCE_DIR` is set.
- Playwright Chromium is installed.

- **Open an unknown path.** Visit `/baseline-missing-page`. In a Playwright page, `const response = await page.goto("http://127.0.0.1:3000/baseline-missing-page")` then expect `response.status()` to be `404`.
- **Read the message.** The page shows text matching `This page could not be found`. Capture `page.screenshot` and `page.locator("body").ariaSnapshot()` under `$EVIDENCE_DIR/missing-page/`.
- **Confirm the public branch.** The 404 document is the small secret-free response, and the hero heading `Transform Your English Teaching with AI` is not on this URL.

## Gotchas

- With a Clerk publishable key set, middleware uses Clerk's authenticated matcher instead of the secret-free 404. A 404 from that configuration is a different path and does not prove this feature.
- `/` itself must stay HTTP 200. A 404 on the root means the server is not the public landing instance.
- The repo test `tests/e2e/public-build.spec.ts` drives this path, but it starts its own server. Stop this skill's server before `npm run test:e2e`.
