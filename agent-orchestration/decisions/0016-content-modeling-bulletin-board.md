# ADR-0016: Content modeling — bulletin board

- **Status:** Accepted
- **Date:** 2026-05-20
- **Deciders:** Kevin Kane

## Context

[ADR-0004](./0004-admin-dashboard-architecture.md) committed to a custom-built admin managing exactly two content types: classes (now modeled in [ADR-0015](./0015-content-modeling-classes.md)) and bulletin posts. The field list documented in `docs/archive/current-pages-for-kristin.txt` is short: title, message, display dates (start/end), published/draft. Active bulletins display on the homepage; more than one may be active at a time.

This ADR locks the *shape* of the bulletin content model — display window semantics, lifecycle of expired bulletins, message format, ordering when multiple are active, and which optional features (image, detail page, type/severity) are in or out.

Constraints that apply:

- **Same database for admin and public** ([ADR-0004](./0004-admin-dashboard-architecture.md)); ISR or on-demand revalidation makes the homepage reflect bulletin changes quickly.
- **Studio reality:** bulletins are operational notices — holiday closures, temporary hours, special sales, occasional events. Short-form, time-sensitive, written quickly. Not a blog or news feed.
- **Homepage strip placement** (design intent, not locked here): bulletins display inline on the homepage, not on dedicated pages.

## Options considered

### Display window semantics
- **Both required (auto-expire).** Forces an end date so nothing lingers. Strict.
- **Start required, end optional.** Matches the existing description ("leave the end date open for ongoing notices"). Open-ended bulletins run until manually unpublished.
- **Both optional, published-only.** Simplest, no schedule logic. Loses the "next Friday's announcement" use case.
- **Both optional with defaults (start = now, end = null).** Same data shape as "start required, end optional" with a more forgiving UX framing.

### Lifecycle after expiry
- **Persist; admin toggle reveals past.** Mirrors the expired-cohort pattern from [ADR-0015](./0015-content-modeling-classes.md).
- **Auto-delete on expiry.** Cleaner DB; loses history; requires a background job.
- **Persist; no admin filtering.** Simplest UI; clutters over time.

### Type/categorization
- **Strict enum** (Closure / Sale / Event / General) driving public styling.
- **Severity enum** (Info / Notice / Alert) — lighter, less content-specific.
- **No type field.** All bulletins styled identically; tone carried by title and message.

### Message format
- **Plain text only** — simplest admin UI; no formatting.
- **Markdown with toolbar** — stored as markdown, admin form has bold/italic/link/list buttons that insert syntax.
- **Rich-text WYSIWYG** — most flexible, build/maintain cost.
- **Plain text + auto-linking** — render-side links for URLs/phone numbers, no other formatting.

### Detail pages
- **Inline-only** — no slug, no per-bulletin URL.
- **Inline summary + optional detail page** — supports longer messages and shareable URLs.
- **Always has detail page** — every bulletin gets a slug.

### Image
- **No image field** — text-only bulletins.
- **Optional image** — adds upload UI; uses [ADR-0007](./0007-image-pipeline-and-storage.md) pipeline.

### Title required?
- **Required** — every bulletin has a heading.
- **Optional** — short message-only bulletins allowed.

### Multiple-active ordering
- **Newest first (display_start DESC)** — blog/social convention.
- **Oldest first** — long-running notices stay on top.
- **Manual `sort_order` field** — explicit per-bulletin control.
- **Newest first + manual pin toggle** — sensible default with escape hatch.

## Decision

### Schema

**`bulletins` table** (single table, no children):

| Field | Type | Notes |
|---|---|---|
| `id` | uuid (PK) | |
| `title` | text (nullable) | Optional. Public component conditionally renders the heading. |
| `message` | text | Required. Stored as markdown. |
| `display_start` | timestamptz | Required. Admin form defaults to "now" so immediate bulletins aren't friction; the column itself is `NOT NULL`. |
| `display_end` | timestamptz (nullable) | Optional. `NULL` = open-ended; runs until unpublished or deleted. |
| `published` | boolean | Draft/publish toggle. |
| `created_at`, `updated_at` | timestamptz | |

### Public visibility rule

A bulletin is visible on the public homepage if and only if **all three** are true:

1. `published === true`
2. `display_start <= now()`
3. `display_end IS NULL OR display_end > now()`

When `display_end` passes, the bulletin disappears from public view automatically. If `display_end` is null, the bulletin runs until Kristin unpublishes or deletes it.

### Active ordering

Multiple active bulletins on the homepage are ordered by `display_start DESC` — newest first. Kristin influences order by scheduling start dates. No pin toggle, no manual sort field.

### Lifecycle of expired bulletins

Expired bulletins persist in the database indefinitely. The admin list view shows active bulletins by default with a "Show past bulletins" toggle revealing the rest. Kristin can manually delete past bulletins; no automatic cleanup job runs. This deliberately mirrors the cohort lifecycle pattern from [ADR-0015](./0015-content-modeling-classes.md) — one mental model across both content types.

### Message format

Stored as markdown. The admin form provides a small toolbar (bold, italic, link, list) that inserts markdown syntax into a textarea — Kristin doesn't have to learn raw syntax for the common cases. The public homepage renders bulletins through a markdown parser.

### Excluded by decision

- **No image field.** Bulletins are text-only (title + markdown message).
- **No detail pages.** No slug, no per-bulletin route. Bulletins must be short enough to display inline on the homepage.
- **No type or severity field.** All bulletins styled identically; the title and message carry the tone.
- **No pin / manual sort.** Ordering is mechanical (`display_start DESC`).

## Rationale

- **Optional `display_end` matches studio reality.** Some notices ("Studio hours have changed permanently to…") run until Kristin decides they're old news; others ("Closed Friday 5/24") have a clean expiry. Forcing both dates would either lie (with a fake far-future end date) or rule out a legitimate use case. Making `display_start` required keeps the schedule semantics meaningful.
- **`display_start` required, defaulting to "now" in the admin form,** preserves the schedule-ahead use case without making immediate bulletins more work than they need to be.
- **Persisted expiry + admin toggle** beats auto-delete for the same reasons cohort persistence does: no background job to operate, accidental history is occasionally useful, and the admin keeps a single "this is what I've ever posted" view.
- **No type/severity field** because the field list we'd choose isn't obviously correct — closures are urgent, sales are upbeat, events are informational, but Kristin's actual bulletins won't always fit those buckets cleanly. Forcing a choice on every post is friction; the homepage component can carry visual weight without category-specific styling.
- **Markdown with a toolbar** is the right ceiling for a non-technical author: covers the realistic needs (clickable phone numbers, bold dates, occasional links) without the build cost and pasted-HTML risk of a full WYSIWYG editor.
- **Inline-only, no detail pages** keeps the scope tight. Bulletins are operational notices, not articles — a "/announcements/[slug]" route for "Closed Friday" would be near-empty pages we don't need. If the content ever outgrows the homepage strip, we add detail pages in a follow-up ADR.
- **Newest-first ordering** matches the way readers scan a homepage notice strip and gives Kristin a single lever (`display_start`) for ordering. A pin toggle was considered but adds a field for an edge case ("permanent notice that should stay on top") that the optional `display_end` already covers — a "permanent" notice is just one with no end date and a recent enough start that it doesn't drift down.
- **Optional title** because short bulletins ("Closed 5/24 — Memorial Day weekend") read fine without a heading; requiring one forces awkward duplication of the message in shorthand.

## Tradeoffs accepted

- **No type field means uniform styling.** A "Holiday Closure" reads with the same visual weight as a "Spring Sale." Acceptable because Kristin can lean on emoji or bold in the title/message if she wants visual emphasis; consistent styling is one less thing to coordinate.
- **No image field.** Sale bulletins or event announcements can't include a photo. Acceptable — bulletins are inline on the homepage where vertical space is constrained; if a visual is essential, that content probably belongs on the page that announces it (e.g., the Classes page for a class event), not the bulletin strip.
- **No detail pages.** Bulletin content can't be linked to or shared by URL, and message length is constrained by what fits in the homepage strip. Acceptable for current scope; reversible by adding a `slug` column and a route later.
- **No manual ordering.** If two bulletins have the same `display_start` (unlikely but possible), tiebreak falls to `created_at` or `id`. No mechanism for Kristin to override. Acceptable — the volume of concurrent bulletins makes ordering disputes near-zero.
- **No native scheduled-publish separate from `display_start`.** `published === true` controls intent; `display_start > now()` controls when it actually appears. If Kristin sets `published = true` and `display_start` in the future, the bulletin is queued — no separate `publish_at` field needed. The mild confusion is whether "Published but not visible yet" reads as a clear admin state; the UI will need to show this status explicitly.
- **Optional title means inconsistent public layout.** Some bulletins render with a heading, some without. Acceptable; the markdown body can carry the lead phrase when there's no title.

## Related decisions

- Depends on: [ADR-0004](./0004-admin-dashboard-architecture.md) (defines bulletins as one of the two admin-managed content types), [ADR-0005](./0005-database-and-query-layer.md) (Postgres + Supabase CLI migrations will implement this schema).
- Influences: SEO & schema markup (later ADR; bulletins are unlikely to need structured-data markup but the homepage's `NewsArticle` posture, if any, would draw from this shape), admin UI build (single-table form with a markdown toolbar), public homepage rendering (visibility query against `bulletins` + a markdown renderer).
- Mirrors: [ADR-0015](./0015-content-modeling-classes.md)'s expired-cohort lifecycle pattern (persist + admin toggle).
