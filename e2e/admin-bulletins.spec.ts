import { expect, test, type Page } from "@playwright/test";

// Task 05 exit criteria: an admin can create/edit/publish/delete a bulletin via
// the markdown toolbar + display-window controls; the active list shows
// non-expired bulletins, the four status states read unambiguously, and a past
// (expired) bulletin is revealed via "Show past".
//
// Gated on a seeded admin (same convention as admin-auth.spec.ts); the suite
// stays green where no credentials are configured.
const adminEmail = process.env.E2E_ADMIN_EMAIL;
const adminPassword = process.env.E2E_ADMIN_PASSWORD;
const hasCreds = Boolean(adminEmail && adminPassword);

async function createBulletin(
  page: Page,
  opts: {
    title: string;
    message: string;
    boldenMessage?: boolean;
    start?: string;
    end?: string;
    publish?: boolean;
  },
) {
  await page.goto("/admin/bulletins/new");
  await page.getByLabel(/^Title/).fill(opts.title);

  const message = page.getByLabel("Message");
  await message.fill(opts.message);
  if (opts.boldenMessage) {
    await message.focus();
    await page.keyboard.press("ControlOrMeta+a");
    await page.getByRole("button", { name: "Bold" }).click();
    await expect(message).toHaveValue(`**${opts.message}**`);
  }

  if (opts.start) await page.getByLabel("Display start").fill(opts.start);
  if (opts.end) await page.getByLabel(/^Display end/).fill(opts.end);
  if (opts.publish) await page.getByRole("switch").click();

  await page.getByRole("button", { name: /create bulletin/i }).click();
  await expect(page).toHaveURL(/\/admin\/bulletins\/?$/);
}

async function deleteBulletin(page: Page, title: string) {
  const row = page.getByRole("row").filter({ hasText: title });
  page.once("dialog", (dialog) => dialog.accept());
  await row.getByRole("button", { name: /delete/i }).click();
  await expect(page.getByRole("row").filter({ hasText: title })).toHaveCount(0);
}

test.describe("admin bulletins", () => {
  test.skip(
    !hasCreds,
    "Set E2E_ADMIN_EMAIL / E2E_ADMIN_PASSWORD to run the admin bulletin flow",
  );

  test.beforeEach(async ({ page }) => {
    await page.goto("/admin/login");
    await page.getByLabel("Email").fill(adminEmail!);
    await page.getByLabel("Password").fill(adminPassword!);
    await page.getByRole("button", { name: "Sign in", exact: true }).click();
    await expect(page).toHaveURL(/\/admin\/?$/);
  });

  test("create via the toolbar, see it Visible, then delete", async ({
    page,
  }) => {
    const title = `E2E visible ${Date.now()}`;
    // No end date, start defaults to now, published → Visible.
    await createBulletin(page, {
      title,
      message: "Closed this weekend",
      boldenMessage: true,
      publish: true,
    });

    const row = page.getByRole("row").filter({ hasText: title });
    await expect(row).toBeVisible();
    await expect(row).toContainText("Visible");

    await deleteBulletin(page, title);
  });

  test("a published future-start bulletin reads as Queued", async ({
    page,
  }) => {
    const title = `E2E queued ${Date.now()}`;
    await createBulletin(page, {
      title,
      message: "Spring sale announcement",
      start: "2099-01-01T09:00",
      publish: true,
    });

    const row = page.getByRole("row").filter({ hasText: title });
    await expect(row).toBeVisible();
    await expect(row).toContainText("Queued");

    await deleteBulletin(page, title);
  });

  test("an expired bulletin is hidden until 'Show past'", async ({ page }) => {
    const title = `E2E expired ${Date.now()}`;
    await createBulletin(page, {
      title,
      message: "Closed for Memorial Day",
      start: "2020-01-01T09:00",
      end: "2020-02-01T09:00",
      publish: true,
    });

    // Not in the default (active) list.
    await expect(page.getByRole("row").filter({ hasText: title })).toHaveCount(
      0,
    );

    await page.getByRole("link", { name: /show past bulletins/i }).click();

    const row = page.getByRole("row").filter({ hasText: title });
    await expect(row).toBeVisible();
    await expect(row).toContainText("Expired");

    await deleteBulletin(page, title);
  });
});
