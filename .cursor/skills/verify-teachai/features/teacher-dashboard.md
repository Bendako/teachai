# Teacher dashboard

A signed-in teacher sees their dashboard on `/`, with student, lesson, and progress tools, instead of the marketing page.

## Sub-features

- `dashboard-signed-in` replaces the marketing page after sign-in.
- `dashboard-loading` shows `Loading your dashboard...` while the account is resolving.
- `dashboard-sections` switches among the teacher tools from the sidebar.

## How to get to it (user POV)

- Sign in from the header `Sign In` button, then return to `/`.
- Choose `Get Started` or `Start Free 14-Day Trial` to create an account, then return to `/`.

## Driving it with Playwright

Preconditions:

- A real `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` are configured at build time, and `NEXT_PUBLIC_CONVEX_URL` points at a Convex deployment the test user can access.
- Doctor is pointed at that authenticated server, not the secret-free server.
- A teacher test user exists in that Clerk instance.

- **Sign in.** Choose `Sign In` and complete Clerk's form with the test user. The header shows the account button instead of `Sign In`.
- **Open the dashboard.** Visit `/`. The marketing heading `Transform Your English Teaching with AI` is gone, and the page leaves the `Loading your dashboard...` state.
- **Proof.** Capture a screenshot and an ARIA snapshot under `$EVIDENCE_DIR/teacher-dashboard/` that show the signed-in dashboard rather than the landing hero.

## Gotchas

- This journey has no secret-free entry point. Empty Clerk keys make `/` render the public landing page and make every other path return the secret-free 404. Report those commands as failed for this feature and name the missing Clerk and Convex configuration. Do not count the landing page as dashboard proof.
- `.env.example` contains placeholders, not working credentials. Do not invent keys or commit a filled env file.
- The dashboard calls Convex as soon as a Clerk user is present. A signed-in page that stays on `Loading your dashboard...` has not proven the feature.
