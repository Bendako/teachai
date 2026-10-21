# Pricing

Pricing shows Starter, Professional, and Enterprise plans and switches the displayed prices between monthly and yearly billing.

## Sub-features

- `pricing-open` shows the three plan names and monthly prices.
- `pricing-yearly` shows the yearly prices after the billing switch.

## How to get to it (user POV)

- From the landing page, choose `Pricing` in the header.
- Scroll to the section titled `Simple, transparent pricing`.

## Driving it with Playwright

Preconditions:

- Doctor reports the secret-free server at `http://127.0.0.1:3000`.
- Viewport is 1280×800.
- No Clerk publishable key is configured, so plan buttons stay on this page.

- **Open pricing.** Choose the header link `Pricing`. Run `page.getByRole("link", { name: "Pricing" }).click()` and expect the URL to end with `#pricing`.
- **Read monthly prices.** The heading `Simple, transparent pricing` is visible, with `$29` and `/month` for Starter, `$79` and `/month` for Professional, and `$199` and `/month` for Enterprise. Professional is marked `Most Popular`.
- **Switch to yearly.** Activate the unlabeled switch that sits between the text `Monthly` and the text `Yearly`. It is the first button in the pricing section. Run `page.locator("#pricing button").first().click()`. Starter shows `$290` and `/year`, Professional shows `$790` and `/year`, and Enterprise shows `$1990` and `/year`, each with `Save 20% with yearly billing`.
- **Proof.** Save a screenshot and an ARIA snapshot of the pricing section under `$EVIDENCE_DIR/pricing/` after the monthly view and again after the yearly view.

## Gotchas

- The billing control has no accessible name. It is the only button whose child is the sliding white dot. Do not click `Start Free Trial` or `Contact Sales` while aiming for the switch.
- `Start Free Trial` does not leave the page when Clerk is unconfigured. Price text is the proof that the switch worked, not a navigation.
- Yearly prices are ten times the monthly amounts (`29` → `290`, `79` → `790`, `199` → `1990`), not a 20% reduction of the monthly figure. The "Save 20%" label is separate copy.
