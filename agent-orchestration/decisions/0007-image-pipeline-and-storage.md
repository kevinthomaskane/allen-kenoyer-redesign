# ADR-0007: Image pipeline & storage

- **Status:** Accepted
- **Date:** 2026-05-19
- **Deciders:** Kevin Kane

## Context

The site has two distinct image sources:

1. **Developer-managed images** — pattern catalog (~165+ thumbnails across 4 difficulty levels), portfolio gallery, "more custom photos" gallery (~22 images), homepage/marketing imagery. These are loaded once during development and rarely change.
2. **Admin-uploaded images** — class images, uploadable and replaceable by the studio manager via the admin dashboard.

The admin-upload requirement was a scope clarification during this ADR's discussion: it adds an `image_url` (or similar) field to the `Class` content type (recorded in [ADR-0015: Content modeling — classes](./0015-content-modeling-classes.md)) and requires the admin dashboard to support image upload. This does not change the architecture of [ADR-0004](./0004-admin-dashboard-architecture.md) — still 2 content types, still custom-built admin, still flat permissions — only the Class schema grows.

[ADR-0005](./0005-database-and-query-layer.md) locked Supabase Pro, which includes 100GB of Storage. Total image volume for this site is on the order of hundreds of megabytes — orders of magnitude under that limit.

## Options considered

### Storage location
- **In-repo `/public/images/`** — simplest, free, no external service, git-versioned. Doesn't support admin uploads (admin can't write to the repo).
- **Supabase Storage** — included in the Pro plan, served via CDN, supports admin uploads via `supabase-js`, integrates with auth-based access policies. Already paid for.
- **Vercel Blob** — Vercel-native blob storage. Splits assets across two providers (Vercel + Supabase) with no compelling reason.
- **Cloudinary / ImgIX** — image-specific services with built-in transformations. Overkill for our scale; another vendor.

### Optimization layer
- **`next/image` exclusively** — Next.js handles all transformations (responsive `srcset`, AVIF/WebP, lazy loading, blur placeholders). Vercel Pro includes 5,000 image transformations/month; our scale stays under this.
- **Supabase Storage built-in transformations** — Supabase's `?width=...&format=webp` URL params, cached at Supabase's CDN. Less integrated with Next.js — no automatic responsive `srcset`, no framework-native blur placeholders.
- **Hybrid** — `next/image` for responsive rendering, Supabase transformations for upload-time thumbnail generation. Most flexible, slightly more setup, only worth it if we expect to brush against Vercel's transformation limit.

## Decision

Three bundled calls:

1. **Storage:** Supabase Storage. All site images (dev-managed and admin-uploaded) live in a single public-read bucket. The admin dashboard uploads via `supabase-js`'s storage client; the public site reads via direct CDN URLs.
2. **Optimization:** `next/image` exclusively. `next.config.ts` includes Supabase Storage in `images.remotePatterns` so `next/image` can fetch and optimize from the bucket.
3. **Bucket access model:** Public read for all images (since every image on this site is destined for public display); writes restricted to authenticated users via Supabase Storage RLS policies. Specific RLS policy SQL will live in the storage-related migration file.

**Bucket organization:** A single bucket (e.g. `site-images/`) with subfolders by content type (`classes/`, `patterns/`, `patterns/beginner/`, `patterns/intermediate/`, etc., `portfolio/`, `custom-photos/`, `marketing/`). One bucket simplifies RLS policies; subfolders make ops and migrations cleaner. Exact path conventions are dev-guide level.

**Vercel transformation limit:** Vercel Pro's 5,000 image transformations/month should comfortably accommodate this site's traffic profile. If we ever brush against the limit, the upgrade path is to revisit this ADR and add Supabase transformations as an offload layer (hybrid mode) — not a re-architecture.

## Rationale

- **Supabase Storage is the natural pairing** with the Supabase database and `supabase-js` SDK locked in [ADR-0005](./0005-database-and-query-layer.md). It's already paid for at orders of magnitude more capacity than this site will use, the upload SDK is the same client we're already importing, and storage access policies share the same RLS model as the database tables.
- **Admin-upload requirement makes in-repo storage non-viable.** Even if it weren't a requirement, Supabase Storage keeps the git repo clean and decouples deploy cycles from image changes.
- **`next/image` is the Next.js default for a reason.** Automatic responsive `srcset`, modern format negotiation (AVIF → WebP → JPEG), lazy loading, blur placeholders — all framework-integrated with no extra code. Building those features manually against Supabase transformations would be reinventing what the framework already provides.
- **Single bucket with public reads** matches the reality that every image on this site is meant to be seen. Multiple buckets or signed URLs would add complexity for no security benefit; the only thing worth gating is *uploads*, which is handled by RLS write policies tied to the auth session from [ADR-0006](./0006-authentication.md).

## Tradeoffs accepted

- **Coupling to Supabase deepens further.** DB ([0005](./0005-database-and-query-layer.md)) + Auth ([0006](./0006-authentication.md)) + Storage (this ADR) are all Supabase. Migration off the platform would mean re-hosting images plus rewriting upload flows. Acceptable; consistent with the pattern.
- **Vercel image transformation limit is a soft cap.** Sustained traffic spikes that blow past 5K transformations/month would incur per-transformation cost or force a hybrid optimization model. Acceptable as a future concern; revisit if it materializes.
- **Public-read bucket means image URLs are guessable.** This is a non-issue because every image is intentionally public, but worth recording in case future features add admin-only images (in which case we'd need a private bucket or signed URLs — a content-modeling decision, not an architecture revision).
- **`next/image` requires `remotePatterns` config maintenance.** Adding a new Supabase project or bucket means updating `next.config.ts`. Minor.
- **No image versioning.** Images aren't tracked in git history. If a class image is replaced, the previous version is overwritten in Storage. Acceptable for studio operations; if versioning ever matters, Supabase Storage supports a `cacheControl` and we can adopt a content-hashed filename convention.

## Related decisions

- Depends on: [ADR-0001](./0001-frontend-framework.md) (`next/image` is Next.js-specific), [ADR-0005](./0005-database-and-query-layer.md) (Supabase as the platform), [ADR-0006](./0006-authentication.md) (auth session gates Storage write RLS).
- Influences: Content modeling — classes (`Class.image_url` field), admin upload UX (dev guide), Vercel transformation quota monitoring (ops).
