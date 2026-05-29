# Project overview

WordPress-to-custom rebuild for **Allen Kenoyer Glass**, a Lawndale, CA stained-glass studio run by Kristin. Replaces the existing WP site with a custom Next.js app — public marketing surface + an authenticated admin/CMS for Kristin to manage class schedules and a bulletin board.

**Locked scope:** no e-commerce, no online class registration. The frontend is largely static (content + portfolio + patterns catalog); the admin dashboard is the one dynamic surface and the core feature of the rebuild.

This document gives an agent the project context to do work; it does not duplicate `CLAUDE.md` (stack, commands, conventions, hard rules) or the individual phase READMEs (per-phase scope and exit criteria). Read it once at the start of a session that needs orientation beyond CLAUDE.md.

---

## Phases

The build runs in five phases (0–4), sequential by default. Within a phase, tasks may parallelize per their declared `depends_on` (see [`agent-protocol.md`](./agent-protocol.md)).

| Phase | Status |
| --- | --- |
| 0 — Foundation | **Complete** (shipped 2026-05-20) |
| 1 — Public Marketing Site | **Complete** (shipped 2026-05-22 → 2026-05-26) |
| 2 — Admin / CMS | Not started |
| 3 — Forms & Integrations | Not started |
| 4 — Analytics, Monitoring & Launch | Not started |

### Phase 0 — Foundation

Repo, tooling, CI, and deployment skeleton. Next.js 16 + TypeScript on Vercel (`sfo1`); pnpm + Node 24; Tailwind v4 + shadcn/ui (light-mode-only); Vitest + Playwright harnesses; ESLint + Prettier with CI gates. No user-facing routes. Shipped pre-orchestration-framework — no `phase-0/` README; the artifacts that survived are the repo state itself, ADRs 0001–0003, 0008, 0013–0014, and the Vercel project (`allen-kenoyer-redesign` under the 10xDev team, deploying from `main` to `sfo1`).

### Phase 1 — Public Marketing Site

The full public-facing site: 14 routes, mobile-responsive, fully navigable, with dev-authored content and real images served from Supabase Storage. No CMS yet — class/bulletin data ships as static placeholders to be wired up in Phase 2. → [`phase-1/README.md`](./phase-1/README.md)

### Phase 2 — Admin / CMS

Authenticated admin dashboard backed by Supabase Postgres + Auth. Manages exactly two content types: **classes** (two-tier `classes` → `cohorts` → `cohort_sessions` per [ADR-0015](./decisions/0015-content-modeling-classes.md)) and **bulletins** ([ADR-0016](./decisions/0016-content-modeling-bulletin-board.md)). Class data flows one-way to Kristin's public Google Calendar via service-account sync ([ADR-0020](./decisions/0020-google-calendar-integration.md)) — DB is source of truth, GCal is a mirror. The public site begins reading from the CMS as this phase progresses. *Phase folder not yet populated.*

### Phase 3 — Forms & Integrations

Contact form (Zod + React Hook Form + shadcn `<Form>` per [ADR-0009](./decisions/0009-forms-and-validation.md)) submitted via Server Actions + Resend ([ADR-0010](./decisions/0010-form-submission-and-transactional-email.md)). Newsletter signup is carved out — it links/embeds Constant Contact's hosted page rather than collecting emails server-side ([ADR-0011](./decisions/0011-newsletter-esp-integration.md)). *Phase folder not yet populated.*

### Phase 4 — Analytics, Monitoring & Launch

Vercel Web Analytics only ([ADR-0012](./decisions/0012-analytics-and-monitoring.md)). URL redirects from the legacy WP site land at launch ([ADR-0018](./decisions/0018-url-redirects-and-migration.md), with `next.config.ts` redirects + `trailingSlash: true`). SEO surface — `app/sitemap.ts`, per-page `metadata`, LocalBusiness JSON-LD, OG image — lands here ([ADR-0019](./decisions/0019-seo-and-schema-markup.md)). DNS cutover. *Phase folder not yet populated.*

---

## Data model shape (Phase 2 surface)

The admin manages exactly two content types ([ADR-0004](./decisions/0004-admin-dashboard-architecture.md)):

- **Classes** — two-tier: `classes` (named course template) → `cohorts` (specific run with a label and `kind` enum) → `cohort_sessions` (individual date+time rows). Public visibility requires class.published AND a published cohort AND that cohort having a future session ([ADR-0015](./decisions/0015-content-modeling-classes.md), [Amendment 2026-05-22](./decisions/0015-content-modeling-classes.md) for GCal sync columns).
- **Bulletins** — single-table, markdown body, display window ([ADR-0016](./decisions/0016-content-modeling-bulletin-board.md)).

The patterns catalog is **not** admin-managed — it lives as a typed `lib/patterns.ts` module per [ADR-0017](./decisions/0017-content-modeling-patterns-catalog.md). Adding/editing patterns is a code change.

---

## Cross-cutting concerns

Span phases — relevant regardless of which task you're on:

- **Testing strategy** — Vitest (unit) + Playwright (E2E), gated by CI ([ADR-0013](./decisions/0013-testing-strategy.md)).
- **Linting & formatting** — ESLint 9 + Prettier with CI gates ([ADR-0014](./decisions/0014-linting-and-formatting.md)). Established in Phase 0; enforced throughout.
- **Image storage** — single Supabase Storage bucket `site-images`, public-read with RLS for authenticated writes. Subfolders mirror routes ([ADR-0007](./decisions/0007-image-pipeline-and-storage.md)). Migration is idempotent via `pnpm migrate:images` and `pnpm migrate:patterns`.
- **Content migration** — Legacy WordPress content was extracted to `content/` and hand-converted to JSX during Phase 1. See [`../docs/notes/content-extraction-plan.md`](../docs/notes/content-extraction-plan.md) for extraction history. `content/` is `.vercelignore`'d and not importable from `src/`.
- **URL strategy** — `trailingSlash: true` ([ADR-0018](./decisions/0018-url-redirects-and-migration.md)) preserves the WP canonical URL form so every migrated URL is a single 301 hop at launch.
- **Stakeholder docs** — Plain-language design translations for Kristin live at [`../docs/for-kristin/`](../docs/for-kristin/). They're the client-facing form of the ADRs; the ADRs are how the build actually happens.
- **Page inventory + nav** — Locked with Kristin in [`../docs/website-outline.md`](../docs/website-outline.md). Source of truth for the public site's page list and header nav.
