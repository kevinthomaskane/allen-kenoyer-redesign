# ADR-0017: Content modeling — patterns catalog

- **Status:** Accepted
- **Date:** 2026-05-20
- **Deciders:** Kevin Kane

## Context

The studio publishes a catalog of stained glass patterns customers can browse and order by number via phone or email. The existing site organizes patterns into four categories — Beginner (58), Intermediate (50), Advanced (38), and Mirrors & Frames (19) — for a total of ~165 records. Each pattern is currently shown as a thumbnail image with a catalog number; customers identify a pattern by number and place orders off-site.

[ADR-0004](./0004-admin-dashboard-architecture.md) specifies that the patterns catalog is **developer-managed**, not admin-editable. That decision rules out the database-backed model used for classes ([ADR-0015](./0015-content-modeling-classes.md)) and bulletins ([ADR-0016](./0016-content-modeling-bulletin-board.md)). The remaining decisions are about file structure, the per-pattern record shape, and the public browsing experience.

Inspection of the extracted content (`content/supplies/patterns/[category]/images/*`) reveals that pattern numbers are alphanumeric strings — `102C`, `103C`, `105`, `14903`, etc. — not pure integers, and image extensions vary across the catalog (`.gif` and `.jpg` both present). These shape the type design below.

Constraints that apply:

- **No e-commerce** (locked scope). Pricing is informational; orders happen off-site.
- **Catalog content changes rarely.** Pattern records and images are added in commits, not at runtime. There is no admin UI for patterns.
- **Public site is largely static** (locked scope). Patterns pages are read-only browsing.
- **Patterns are copyrighted** (per the existing site). The site historically says "copying or downloading is not permitted"; web images are inherently downloadable.

## Options considered

### Storage shape

- **Single TypeScript module** (`lib/patterns.ts` exporting a typed array). Strong typing, one place to look, simple to import.
- **One TS module per category.** Smaller files, category implied by file name. Same type safety.
- **Per-category JSON files.** Universally editable; no type safety unless paired with a schema.
- **Per-pattern markdown files with frontmatter.** One file per pattern; overkill given no body content.

### Image storage

- **Static in `/public/patterns/[category]/...`.** Build-time optimization via `next/image`. No DB, no API call, no runtime dependency.
- **Supabase Storage** (consistent with [ADR-0007](./0007-image-pipeline-and-storage.md) for admin-uploaded images). Adds a network hop and migration ceremony for content that never changes outside commits.
- **Static + pre-generated variants at build time.** Faster first paint, more build complexity.

### Per-pattern fields

The minimum is image + a unique identifier. Beyond that:

- **Name** — short human-readable label. Current site shows numbers only.
- **Dimensions** — useful for fitment, would require authoring across 165 records.
- **Description** — 1–2 sentences each, also authoring overhead.
- **Price** — current site doesn't publish prices; this would be new for the rebuild. *See "Amendment 2026-05-22" below — this premise was incorrect.*

### Detail pages vs grid-only

- **Grid only with lightbox/modal.** No per-pattern URL.
- **Per-pattern detail pages** at `/supplies/patterns/[category]/[number]`. Shareable URLs, near-empty pages given the minimal field set.
- **Hybrid** (lightbox state synced to URL via query param). Shareable without dedicated routes.

### Copyright posture

- **No technical protection; rely on copyright law and a clear notice.**
- **Right-click disable** (cosmetic; trivially bypassed).
- **Watermark** (degrades browsing UX).
- **Low-resolution only** (degrades the lightbox).

### Sort order

- **Numeric ascending**, **numeric descending**, **manual sort field**, or **source order** (the order they appear in the TS module).

### Order CTA from the lightbox

- **Mailto:** prefilled email.
- **Link to /contact** with pattern number in query.
- **Both buttons.**
- **No per-pattern CTA**; category-level ordering instructions only.

## Decision

### Storage

A single TypeScript module — `lib/patterns.ts` — exports a typed array of all pattern records. Adding a pattern is a code change: drop the image file into `/public/patterns/[category]/`, then append the matching record to the array. The TypeScript type acts as the schema:

```ts
type PatternCategory =
  | 'beginner'
  | 'intermediate'
  | 'advanced'
  | 'mirrors-and-frames';

type Pattern = {
  number: string;            // e.g., "102C", "105", "14903"
  category: PatternCategory;
  price: number;             // USD, informational only
  image: string;             // filename relative to /public/patterns/[category]/
  alt?: string;              // optional alt text override
};
```

`number` is a string, not an integer — the existing catalog uses alphanumeric numbers (`102C`, `103C`, etc.) that don't fit an integer type. Uniqueness is enforced at the catalog level, not just per-category, but the public site exposes patterns within their category page.

### Image storage

Pattern images live as static assets under `/public/patterns/[category]/`. `next/image` handles responsive sizing and format optimization at build/request time. Extensions are preserved from the source files (mix of `.gif` and `.jpg` is acceptable; `next/image` re-encodes for delivery). No Supabase Storage involvement for the patterns catalog.

### Browsing UX

- **Grid only.** Each category page (`/supplies/patterns/[category]`) renders a grid of thumbnails.
- **Lightbox on click** opens a larger view in-place, showing the image, number, and price.
- **No per-pattern URL.** Patterns are not individually shareable; the lightbox is a viewer, not a route.
- **No per-pattern order CTA.** Ordering instructions live at the category page level ("Email or call to order any pattern by its number").

### Sort order

Within each category, patterns sort by `number` ascending. Because `number` is a string, the sort uses natural ordering (numeric segments compared as numbers, so `"9"` precedes `"10"`, and `"102"` precedes `"102C"`). The implementation detail (`Intl.Collator` with numeric option, or a custom comparator) is a dev-guide concern.

### Copyright posture

No technical protection. Images are served at the resolution needed for confident browsing — full quality in the lightbox. A clear copyright notice on the `/supplies/patterns` landing page states that designs are copyrighted and reproduction is not permitted without authorization. Determined copying is possible; the studio relies on copyright law for recourse, not on code.

### Excluded by decision

- **No name field.** Patterns are identified by number alone, matching the current site.
- **No dimensions field.** Not authored on the current site; not adding the authoring burden in the rebuild.
- **No description field.** Same reasoning.
- **No detail pages.** Grid + lightbox is the entire browsing experience.
- **No per-pattern CTA in the lightbox.** Category-level ordering instructions cover it.
- **No watermark, right-click disable, or low-res restriction.** Clean UX wins over cosmetic deterrents.

## Rationale

- **A single TypeScript module beats per-file or per-category alternatives at this scale.** 165 records of 4–5 fields each fit comfortably in one well-formatted file (~1000 lines). A single import target, full type-checking on every record, and trivial filtering/grouping at consumption time. Per-pattern markdown files would be 165 nearly-empty files with no body content — pure ceremony.
- **Static images in `/public/` are right for this content type.** Patterns never change at runtime, there's no admin upload flow, and `next/image` already optimizes static assets in `/public/` the same way it would Supabase-hosted images. Adding Supabase Storage as a hop would slow first paint without buying anything — the admin convenience [ADR-0007](./0007-image-pipeline-and-storage.md) is built for doesn't apply when the content is dev-managed.
- **Alphanumeric `number` string** is required by the existing data; the rebuild preserves the studio's existing pattern numbering rather than re-numbering 165 records.
- **Price field is new** but stays informational. Customers historically called or emailed to ask about prices; surfacing the price on the catalog page removes friction without crossing into e-commerce (no cart, no checkout, no payment). *See "Amendment 2026-05-22" below — the "new" framing was incorrect; the field is preserved from the existing site, not introduced.*
- **Grid + lightbox** matches how stained glass pattern catalogs are actually used — visual scanning, comparing several at once, zooming into the ones that catch the eye. Detail pages would mean clicking back-and-forth between near-empty pages for a view the lightbox already provides.
- **No per-pattern CTA in the lightbox** because the studio's ordering flow is conversational ("call us and tell us which numbers you want") — a customer often orders several patterns in one inquiry, and surfacing a single-pattern button would push them toward less efficient single-pattern emails.
- **Numeric-aware sort by `number` ascending** matches how customers think about the catalog ("show me #105 through #110") and keeps adjacent variants (`102C` and `103C`) near each other.
- **Rejecting technical copyright protection** because every option degrades legitimate browsing more than it deters bad-faith copying. A watermark obscures the very design the customer is trying to evaluate; right-click disable annoys the customer who legitimately wants to open the image in a new tab; low-res serves makes the lightbox less useful. The studio's actual recourse against copying has always been copyright law, and a clear notice on the landing page preserves that.

## Tradeoffs accepted

- **165 records in one file.** `lib/patterns.ts` will be a long module. Acceptable because the file structure is simple (one type, one exported array); diffing additions is straightforward. If the catalog grows substantially (say, past 500 records), splitting by category becomes worth revisiting.
- **No type safety on data shape at runtime.** TypeScript types are erased; if a record is malformed it's caught only at compile time. Acceptable since this is dev-managed and changes go through code review.
- **No per-pattern URLs.** A customer can't text a friend a link to pattern #142. Acceptable for a print-catalog-style browsing experience; reversible if the need ever surfaces.
- **No name, dimensions, or description.** The catalog stays sparse. Customers who want details ask the studio. This matches the existing flow and avoids the authoring burden of writing 165 entries' worth of metadata.
- **Mixed image extensions (`.gif` + `.jpg`).** Acceptable because `next/image` re-encodes images for delivery; the source format doesn't affect output. The `image` field preserves the source extension to avoid surprise breakage during migration.
- **No technical copyright protection.** Images can be saved by any visitor with browser tools. Acceptable; the studio's risk profile is small (most casual visitors aren't pirating stained glass patterns) and legal recourse remains intact.
- **Price field on a non-commerce site** could lead a visitor to expect online ordering. The catalog page and lightbox must phrase ordering instructions clearly — "Order by phone or email, reference pattern numbers" — to avoid confusion. *See "Amendment 2026-05-22" below — the underlying concern still applies, but the risk isn't new with the rebuild; the live site already publishes prices alongside conversational ordering.*

## Related decisions

- Depends on: [ADR-0004](./0004-admin-dashboard-architecture.md) (designates patterns as developer-managed, not admin), [ADR-0001](./0001-frontend-framework.md) (Next.js + `next/image` enable the static-asset pipeline).
- Does *not* depend on: [ADR-0005](./0005-database-and-query-layer.md) (no DB involvement), [ADR-0007](./0007-image-pipeline-and-storage.md) (no Supabase Storage involvement for patterns).
- Influences: URL redirect & migration strategy (next ADR; the live site uses `/patterns/[category]` but the rebuild puts them at `/supplies/patterns/[category]`), SEO & schema markup (later ADR; consider whether `CreativeWork` markup is worthwhile on individual patterns given no detail page).

## Amendment 2026-05-22 — Price field preserved from existing site, not new

The original ADR characterized the `price` field as net-new for the rebuild, based on the live-site inspection at authoring time. That premise was incorrect. The extracted content under `content/supplies/patterns/<category>/content.md` already includes prices for the catalog, formatted as alternating `#<number>` / `$<price>` blocks (e.g., `#102C` → `$6.00`, `#121` → `$10.00`). The rebuild is *preserving* an existing field, not introducing one.

The decision itself stands unchanged: `price: number` remains a required field on the `Pattern` type, surfaced in the lightbox alongside the image and number. The framing that shifts:

- **Options considered → Per-pattern fields** — "current site doesn't publish prices" is false. The current site does publish prices on its category pages.
- **Rationale → "Price field is new"** — should read "Price field is preserved from the existing site." The "informational, not transactional" framing is still correct.
- **Tradeoffs accepted → "Price field on a non-commerce site could lead a visitor to expect online ordering"** — concern still applies; clear ordering instructions in the lightbox + landing page remain important. What's not true is that the rebuild introduces this risk — the live site already navigates exactly this combination (prices published + conversational ordering).

Authoring source for [Phase 1 Chunk D](../implementation-plan.md#phase-1--public-marketing-site): pattern numbers and prices are both parsed from `content/supplies/patterns/<category>/content.md` to populate the `lib/patterns.ts` records.
