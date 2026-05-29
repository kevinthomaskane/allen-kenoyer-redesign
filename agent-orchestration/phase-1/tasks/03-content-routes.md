---
id: 03-content-routes
title: Content routes (9 conventional pages)
phase: 1
status: done
depends_on: [02-layout-shell]
adrs_realized: [0007, 0020]
---

# Content routes (9 conventional pages)

## Goal

Land the 9 conventional public routes with migrated content from `content/<slug>/content.md`, images via `next/image` from Supabase Storage, and the `/classes/calendar` Google Calendar embed.

## Scope (in)

1. One route per slug in `src/app/`: `/`, `/cabinet-doors`, `/classes`, `/classes/calendar`, `/contact`, `/custom-design`, `/portfolio`, `/repairs`, `/supplies`. Each route's content is manually converted from `content/<slug>/content.md` into JSX during this task. Extraction artifacts (stray `9` tokens, etc.) are cleaned up at conversion time.
2. Image references resolved to Supabase Storage URLs via `next/image` with explicit `width`/`height` props (no auto-detection since these are remote).
3. Each route inherits the layout chrome from task `02-layout-shell` and is mobile-responsive at the route level.
4. `/classes/calendar` embeds Kristin's existing public Google Calendar per [ADR-0020](../../decisions/0020-google-calendar-integration.md). This is the permanent surface, not a Phase 1 placeholder.
5. Real Allen Kenoyer Glass favicon (sourced from live WP) replacing the existing 404.
6. Shared route primitives: `PageHeader`, `Reveal`.

## Scope (out)

- Patterns routes — task `04-patterns-catalog`.
- Per-page `metadata` exports, sitemap, JSON-LD — Phase 4 ([ADR-0019](../../decisions/0019-seo-and-schema-markup.md)).
- Admin → GCal sync that populates the calendar — Phase 2 (does not change the public-side embed).
- Content rendering pipeline (no `react-markdown` / MDX / remark) — content is JSX after this task.

## Test specs

- Playwright E2E smoke expanded from "home renders" to walk every Chunk C route (`/`, `/cabinet-doors`, `/classes`, `/classes/calendar`, `/contact`, `/custom-design`, `/portfolio`, `/repairs`, `/supplies`) plus a footer-sitemap navigation assertion.
- Hero image E2E smoke validates the Supabase Storage `next/image` pipeline end-to-end (from task `01-supabase-storage`).

## Exit criteria

- All 9 routes return 200 on the deployed Vercel URL.
- Every route reachable from header + footer nav on every other route.
- All non-pattern images load from Supabase Storage via `next/image` with explicit dimensions.
- Mobile (375px), tablet (768px), desktop (1280px) render cleanly with no horizontal scroll.
- `pnpm check` and `pnpm test:e2e` pass.

## Resolution

Shipped 2026-05-26. All 9 conventional routes shipped (commits `f9dad02` `/cabinet-doors` → `6789ec9` `/`). Each route's content was manually converted from `content/<slug>/content.md` into JSX at build time per the plan; extraction artifacts (stray `9` tokens, etc.) cleaned at conversion. All non-pattern images render via `next/image` from Supabase Storage with explicit `width`/`height` per [ADR-0007](../../decisions/0007-image-pipeline-and-storage.md). Shared route primitives `Container`, `PageHeader`, `Reveal` added in commit `4c3d9b4`. `/classes/calendar` embeds Kristin's public Google Calendar per [ADR-0020](../../decisions/0020-google-calendar-integration.md) — this is the permanent surface, not a Phase 1 placeholder. The homepage was built last and then aligned to the approved demo design in commits `462b795` and `0491a5c`. E2E smoke expanded from "home renders" to walk every route plus a footer-sitemap navigation assertion (commit `dabb39e`). Favicon: commit `f47306a` added a placeholder `app/icon.png` to clear the 404; this resolution **replaces the placeholder with real Allen Kenoyer Glass branding** sourced from the live WP site — `app/icon.png` (32×32 primary), `app/icon1.png` (192×192 high-res fallback), `app/apple-icon.png` (180×180 Apple touch). File-based naming uses Next.js App Router conventions so each emitted `<link rel>` gets the correct `sizes` attribute auto-derived from PNG dimensions, mirroring the live site's existing `<link>` set. The legacy site's `msapplication-TileImage` (270×270, IE/old-Edge tile) is intentionally not carried over.
