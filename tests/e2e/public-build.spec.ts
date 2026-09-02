import { expect, test } from "@playwright/test";

test("secret-free production server exposes the public landing page", async ({
  page,
}) => {
  const response = await page.goto("/");

  expect(response?.ok()).toBe(true);
  await expect(
    page.getByRole("heading", {
      name: "Transform Your English Teaching with AI",
    }),
  ).toBeVisible();
});

test("secret-free production server returns the generated not-found page", async ({
  page,
}) => {
  const response = await page.goto("/baseline-missing-page");

  expect(response?.status()).toBe(404);
  await expect(page.getByText(/This page could not be found/i)).toBeVisible();
});
