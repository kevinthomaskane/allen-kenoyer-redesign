import { expect, test } from "@playwright/test";

// Chunk C exit criteria: every top-level public route renders and is reachable
// from header/footer nav. This smoke walks each route, asserts a 200 response,
// a visible H1, and (where applicable) the migrated Supabase image host.

const ROUTES: { path: string; heading: RegExp | string }[] = [
  { path: "/", heading: /Allen Kenoyer/i },
  { path: "/cabinet-doors/", heading: /Cabinet Doors/i },
  { path: "/classes/", heading: /Classes/i },
  { path: "/classes/calendar/", heading: /Class Calendar/i },
  { path: "/contact/", heading: /Come See Us/i },
  { path: "/custom-design/", heading: /Custom Stained Glass Design/i },
  { path: "/portfolio/", heading: /Portfolio/i },
  { path: "/repairs/", heading: /Repair/i },
  { path: "/supplies/", heading: /Art Glass Supplies/i },
];

for (const route of ROUTES) {
  test(`${route.path} renders with a visible heading`, async ({ page }) => {
    const response = await page.goto(route.path);
    expect(response?.status(), `${route.path} should respond 200`).toBe(200);
    await expect(
      page.getByRole("heading", { name: route.heading, level: 1 }),
    ).toBeVisible();
  });
}

test("footer sitemap reaches every top-level route from the home page", async ({
  page,
}) => {
  // Header dropdowns are click-to-toggle, so the footer is the more reliable
  // hop test — it exposes every route flat without interaction state.
  const footerLinks = [
    { name: "Custom Design", urlPattern: /\/custom-design\/?$/ },
    { name: "Repairs", urlPattern: /\/repairs\/?$/ },
    { name: "Cabinet Doors", urlPattern: /\/cabinet-doors\/?$/ },
    { name: "Portfolio", urlPattern: /\/portfolio\/?$/ },
    { name: "All Classes", urlPattern: /\/classes\/?$/ },
    { name: "Class Calendar", urlPattern: /\/classes\/calendar\/?$/ },
    { name: "All Supplies", urlPattern: /\/supplies\/?$/ },
    { name: "Contact", urlPattern: /\/contact\/?$/ },
  ];

  for (const link of footerLinks) {
    await page.goto("/");
    const footerLink = page
      .getByRole("contentinfo")
      .getByRole("link", { name: link.name, exact: true });
    await expect(
      footerLink,
      `footer link "${link.name}" should be visible`,
    ).toBeVisible();
    await footerLink.click();
    await expect(page).toHaveURL(link.urlPattern);
  }
});

test("home page hero loads an image via next/image from Supabase Storage", async ({
  page,
}) => {
  await page.goto("/");
  const heroImage = page.getByRole("img", {
    name: /arched beveled stained glass/i,
  });
  await expect(heroImage).toBeVisible();
  // next/image rewrites src to /_next/image?url=...&w=...&q=... — assert
  // the underlying source URL points at our Supabase bucket.
  const src = await heroImage.getAttribute("src");
  expect(
    src,
    "next/image should rewrite to /_next/image with a url param",
  ).toMatch(/\/_next\/image\/?\?.*url=.*supabase.*site-images/);
});
