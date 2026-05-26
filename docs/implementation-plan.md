# Implementation Plan — Allen Kenoyer Glass Rebuild

A phased roadmap for executing the architecture decisions recorded in [`decisions/`](./decisions/). Each phase cites the ADRs it realizes; the ADR remains the source of truth for *why* a choice was made.

This document is the plan-of-record for *how* and *in what order* the build happens. It is intentionally lightweight: phases capture goals, scope, and exit criteria — not task-level detail. Task tracking lives elsewhere.

---

## How to read this document

- **Phases are sequential by default**, but work within a phase may parallelize.
- **ADRs realized** lists which decisions are first put into code during the phase. A later phase may extend an ADR's surface area without re-listing it.
- **Exit criteria** are the demonstrable conditions that must be true before the next phase begins.
- **Open questions** capture anything we deferred during ADR acceptance that must be resolved before or during the phase.

---

## Phase 0 — Foundation

> Repo, tooling, and deployment skeleton. Nothing user-facing yet.

- **Goals:** Stand up a deploying Next.js app on Vercel with the tooling baseline (package manager, Node version, linting, formatting, styling primitives, CI, test harnesses) in place, so Phase 1 can begin building pages without tooling chores in the way.

- **ADRs realized:**
  - [ADR-0001](./decisions/0001-frontend-framework.md) — Next.js 16 (App Router) + TypeScript
  - [ADR-0002](./decisions/0002-hosting-platform.md) — Vercel (10xDev team, `sfo1`, public previews)
  - [ADR-0003](./decisions/0003-package-manager-and-node-version.md) — pnpm + Node 24 LTS
  - [ADR-0008](./decisions/0008-styling-and-ui-layer.md) — Tailwind v4 + shadcn/ui (init only)
  - [ADR-0013](./decisions/0013-testing-strategy.md) — Vitest + Playwright (harnesses only, no real tests yet)
  - [ADR-0014](./decisions/0014-linting-and-formatting.md) — ESLint + Prettier + CI gates

- **Scope (in):**
  1. Next.js 16 + TypeScript scaffold at the repo root (App Router).
  2. Move demo static-site files (`index.html`, `css/`, `js/`, `images/`) into a `demo/` subfolder. The demo is a **design reference** — a styled pitch of the proposed new site — not dead code; its style patterns, typography, and colors are the visual source-of-truth for Phase 1. Plan for removal once Phase 1 codifies those patterns in the new app's components and tokens. `content/` and `scripts/extract-content.js` stay where they are — they're active inputs to content migration.
  3. Pin pnpm and Node 24 LTS (`packageManager`, `engines`, `.nvmrc`).
  4. Create Vercel project under the 10xDev team, git-connect, set function region to `sfo1`, confirm preview deploys are public.
  5. First successful deploy of a placeholder home route (proves the pipeline end-to-end).
  6. ESLint + Prettier configured per ADR-0014 (`eslint-config-next`, `prettier-plugin-tailwindcss`, ESLint format rules disabled).
  7. Tailwind v4 installed (`@import "tailwindcss"` in `app/globals.css`); shadcn/ui CLI initialized; baseline token theme chosen; light-mode-only enforced (no `dark:` variants, no theme toggle).
  8. GitHub Actions workflow running lint + format-check on PR and push to `main`.
  9. Vitest and Playwright harnesses installed with one trivial passing test each, wired into the CI workflow.
  10. Base `app/layout.tsx`, font setup, root `metadata`, and a `robots.txt` scaffold (preview deploys are already `noindex` via Vercel headers).
  11. `.env.example` plus README notes covering dev commands and env var conventions.

- **Scope (out):**
  - Supabase project creation, schema, or env wiring (deferred to Phase 2).
  - Auth provider configuration (deferred to Phase 2).
  - Analytics/monitoring SDK install (deferred to Phase 4).
  - Any real page content, marketing pages, or admin UI.
  - Any real Vitest or Playwright tests beyond the trivial "harness works" cases.

- **Exit criteria:**
  - `main` deploys cleanly to Vercel on push; a preview URL is generated on PR.
  - Placeholder home route is reachable on the deployed URL.
  - `pnpm lint`, `pnpm format:check`, `pnpm test`, and `pnpm test:e2e` all pass locally and in CI.
  - Opening a PR blocks merge on lint/format/test failures (gates are real, not advisory).
  - A new contributor (or future-Kevin) can clone, `pnpm install`, `pnpm dev`, and have the app running in under five minutes.

- **Chunk F resolution (2026-05-20):** Vercel project `allen-kenoyer-redesign` created under 10xDev team (`prj_HaRVFReCB9eNE61ANiCVahxxxZyt`). Auto-deploys from `main`. Function region set to `sfo1` per [ADR-0002](./decisions/0002-hosting-platform.md) after initial deploy defaulted to `iad1`. Production URL: https://allen-kenoyer-redesign.vercel.app/.

- **Open questions:**
  - **Font wiring** in root layout — fonts identified from demo (Montserrat for sans, Playfair Display for serif) and declared as Tailwind tokens (`--font-sans`, `--font-serif`); actual `next/font` loading happens in Chunk E.

  *Resolved:* shadcn baseline theme → skipped stock baseline (`neutral`/`slate`/etc.) entirely. Brand tokens defined directly from `demo/css/styles.css` in `src/app/globals.css` and bridged into Tailwind v4 utilities via `@theme inline`. shadcn semantic tokens (`--background`, `--foreground`, `--primary`, etc.) reference brand tokens via `var()` so brand is single-source-of-truth.

  *Resolved:* `--destructive` color → standard utility red (`#dc2626`), deliberately off-palette so destructive actions read as warnings rather than blending with brand.

  *Resolved (Chunk D):* ESLint pinned to `9.39.4` (maintenance line), not 10.x. `eslint-plugin-react@7.37.5` (transitively pulled by `eslint-config-next`) hasn't migrated to ESLint 10's API. See [ADR-0014 Amendment 2026-05-20](./decisions/0014-linting-and-formatting.md#amendment-2026-05-20--eslint-9x-vs-10x).

  *Resolved (Chunk D):* Markdown docs (`docs/**`) excluded from Prettier. Author writing style is preserved; Prettier formats code only.

  *Resolved (Chunk D):* Playwright browsers installed in CI only, not committed locally. Run `pnpm exec playwright install` to enable local E2E.

  *Resolved (Chunk E):* Fonts loaded via `next/font/google` (Montserrat → `--font-montserrat`, Playfair Display → `--font-playfair`) on `<html>`; Tailwind tokens `--font-sans` / `--font-serif` reference them. Visually verified at `http://localhost:3000`.

  *Resolved (Chunk E):* Robots → initially `public/robots.txt` allowed all crawlers in production. Vercel auto-applies `X-Robots-Tag: noindex` on previews per [ADR-0002](./decisions/0002-hosting-platform.md).

  *Gap-fix 2026-05-20 (post-Chunk E, ADRs 0018 + 0019 finalization):*
  - **`trailingSlash: true`** added to `next.config.ts` per [ADR-0018](./decisions/0018-url-redirects-and-migration.md). All canonical URLs now end in `/`.
  - **`app/robots.ts`** replaces the static `public/robots.txt` per [ADR-0019](./decisions/0019-seo-and-schema-markup.md). Adds `Disallow: /admin/` (hint only; real gate is [ADR-0006](./decisions/0006-authentication.md) auth) and references the future sitemap URL.

  *Resolved:* Legacy/demo static site → moved to `demo/` subfolder during Phase 0. Demo is the design-reference source-of-truth, not just archived code; removed once Phase 1 codifies its style patterns in the new app.

  *Resolved:* Directory layout → `src/` (everything under `src/app/`, `src/lib/`, `src/components/`).

---

## Phase 1 — Public Marketing Site

> The full public-facing site: 14 routes, mobile-responsive, fully navigable, with dev-authored content and real images. No CMS yet — class/bulletin data ships as static placeholders to be wired up in Phase 2.

- **Goals:** Stand up every public route the studio's site needs, with real (migrated) content visible and real images served from their permanent storage location. Layouts are mobile-responsive from the start, not retrofitted. SEO surface (sitemap, per-page metadata, JSON-LD) is intentionally deferred to Phase 4 to keep this phase focused on shipping a navigable site.

- **ADRs realized:**
  - [ADR-0007](./decisions/0007-image-pipeline-and-storage.md) — Supabase Storage for dev-managed and (future) admin-uploaded images, `next/image` optimization
  - [ADR-0008](./decisions/0008-styling-and-ui-layer.md) — Tailwind + shadcn patterns put into use (component primitives, layout chrome)
  - [ADR-0017](./decisions/0017-content-modeling-patterns-catalog.md) — Patterns catalog as dev-managed TS module + Supabase Storage at `patterns/[category]/` (per [Amendment 2026-05-22](./decisions/0017-content-modeling-patterns-catalog.md#amendment-2026-05-22--pattern-image-storage-moves-to-supabase-storage); the original `/public/` decision was reversed)

- **Page inventory (14 routes):**
  - 9 conventional: `/`, `/cabinet-doors`, `/classes`, `/classes/calendar`, `/contact`, `/custom-design`, `/portfolio`, `/repairs`, `/supplies`
  - 5 patterns: `/supplies/patterns`, `/supplies/patterns/beginner`, `/supplies/patterns/intermediate`, `/supplies/patterns/advanced`, `/supplies/patterns/mirrors-and-frames`

- **Slicing:** by system / workstream, strictly sequential A → B → C → D (mirrors Phase 0's A–F shape).

- **Scope (in):**

  **Chunk A — Supabase Storage setup + image migration**
  1. Create Supabase project under the 10xDev organization, region paired with Vercel's `sfo1`.
  2. Create the `site-images` bucket per [ADR-0007](./decisions/0007-image-pipeline-and-storage.md): public-read for all assets, RLS write policy gating uploads to authenticated users (write surface won't be exercised until Phase 2).
  3. Decide bucket subfolder convention for content slugs not enumerated in ADR-0007 (cabinet-doors, custom-design, repairs, supplies, contact, home). Likely slug-based subfolders to mirror routes.
  4. One-time Node migration script in `scripts/` that walks `content/<slug>/images/` recursively and uploads each file to the appropriate bucket subfolder. Idempotent / re-runnable. Uses the service-role key from a local-only `.env` (never committed).
  5. Install `@supabase/supabase-js` (production dep for future Phase 2 use; only the migration script uses it in Phase 1).
  6. `NEXT_PUBLIC_SUPABASE_URL` wired into `.env.example` and Vercel env vars.
  7. Add Supabase Storage host to `images.remotePatterns` in `next.config.ts` so `next/image` can fetch and optimize.

  **Chunk B — Layout shell + navigation**
  1. Root layout chrome: header (logo, primary nav, contact CTA), footer (contact info, copyright, social if applicable). All using brand tokens defined in `globals.css`; no hex literals per the working rule.
  2. Mobile nav (hamburger or drawer pattern, accessible).
  3. Responsive breakpoints baseline (Tailwind defaults: `sm`, `md`, `lg`, `xl`). Layout chrome works cleanly across mobile / tablet / desktop.
  4. Shared layout primitives in `src/components/` (Container, SectionHeader, etc. — added incrementally as content chunks need them).
  5. Pull in shadcn primitives as needed (likely Button, Sheet/Dialog for mobile nav, NavigationMenu). Each via `pnpm dlx shadcn@latest add <name>`.
  6. Install **Motion** (`motion`, the rebrand of `framer-motion`) for animations — verify current latest version before install. Use the demo's `demo/js/animations.js` as a reference for the animation *vocabulary* (hero background parallax, scroll-triggered enter reveals on sections/cards/grids, page-load staggers on the hero, directional reveals on the about + contact sections), not as a literal port — pixel-perfect parity with the GSAP timings isn't a goal. Map to Motion idioms: `useScroll` + `useTransform` for parallax, `whileInView` (with `once: true`) for reveals, `variants` + `staggerChildren` for staggers, named eases like `backOut` for overshoot. No ADR — decision recorded here in the implementation plan.

  **Chunk C — Content routes (9 conventional pages)**
  1. One route per slug in `src/app/`. Each route's content is manually converted from `content/<slug>/content.md` into JSX during this chunk. Extraction artifacts (stray `9` tokens, etc.) are cleaned up at conversion time.
  2. Image references resolved to Supabase Storage URLs via `next/image` with explicit `width`/`height` props (no auto-detection since these are remote).
  3. Each route inherits the layout chrome from Chunk B and is mobile-responsive at the route level.
  4. `/classes/calendar` embeds Kristin's existing public Google Calendar per [ADR-0020](./decisions/0020-google-calendar-integration.md). This is the permanent surface, not a Phase 1 placeholder — the calendar Kristin and her students actually look at remains her Google Calendar. The admin → GCal sync that keeps the calendar current ships in Phase 2 alongside the admin dashboard and does not change the public-side embed.
  5. Cosmetic favicon.ico added (resolves the existing 404).

  **Chunk D — Patterns catalog routes (5 routes)**
  1. `lib/patterns.ts` typed array per [ADR-0017](./decisions/0017-content-modeling-patterns-catalog.md). One `Pattern` record per catalog entry across all four categories (~165 total).
  2. Pattern images uploaded to Supabase Storage at `patterns/[category]/<filename>` (preserving source `.gif` / `.jpg` extensions per ADR-0017). Source images come from `content/supplies/patterns/[category]/images/`. Migration ships as a parallel script `scripts/migrate-pattern-images.mjs` (run via `pnpm migrate:patterns`); it mirrors Chunk A's `scripts/migrate-images.mjs` rather than extending it, since the patterns tree is nested by category and the slugs tree is flat. Run once during Chunk D execution after `lib/patterns.ts` records exist (so the script's uploads can be cross-checked against the catalog). Per [ADR-0017 Amendment 2026-05-22](./decisions/0017-content-modeling-patterns-catalog.md#amendment-2026-05-22--pattern-image-storage-moves-to-supabase-storage), the original `/public/` storage decision was reversed in favor of consistency with the rest of the site's images.
  3. `/supplies/patterns` landing page: brief intro, four category entry cards, copyright notice, ordering instructions ("Email or call to order any pattern by its number"). No per-pattern CTA per ADR-0017.
  4. `/supplies/patterns/[category]` (×4): grid of pattern thumbnails using `next/image`, sorted by natural-numeric `number` ascending. Click opens a lightbox (image + number + price). No per-pattern URL.
  5. All five routes mobile-responsive.

- **Scope (out):**
  - SEO surface — `app/sitemap.ts`, per-page `metadata` exports, LocalBusiness JSON-LD, OG image asset ([ADR-0019](./decisions/0019-seo-and-schema-markup.md), deferred to Phase 4).
  - Auth, admin dashboard, database schema ([ADRs 0004–0006](./decisions/), Phase 2).
  - Class data wired to a real source (Phase 2; Phase 1 ships static placeholder).
  - Bulletin board ([ADR-0016](./decisions/0016-content-modeling-bulletin-board.md), Phase 2).
  - Contact form submission, transactional email, newsletter ([ADRs 0009–0011](./decisions/), Phase 3).
  - Analytics, monitoring, URL redirects from the legacy WordPress site ([ADRs 0012](./decisions/0012-analytics-and-monitoring.md), [0018](./decisions/0018-url-redirects-and-migration.md), Phase 4).
  - Content rendering pipeline (no `react-markdown` / MDX / remark) — content is converted manually once during Chunk C and lives as JSX in route files thereafter.

- **Exit criteria:**
  - All 14 routes render with their migrated content and reach a `200` on the deployed Vercel URL.
  - All images load from Supabase Storage — non-pattern content images at `site-images/<slug>/<filename>` (migrated in Chunk A), pattern images at `site-images/patterns/<category>/<filename>` (migrated in Chunk D per [ADR-0017 Amendment 2026-05-22](./decisions/0017-content-modeling-patterns-catalog.md#amendment-2026-05-22--pattern-image-storage-moves-to-supabase-storage)).
  - Every route is reachable from the header/footer nav on every other route — site is fully navigable without typing URLs.
  - Each route renders cleanly at mobile (`375px`), tablet (`768px`), and desktop (`1280px`) widths with no horizontal scroll.
  - `pnpm check` and `pnpm test:e2e` (Playwright smoke) pass locally and in CI. E2E smoke is expanded from "home renders" to a navigation walk through each top-level route.
  - No console errors on any route in production build.

- **Chunk A resolution (2026-05-22):** Supabase project `allen-kenoyer-glass` (ref `lgbeihhbkwnxykaaebbj`) created under the 10xDev org in `us-west-1` paired with Vercel's `sfo1` per [ADR-0002](./decisions/0002-hosting-platform.md). `site-images` public-read bucket created via SQL migration (`create_site_images_bucket_and_rls`, then `restrict_site_images_select_to_authenticated`); RLS on `storage.objects` grants the `authenticated` role INSERT + SELECT + UPDATE + DELETE scoped by `bucket_id = 'site-images'` — needed because Postgres RLS requires SELECT for UPDATE/DELETE rows to be visible, even though anon reads happen via the bucket's public CDN path (`bucket.public = true`). 117 images migrated from `content/<slug>/images/` to `site-images/<slug>/<filename>` via `scripts/migrate-images.mjs` (run via `pnpm migrate:images`); patterns deliberately excluded per [ADR-0017](./decisions/0017-content-modeling-patterns-catalog.md). `@supabase/supabase-js@2.106.1` installed as a production dep. `next.config.ts` derives the Supabase hostname from `NEXT_PUBLIC_SUPABASE_URL` at build time and configures `images.remotePatterns` to `/storage/v1/object/public/site-images/**`. Two `NEXT_PUBLIC_*` env vars set in Vercel (preview + production); `SUPABASE_SECRET_KEY` (modern replacement for the legacy `service_role` JWT) lives only in local `.env.local` for the migration script. One advisory accepted: `public_bucket_allows_listing` WARN — listing is exposed to `authenticated` only, which in this app means admin users (Kristin) per [ADR-0006](./decisions/0006-authentication.md)'s invite-only auth; SELECT cannot be dropped without breaking future admin UPDATE/DELETE workflows.

- **Note 2026-05-22 (post-Chunk A):** [ADR-0017 Amendment 2026-05-22](./decisions/0017-content-modeling-patterns-catalog.md#amendment-2026-05-22--pattern-image-storage-moves-to-supabase-storage) reversed the pattern-exclusion above. Patterns no longer go in `/public/`; they migrate to the same `site-images` bucket under `patterns/<category>/` during Chunk D, reusing the script pattern from Chunk A. The Chunk A resolution stands as the historical record of what shipped at the time; the migration of the remaining 165 pattern images is Chunk D scope.

- **Open questions:**
  - **Specific nav items and footer content** — derive from demo / studio inputs during Chunk B.
  - **Mobile nav pattern** (hamburger vs. drawer vs. sheet) — pick during Chunk B based on the demo's visual language.
  - **`/classes/calendar` placeholder shape** — what does the static placeholder say while we wait for the Phase 2 wiring? Decide during Chunk C.
  - **Pattern record authoring** — `lib/patterns.ts` needs `number` + `price` per record across ~165 entries. Both come from extracted content: `content/supplies/patterns/<category>/content.md` lists pattern numbers and prices in alternating `#<number>` / `$<price>` blocks (e.g., `#102C` → `$6.00`, `#121` → `$10.00`). Records authored from this source during Chunk D. See [ADR-0017 Amendment 2026-05-22](./decisions/0017-content-modeling-patterns-catalog.md#amendment-2026-05-22--price-field-preserved-from-existing-site-not-new).

---

## Phase 2 — Admin / CMS

> Authenticated admin dashboard, database, image pipeline. Public site begins reading from the CMS.

- **Goals:** _TBD_
- **ADRs realized:** _TBD_
- **Scope (in):** _TBD_
- **Scope (out):** _TBD_
- **Exit criteria:** _TBD_
- **Open questions:** _TBD_

---

## Phase 3 — Forms & Integrations

> Contact form, newsletter signup, transactional email, ESP wiring.

- **Goals:** _TBD_
- **ADRs realized:** _TBD_
- **Scope (in):** _TBD_
- **Scope (out):** _TBD_
- **Exit criteria:** _TBD_
- **Open questions:** _TBD_

---

## Phase 4 — Analytics, Monitoring & Launch

> Observability, redirects from the legacy site, DNS cutover, post-launch verification.

- **Goals:** _TBD_
- **ADRs realized:** _TBD_
- **Scope (in):** _TBD_
- **Scope (out):** _TBD_
- **Exit criteria:** _TBD_
- **Open questions:** _TBD_

---

## Cross-cutting concerns

Items that span phases and need a home regardless of where they land:

- Testing strategy ([ADR 0013](./decisions/0013-testing-strategy.md)) — when do tests get written, and against which phase's surface?
- Linting & formatting ([ADR 0014](./decisions/0014-linting-and-formatting.md)) — established in Phase 0, enforced thereafter.
- Content migration — extracting and porting content from the legacy WordPress site (see [`content-extraction-plan.md`](./notes/content-extraction-plan.md)).
- SEO ([`seo-research.md`](./notes/seo-research.md)) and redirects ([`redirects.md`](./notes/redirects.md)).

---

## Status

| Phase | Status |
|---|---|
| 0 — Foundation | **Complete** (Chunks A–F shipped 2026-05-20) |
| 1 — Public Marketing Site | In progress — Chunk A complete (2026-05-22), Chunks B–D pending |
| 2 — Admin / CMS | Not started |
| 3 — Forms & Integrations | Not started |
| 4 — Analytics, Monitoring & Launch | Not started |
