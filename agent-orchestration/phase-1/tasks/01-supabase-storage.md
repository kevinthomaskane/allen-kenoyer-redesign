---
id: 01-supabase-storage
title: Supabase Storage setup + image migration
phase: 1
status: done
depends_on: []
adrs_realized: [0007]
---

# Supabase Storage setup + image migration

## Goal

Stand up the Supabase project + `site-images` bucket and migrate all non-pattern content images to it, so Phase 1's content routes can render images via `next/image` from a permanent CDN-backed location.

## Scope (in)

1. Create Supabase project under the 10xDev organization, region paired with Vercel's `sfo1`.
2. Create the `site-images` bucket per ADR-0007: public-read for all assets, RLS write policy gating uploads to authenticated users (write surface won't be exercised until Phase 2).
3. Decide bucket subfolder convention for content slugs not enumerated in ADR-0007 (cabinet-doors, custom-design, repairs, supplies, contact, home). Slug-based subfolders to mirror routes.
4. One-time Node migration script in `scripts/` that walks `content/<slug>/images/` recursively and uploads each file to the appropriate bucket subfolder. Idempotent / re-runnable. Uses the modern Supabase secret key from a local-only `.env.local` (never committed).
5. Install `@supabase/supabase-js` (production dep for future Phase 2 use; only the migration script uses it in Phase 1).
6. `NEXT_PUBLIC_SUPABASE_URL` and publishable key wired into `.env.example` and Vercel env vars.
7. Add Supabase Storage host to `images.remotePatterns` in `next.config.ts` so `next/image` can fetch and optimize.

## Scope (out)

- Pattern images — deferred to task `04-patterns-catalog` per [ADR-0017 Amendment 2026-05-22](../../decisions/0017-content-modeling-patterns-catalog.md).
- Admin upload UI — Phase 2.
- Database schema, auth — Phase 2.

## Test specs

- No new unit/E2E tests for this task; the migration is validated end-to-end by subsequent content route tests in `03-content-routes` (hero image E2E smoke).
- Migration script idempotency verified manually by re-running `pnpm migrate:images` and confirming no duplicate uploads.

## Exit criteria

- Supabase project created in `us-west-1` (paired with Vercel `sfo1`).
- `site-images` bucket created via SQL migration; public-read; RLS policies in place.
- All non-pattern content images present at `site-images/<slug>/<filename>`.
- `pnpm migrate:images` re-runnable without duplicate uploads.
- `next/image` successfully fetches and optimizes a Supabase Storage URL.

## Resolution

Shipped 2026-05-22. Supabase project `allen-kenoyer-glass` (ref `lgbeihhbkwnxykaaebbj`) created under the 10xDev org in `us-west-1` paired with Vercel's `sfo1` per [ADR-0002](../../decisions/0002-hosting-platform.md). `site-images` public-read bucket created via SQL migration (`create_site_images_bucket_and_rls`, then `restrict_site_images_select_to_authenticated`); RLS on `storage.objects` grants the `authenticated` role INSERT + SELECT + UPDATE + DELETE scoped by `bucket_id = 'site-images'` — needed because Postgres RLS requires SELECT for UPDATE/DELETE rows to be visible, even though anon reads happen via the bucket's public CDN path (`bucket.public = true`). 117 images migrated from `content/<slug>/images/` to `site-images/<slug>/<filename>` via `scripts/migrate-images.mjs` (run via `pnpm migrate:images`); patterns deliberately excluded per [ADR-0017](../../decisions/0017-content-modeling-patterns-catalog.md). `@supabase/supabase-js@2.106.1` installed as a production dep. `next.config.ts` derives the Supabase hostname from `NEXT_PUBLIC_SUPABASE_URL` at build time and configures `images.remotePatterns` to `/storage/v1/object/public/site-images/**`. Two `NEXT_PUBLIC_*` env vars set in Vercel (preview + production); `SUPABASE_SECRET_KEY` (modern replacement for the legacy `service_role` JWT) lives only in local `.env.local` for the migration script. One advisory accepted: `public_bucket_allows_listing` WARN — listing is exposed to `authenticated` only, which in this app means admin users (Kristin) per [ADR-0006](../../decisions/0006-authentication.md)'s invite-only auth; SELECT cannot be dropped without breaking future admin UPDATE/DELETE workflows.

Post-shipment note (2026-05-22): [ADR-0017 Amendment 2026-05-22](../../decisions/0017-content-modeling-patterns-catalog.md) reversed the pattern-exclusion above. Patterns no longer go in `/public/`; they migrate to the same `site-images` bucket under `patterns/<category>/` during task `04-patterns-catalog`, reusing this script's pattern.
