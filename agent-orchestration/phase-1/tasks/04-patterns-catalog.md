---
id: 04-patterns-catalog
title: Patterns catalog routes (5 routes)
phase: 1
status: done
depends_on: [03-content-routes]
adrs_realized: [0017]
---

# Patterns catalog routes (5 routes)

## Goal

Land the 5 patterns routes (`/supplies/patterns` landing + 4 category routes) backed by a dev-managed catalog of ~165 patterns, with images served from Supabase Storage and a click-to-lightbox UX.

## Scope (in)

1. `src/lib/patterns.ts` typed array per [ADR-0017](../../decisions/0017-content-modeling-patterns-catalog.md). One `Pattern` record per catalog entry across all four categories (~165 total).
2. Pattern images uploaded to Supabase Storage at `patterns/[category]/<filename>` (preserving source `.gif` / `.jpg` extensions per ADR-0017). Source images come from `content/supplies/patterns/[category]/images/`. Migration ships as a parallel script `scripts/migrate-pattern-images.mjs` (run via `pnpm migrate:patterns`); it mirrors task `01-supabase-storage`'s `scripts/migrate-images.mjs` rather than extending it, since the patterns tree is nested by category while the slugs tree is flat. Run once after `lib/patterns.ts` records exist (so the script's uploads can be cross-checked against the catalog). Per [ADR-0017 Amendment 2026-05-22](../../decisions/0017-content-modeling-patterns-catalog.md), the original `/public/` storage decision was reversed in favor of consistency with the rest of the site's images.
3. `/supplies/patterns` landing page: brief intro, four category entry cards, copyright notice, ordering instructions ("Email or call to order any pattern by its number"). No per-pattern CTA per ADR-0017.
4. `/supplies/patterns/[category]` (×4): grid of pattern thumbnails using `next/image`, sorted natural-numeric ascending. Click opens a lightbox (image + number + price). No per-pattern URL.
5. All five routes mobile-responsive.

## Scope (out)

- Per-pattern URL — explicitly out per [ADR-0017](../../decisions/0017-content-modeling-patterns-catalog.md).
- Admin pattern management — patterns are dev-managed; out of project scope per CLAUDE.md.
- Per-pattern CTA / e-commerce — out of project scope (no e-commerce per project lock).

## Test specs

- `src/lib/patterns.test.ts` asserts catalog-construction invariants per [ADR-0017 Amendment 2026-05-26](../../decisions/0017-content-modeling-patterns-catalog.md) (uniqueness on `(category, number)`, not bare `number`, since five numbers appear in more than one category as distinct designs).
- Build-time verification: `generateStaticParams` over the four category slugs produces SSG'd routes (confirmed in build's route table).

## Exit criteria

- 165 `Pattern` records present in `src/lib/patterns.ts`.
- All pattern images at `site-images/patterns/<category>/<filename>`.
- Landing page + 4 category routes return 200 on the deployed Vercel URL.
- Lightbox functional on click; no per-pattern URL.
- Mobile (375px), tablet, desktop render cleanly.
- `pnpm check`, `pnpm test:e2e`, `pnpm build` all pass.

## Resolution

Shipped 2026-05-26. `src/lib/patterns.ts` shipped with **165** typed `Pattern` records across the four categories (`beginner`, `intermediate`, `advanced`, `mirrors-and-frames`), authored from the alternating `#<number>` / `$<price>` blocks in `content/supplies/patterns/<category>/content.md` per [ADR-0017 Amendment 2026-05-22 — price-field preservation](../../decisions/0017-content-modeling-patterns-catalog.md) (commit `7e89651`). Pattern images migrated to `site-images/patterns/<category>/` via `scripts/migrate-pattern-images.mjs` (run via `pnpm migrate:patterns`) — parallel to task `01-supabase-storage`'s `migrate-images.mjs` rather than extending it, since the patterns tree is nested by category while the slugs tree is flat (commit `9c47a99`). `/supplies/patterns` landing: brief intro, four category cards, copyright notice, "email or call to order any pattern by its number" instructions — no per-pattern CTA per [ADR-0017](../../decisions/0017-content-modeling-patterns-catalog.md). `/supplies/patterns/[category]` dynamic route with `generateStaticParams` over the four category slugs (SSG'd at build time — confirmed in the build's route table); grid of thumbnails via `next/image` sorted natural-numeric ascending, click opens a lightbox (shadcn `Dialog`) showing image + number + price; no per-pattern URL per ADR-0017 (commit `9f36624`). All five routes mobile-responsive.
