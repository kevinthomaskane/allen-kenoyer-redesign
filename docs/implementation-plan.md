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

> Static frontend: home, about, galleries, contact, etc. Content can be hard-coded or stubbed at this stage.

- **Goals:** _TBD_
- **ADRs realized:** _TBD_
- **Scope (in):** _TBD_
- **Scope (out):** _TBD_
- **Exit criteria:** _TBD_
- **Open questions:** _TBD_

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
- Content migration — extracting and porting content from the legacy WordPress site (see [`content-extraction-plan.md`](./content-extraction-plan.md)).
- SEO ([`seo-research.md`](./seo-research.md)) and redirects ([`redirects.md`](./redirects.md)).

---

## Status

| Phase | Status |
|---|---|
| 0 — Foundation | **Complete** (Chunks A–F shipped 2026-05-20) |
| 1 — Public Marketing Site | Not started |
| 2 — Admin / CMS | Not started |
| 3 — Forms & Integrations | Not started |
| 4 — Analytics, Monitoring & Launch | Not started |
