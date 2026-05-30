import { expect, test } from "@playwright/test";

// Task 02 exit criteria: /admin/* is gated behind auth; login + reset-password
// are reachable unauthenticated; there is no /signup (invite-only, ADR-0006).

// Redirects land on /admin/login/ — the site uses trailingSlash: true (ADR-0018).
test("unauthenticated /admin redirects to login", async ({ page }) => {
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/admin\/login\/?$/);
  await expect(page.getByLabel("Email")).toBeVisible();
});

test("unauthenticated /admin/classes redirects to login", async ({ page }) => {
  await page.goto("/admin/classes");
  await expect(page).toHaveURL(/\/admin\/login\/?$/);
});

test("/admin/login is reachable without auth", async ({ page }) => {
  const response = await page.goto("/admin/login");
  expect(response?.status()).toBe(200);
  await expect(page.getByLabel("Email")).toBeVisible();
  await expect(page.getByLabel("Password")).toBeVisible();
});

test("/signup does not exist", async ({ page }) => {
  const response = await page.goto("/signup");
  expect(response?.status()).toBe(404);
});

// Full login round-trip requires a seeded admin user. Gated on env credentials
// so the suite stays green where none are configured; set E2E_ADMIN_EMAIL and
// E2E_ADMIN_PASSWORD (against a seeded Supabase user) to exercise it.
const adminEmail = process.env.E2E_ADMIN_EMAIL;
const adminPassword = process.env.E2E_ADMIN_PASSWORD;

test("seeded admin can sign in and sign out", async ({ page }) => {
  test.skip(
    !adminEmail || !adminPassword,
    "Set E2E_ADMIN_EMAIL / E2E_ADMIN_PASSWORD to run the login round-trip",
  );

  await page.goto("/admin/login");
  await page.getByLabel("Email").fill(adminEmail!);
  await page.getByLabel("Password").fill(adminPassword!);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();

  await expect(page).toHaveURL(/\/admin\/?$/);
  await expect(
    page.getByRole("heading", { name: /studio dashboard/i, level: 1 }),
  ).toBeVisible();

  await page.getByRole("button", { name: /sign out/i }).click();
  await expect(page).toHaveURL(/\/admin\/login\/?$/);
});
