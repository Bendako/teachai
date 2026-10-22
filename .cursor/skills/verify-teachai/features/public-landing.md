# Public landing

The public landing page introduces TeachAI to a signed-out visitor and jumps to the features, pricing, testimonials, and contact sections from the header.

## Sub-features

- `landing-hero` shows the teaching headline on `/`.
- `landing-features-jump` scrolls to the features section from the header.
- `landing-section-nav` exposes Pricing, Testimonials, and Contact in the same header.

## How to get to it (user POV)

- Open the site root `/`.
- Choose the `teachai` logo, which links back to `/`.
- Choose `Features`, `Pricing`, `Testimonials`, or `Contact` in the header. On a narrow viewport, open `Open main menu` first.

## Driving it with Playwright

Preconditions:

- Doctor reports the secret-free server at `http://127.0.0.1:3000`.
- The viewport is desktop width (1280×800) so the header links are present without the mobile menu.
- `EVIDENCE_DIR` is set.

- **Open the landing page.** Visit `/`. Run `node .cursor/skills/verify-teachai/bin/drive-public-landing.mjs`. The response status is 200, the heading `Transform Your English Teaching with AI` is visible, and `public-landing/hero.png` plus `public-landing/hero.aria.txt` exist.
- **Jump to features.** Choose the header `Features` link. The same script clicks `navigation` → `link` named `Features`. The URL ends with `#features`, the heading `Everything you need to teach effectively` is visible, and `public-landing/features.png` plus `public-landing/features.aria.txt` exist.
- **Proof.** Read `public-landing/action.log`. It records the status and the post-click URL. The hero screenshot shows both the `teachai` header and the hero heading.

## Gotchas

- A non-empty `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` (including the placeholders in `.env.example`) switches the page to the Clerk branch. The secret-free hero proof does not apply there.
- The header logo is also a heading named `teachai`. Assert the hero by its full accessible name, `Transform Your English Teaching with AI`.
- The first HTML response is a spinner. The hero heading exists only after the page mounts in the browser.
- A second link named `Features` sits in the footer and points at `#`. Click the header link inside `navigation`. The footer link does not add `#features` to the URL.
- `Contact` is in the header, but the landing page has no `contact` section, so that link does not reveal a contact heading. Do not treat a click on `Contact` as proof that a contact section exists.
- `Watch Demo` and `Start Free 14-Day Trial` do not navigate when Clerk is unconfigured. A click with no new URL is not a completed signup.
- The mobile menu is not in the DOM until `Open main menu` is used. A desktop run does not prove that button.
