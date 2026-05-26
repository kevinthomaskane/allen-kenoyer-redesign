# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this project is

WordPress-to-custom rebuild for Allen Kenoyer Glass (Lawndale, CA stained glass studio). Public marketing site plus an authenticated admin/CMS surface for the studio manager (Kristin). **Locked scope:** no e-commerce, no online class registration, frontend is largely static, the admin dashboard is the one dynamic surface and the core feature of the project.

## Source-of-truth docs (read these before substantive work)

Project decisions are **ADR-first**. Implementation follows a phased plan that cites the ADRs it realizes. Do not propose architecture changes without checking what's already decided.

The `docs/` layout is index-driven — start at [`docs/README.md`](./docs/README.md), which disambiguates "current authoritative" from "client-facing translation" from "earlier draft / superseded." Key entry points:

- **[`docs/implementation-plan.md`](./docs/implementation-plan.md)** — plan of record for what's being built and in what order. Phase 0 → 4 with chunks, scope, exit criteria, and resolution blocks. Check the Status table at the bottom for current phase progress.
- **[`docs/website-outline.md`](./docs/website-outline.md)** — pages and navigation as locked with Kristin. **This is the source of truth for the public-site page inventory and header nav.** If something in an internal draft or earlier doc disagrees with this, this wins.
- **[`docs/parallel-claude-sessions.md`](./docs/parallel-claude-sessions.md)** — required reading **only when another Claude session is active on this repo at the same time** (Kevin will say so explicitly). Worktree setup, branch convention, and the failure mode that made the structural separation necessary. Skip if working solo on `main`.
- **[`docs/decisions/`](./docs/decisions/)** — 21 ADRs (0001–0021), all Accepted. Read the ADR (not just its title) before touching the surface it governs.
- **[`docs/for-kristin/`](./docs/for-kristin/)** — stakeholder-facing plain-language design docs (calendar integration → ADR-0020, dashboard workflow → ADR-0021). Useful for understanding what was promised to the client; the ADRs are how it actually gets built.
- **[`docs/notes/`](./docs/notes/)** — internal working notes and research. **Not canonical.** Context for how decisions were reached; the relevant ADR is the actual commitment.
- **`docs/archive/`** — local-only historical artifacts (superseded outlines, early client drafts). Don't cite these as canon. The `current-pages-for-kristin.txt` artifact lives here — it was the _first_ client-facing pages draft and has been superseded by `website-outline.md`.

When an ADR amendment lands, it appears as an `### Amendment YYYY-MM-DD — <title>` subsection in the ADR file itself. Affected sections in the original decision text get italic forward pointers (`*See "Amendment YYYY-MM-DD" below — ...*`). Always read the bottom of an ADR before quoting its decisions.

## Current build state (verify with `git log` / `docs/implementation-plan.md`)

- **Phase 0 (Foundation)** — complete. Repo, tooling, CI, deploy pipeline.
- **Phase 1 (Public Marketing Site)** — Chunk A complete (Supabase Storage + image migration). Chunks B (layout/nav), C (content routes), D (patterns) pending.
- **Phase 2 (Admin/CMS)**, **Phase 3 (Forms & Integrations)**, **Phase 4 (Launch)** — not started.

Phased execution is sequential by default. Don't start Phase N+1 work until Phase N's exit criteria are met.

## Commands

```bash
pnpm dev               # Next.js dev server (Turbopack)
pnpm build             # Production build
pnpm lint              # ESLint
pnpm format            # Prettier --write
pnpm format:check      # Prettier --check (CI uses this)
pnpm typecheck         # tsc --noEmit
pnpm test              # Vitest run (one-shot)
pnpm test:watch        # Vitest watch mode
pnpm test:e2e          # Playwright E2E
pnpm check             # lint + format:check + typecheck + vitest (mirrors CI)
pnpm check:e2e         # pnpm check + Playwright
pnpm migrate:images    # Re-run image migration to Supabase Storage (idempotent)
```

**Run a single Vitest test:** `pnpm vitest run path/to/file.test.ts -t "test name pattern"`.

**Hard rule: run `pnpm check` locally before every `git push`.** It mirrors CI exactly. See `~/.claude/projects/.../memory/feedback_pnpm_check_before_push.md` for context.

**Local E2E** needs Playwright browsers installed: `pnpm exec playwright install` (one-time).

## Architecture

### Stack

- **Framework:** Next.js 16 (App Router) + React 19 + TypeScript ([ADR-0001](./docs/decisions/0001-frontend-framework.md))
- **Hosting:** Vercel Pro, 10xDev team, region `sfo1`, preview deploys public ([ADR-0002](./docs/decisions/0002-hosting-platform.md))
- **Runtime:** pnpm 11 on Node 24 LTS ([ADR-0003](./docs/decisions/0003-package-manager-and-node-version.md))
- **Database / auth / storage:** Supabase Pro — Postgres + Auth + Storage ([ADRs 0005](./docs/decisions/0005-database-and-query-layer.md), [0006](./docs/decisions/0006-authentication.md), [0007](./docs/decisions/0007-image-pipeline-and-storage.md))
- **Styling:** Tailwind v4 (CSS-first `@theme inline`) + shadcn/ui, light-mode-only ([ADR-0008](./docs/decisions/0008-styling-and-ui-layer.md))
- **Forms:** Zod + React Hook Form + shadcn `<Form>` ([ADR-0009](./docs/decisions/0009-forms-and-validation.md)), submitted via Server Actions + Resend ([ADR-0010](./docs/decisions/0010-form-submission-and-transactional-email.md)); newsletter signup is carved out — it links/embeds Constant Contact's hosted page ([ADR-0011](./docs/decisions/0011-newsletter-esp-integration.md))
- **Tests:** Vitest (unit) + Playwright (E2E), CI-gated ([ADR-0013](./docs/decisions/0013-testing-strategy.md))
- **Lint/format:** ESLint 9 + Prettier ([ADR-0014](./docs/decisions/0014-linting-and-formatting.md))
- **Analytics:** Vercel Web Analytics only ([ADR-0012](./docs/decisions/0012-analytics-and-monitoring.md))

### Data model shape (built in Phase 2)

The admin manages exactly two content types ([ADR-0004](./docs/decisions/0004-admin-dashboard-architecture.md)):

- **Classes** — two-tier model: `classes` (named course template) → `cohorts` (specific run with a label and `kind` enum) → `cohort_sessions` (individual date+time rows). Public visibility requires class.published AND a published cohort AND that cohort having a future session ([ADR-0015](./docs/decisions/0015-content-modeling-classes.md), with [Amendment 2026-05-22](./docs/decisions/0015-content-modeling-classes.md) adding GCal sync columns).
- **Bulletins** — single-table, markdown body, display window ([ADR-0016](./docs/decisions/0016-content-modeling-bulletin-board.md)).

Class data flows one-way to Kristin's public Google Calendar via a service-account integration ([ADR-0020](./docs/decisions/0020-google-calendar-integration.md)) — DB is source of truth, GCal is a mirror.

### Patterns catalog (not admin-managed)

The ~165-pattern catalog is **dev-managed**, not in the database. It lives as a typed `lib/patterns.ts` module ([ADR-0017](./docs/decisions/0017-content-modeling-patterns-catalog.md)). Pattern images live in Supabase Storage at `site-images/patterns/<category>/` per the [Amendment 2026-05-22](./docs/decisions/0017-content-modeling-patterns-catalog.md) (the original `/public/` decision was reversed for consistency with the rest of the site's images).

### Image storage

All site images live in a single Supabase Storage bucket: `site-images`. Public-read, RLS policies for authenticated writes (admin uploads in Phase 2). Subfolders mirror routes (`site-images/portfolio/`, `site-images/classes/`, `site-images/patterns/<category>/`, etc.). The migration is idempotent via `pnpm migrate:images`. See [ADR-0007](./docs/decisions/0007-image-pipeline-and-storage.md) and `scripts/migrate-images.mjs`.

### URL strategy

`trailingSlash: true` in `next.config.ts` ([ADR-0018](./docs/decisions/0018-url-redirects-and-migration.md)) preserves the WordPress canonical URL form so every migrated URL is a single 301 hop. Redirects from legacy WP paths to new ones are configured in `next.config.ts` at launch time.

### SEO surface

`app/sitemap.ts`, per-page `metadata`, LocalBusiness JSON-LD, Course/Event JSON-LD per class — all deferred to Phase 4. Don't add these piecemeal during Phases 1–3 ([ADR-0019](./docs/decisions/0019-seo-and-schema-markup.md)).

## Project layout

```
src/
  app/        # Next.js App Router pages, layouts, route handlers
  lib/        # Shared utilities (cn helper, future patterns.ts, etc.)
  components/ # UI primitives (added via `pnpm dlx shadcn@latest add <name>`)
e2e/          # Playwright tests
public/       # Static assets served at /
docs/         # ADRs, implementation plan, content extraction notes, Kristin-facing docs
demo/         # Original styled redesign pitch — design reference, removed once Phase 1 codifies its style patterns
scripts/      # Migration scripts (extract-content, migrate-images). Own package.json for isolated deps.
content/      # Extracted legacy WordPress content (markdown + images). Input to migration; not served at runtime.
```

## Project conventions (the non-obvious ones)

### Design tokens & styling

**No hex literals in JSX/CSS/inline styles.** All colors flow through Tailwind tokens defined in `src/app/globals.css`. Use Tailwind utilities (`bg-primary`, `text-muted-foreground`, `border-accent-gold`, etc.). If a color is needed that isn't tokenized yet, add the token to `globals.css` first, then use the utility. This is non-negotiable — see `~/.claude/projects/.../memory/feedback_no_hex_literals.md`.

Brand tokens are defined directly from `demo/css/styles.css` and bridged into Tailwind v4 utilities via `@theme inline`. shadcn semantic tokens (`--background`, `--foreground`, `--primary`, etc.) reference brand tokens via `var()` so brand is the single source of truth. shadcn's stock baseline themes (neutral/slate/etc.) are intentionally not used.

### Patterns image storage

For _new_ pattern images: they go in **Supabase Storage** (`site-images/patterns/<category>/`), not `/public/patterns/`. The `/public/` approach was reversed in [ADR-0017 Amendment 2026-05-22](./docs/decisions/0017-content-modeling-patterns-catalog.md).

### When to write an ADR vs. a dev-guide entry

If reversing the decision would require touching many files and rewriting other decisions → ADR. Otherwise it's dev-guide-level (icon library, font choices, date utility, ID generation, build-time script details). See [docs/decisions/README.md#what-is-not-an-adr](./docs/decisions/README.md#what-is-not-an-adr).

### ADR workflow

ADRs are immutable once Accepted. To change a decision, write an Amendment subsection at the bottom of the ADR with the date and what changed, and add italic forward pointers from each section the amendment affects so a reader doesn't walk away with stale premises. Pending amendments from an In-Discussion ADR live as an "On acceptance — amendment to drop into ADR-NNNN" section in the proposing ADR; they're only applied to the target ADR when the proposing ADR moves to Accepted (see ADR-0020's pattern).

### Secrets

`.env.local` is local-only and git-ignored. The Supabase **secret key** (`sb_secret_...`, modern replacement for the legacy `service_role` JWT) lives only in `.env.local`; it is **not** added to Vercel and is never prefixed with `NEXT_PUBLIC_`. The publishable key (`sb_publishable_...`) is the client-safe key; it goes in Vercel for preview + production. Use modern keys, not legacy `anon` / `service_role` JWTs.

### Supabase MCP and skills

The Supabase agent skills are installed at `.agents/skills/supabase` and `.agents/skills/supabase-postgres-best-practices`. Invoke them before introducing Supabase API surface for the first time in a session — they capture RLS gotchas (e.g., "Storage upsert requires INSERT + SELECT + UPDATE", "views bypass RLS unless `security_invoker = true`", "`TO authenticated` alone is BOLA/IDOR") that aren't in stale training data.

Use the Supabase MCP `execute_sql` for iterative schema work and `apply_migration` to commit stable changes (the migration history row is what `supabase db pull` will materialize as a migration file locally later). Run `get_advisors` after any DDL — it catches missing RLS and similar issues. **No Storage MCP tools exist**; bucket creation is via SQL (`storage.buckets` is a regular table) and file uploads are via local Node scripts using `@supabase/supabase-js` with the secret key.

### Prettier / ESLint scope

Prettier ignores `docs/`, `demo/`, `content/`, `scripts/`, and `.agents/` (per `.prettierignore`). ESLint runs across `src/` and `e2e/`. Markdown in `docs/` is preserved in author style (Kevin's writing); don't auto-format it.
