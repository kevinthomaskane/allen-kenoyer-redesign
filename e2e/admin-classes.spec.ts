import { expect, test, type Page } from "@playwright/test";

// Task 03 exit criteria: an admin can create, edit, and publish a class; the
// slug auto-derives; an image uploads on pick and persists on Save; the status
// pill reflects the four visibility states.
//
// The full round-trip needs a seeded admin user AND writes to Supabase, so it
// is gated on env credentials and skipped where none are configured (mirrors
// e2e/admin-auth.spec.ts so the suite stays green by default). Set
// E2E_ADMIN_EMAIL / E2E_ADMIN_PASSWORD against a seeded user to run it.
const adminEmail = process.env.E2E_ADMIN_EMAIL;
const adminPassword = process.env.E2E_ADMIN_PASSWORD;

// 1×1 transparent PNG.
const PNG_BASE64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

async function signIn(page: Page) {
  await page.goto("/admin/login");
  await page.getByLabel("Email").fill(adminEmail!);
  await page.getByLabel("Password").fill(adminPassword!);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL(/\/admin\/?$/);
}

test.describe("admin classes", () => {
  test.skip(
    !adminEmail || !adminPassword,
    "Set E2E_ADMIN_EMAIL / E2E_ADMIN_PASSWORD to run the classes round-trip",
  );

  test("create, list, publish, and upload an image", async ({ page }) => {
    const name = `E2E Copper Foil ${Date.now()}`;
    await signIn(page);

    // Create — leave Published unchecked so it lands as a Draft.
    await page.goto("/admin/classes/new");
    await page.getByLabel("Name").fill(name);
    await page.getByLabel("Description").fill("An automated test class.");
    await page.getByLabel("Tuition").fill("120");
    await page.getByRole("button", { name: "Save class" }).click();

    // Redirected to the detail page; heading + Draft pill.
    await expect(page).toHaveURL(/\/admin\/classes\/[0-9a-f-]{36}\/?$/);
    await expect(page.getByRole("heading", { name, level: 1 })).toBeVisible();
    await expect(page.getByText("Draft", { exact: true })).toBeVisible();

    // Appears in the list with the Draft pill, found via name search.
    await page.goto("/admin/classes");
    await page.getByLabel("Search classes by name").fill(name);
    const row = page.getByRole("row", { name: new RegExp(name) });
    await expect(row).toBeVisible();
    await expect(row.getByText("Draft", { exact: true })).toBeVisible();

    // Edit: publish + upload an image with alt text.
    await row.getByRole("link", { name }).click();
    await expect(page).toHaveURL(/\/admin\/classes\/[0-9a-f-]{36}\/?$/);

    await page.getByLabel("Published").check();
    await page.locator('input[type="file"]').setInputFiles({
      name: "test.png",
      mimeType: "image/png",
      buffer: Buffer.from(PNG_BASE64, "base64"),
    });
    // Preview appears once the upload resolves.
    await expect(page.getByRole("img").first()).toBeVisible();
    await page.getByLabel("Image alt text").fill("Test class image");
    await page.getByRole("button", { name: "Save class" }).click();

    // Published but no cohort yet → the targeted Hidden banner + pill.
    await expect(page).toHaveURL(/\/admin\/classes\/[0-9a-f-]{36}\/?$/);
    await expect(
      page.getByText("Hidden — no published cohort", { exact: true }),
    ).toBeVisible();

    // Image persists across reload (its src points at our Supabase bucket).
    await page.reload();
    const preview = page.getByRole("img").first();
    await expect(preview).toBeVisible();
    const src = await preview.getAttribute("src");
    expect(src).toMatch(/url=.*supabase.*site-images%2Fclasses/);
  });
});
