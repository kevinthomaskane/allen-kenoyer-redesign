# ADR-0021: Admin class workflow UX

- **Status:** Accepted
- **Date:** 2026-05-26
- **Deciders:** Kevin Kane

## Context

[ADR-0004](./0004-admin-dashboard-architecture.md) settled the admin platform (custom Next.js, Server Actions, flat permissions, classes + bulletins as the two content types). [ADR-0015](./0015-content-modeling-classes.md) settled the class data shape — a two-tier model with `classes` (named courses), `cohorts` (specific offerings), and `cohort_sessions` (individual date+time rows).

Neither ADR specifies *how* Kristin moves through the UI to create those records. That workflow design is the subject of this ADR.

Two design tensions shape the work:

1. **Data model vs. mental model.** ADR-0015 introduced cohorts as a separate tier to handle concurrent runs of the same class (Tuesday-evening cohort vs. Saturday-morning cohort of "Beginning Copper Foil"). Kristin's onboarding doc (`docs/archive/current-pages-for-kristin.txt`) describes the workflow more flatly — dates feel like a property of the class, not a separate entity. The UI must reconcile the explicit data shape with the simpler mental model.
2. **Multi-week courses vs. one-off workshops.** The studio's class list mixes 5-week structured courses ("Beginning Copper Foil") with drop-in workshops ("3-D Beveled Star", "Cutting Class"). Forcing every class through the same multi-session cohort flow would add friction for the workshop case; ignoring the distinction would lose useful frontend rendering signal.

Constraints that apply:

- The admin user is one person (Kristin) with no developer assistance ([ADR-0004](./0004-admin-dashboard-architecture.md) scope).
- No online registration ([locked scope](./README.md)) — the workflow does not include any reservation state.
- The schema in [ADR-0015](./0015-content-modeling-classes.md) is the source of truth; UI must produce valid records against that schema.

## Decisions

### A. Information architecture

**Decision: Class-centric routes with nested cohorts.**

- `/admin` — dashboard landing (shape settled by decision K below)
- `/admin/classes` — list of all classes (published + draft)
- `/admin/classes/new` — create new class form
- `/admin/classes/[id]` — class detail page (class info form + cohort list + cohort creation entry points + session management)

Cohorts and sessions are managed inline on the class detail page. No standalone cohort URLs (`/admin/cohorts/[id]` does not exist).

### B. Cohort creation entry points

**Decision: Two affordances on the class detail page — "New cohort" and "New single session".**

- **"New cohort"** opens the multi-session cohort form (label, recurring session builder, per-row session edits, published toggle). Used for structured courses ("Beginning Copper Foil — Spring 2026, 5 Tuesday evenings").
- **"New single session"** opens a simplified form (date + start time + end time + published toggle, no cohort label, no recurring builder). Used for one-off workshops. Behind the scenes, a `cohorts` row is auto-created with `kind = 'single_session'` plus exactly one `cohort_sessions` row.

The dual entry point absorbs the data model's cohort tier into the UI without exposing it for the workshop case. The frontend branches rendering on `cohort.kind` (a column added by this ADR's acceptance — see [ADR-0015](./0015-content-modeling-classes.md)'s 2026-05-26 amendment).

### C. Single-session distinction in the data

**Decision: `kind` enum column on the `cohorts` table.** Values: `'multi_session' | 'single_session'`. Set on insert based on the admin's entry-point choice; immutable thereafter. This is a schema change against [ADR-0015](./0015-content-modeling-classes.md); the amendment landed there on this ADR's acceptance as `## Amendment 2026-05-26 — Cohort kind column`, alongside [ADR-0020](./0020-google-calendar-integration.md)'s prior 2026-05-22 amendment.

Alternatives considered and rejected:

- **Derive from session count** — fragile (a multi-session cohort with deletions could collapse to one session and start rendering as a workshop) and ambiguous during cohort creation before sessions are added.
- **Label convention** — stringly-typed and easily broken if Kristin renames a cohort.

### D. Session entry within a multi-session cohort

**Decision: Recurring builder + per-row edits.**

1. Kristin specifies a recurrence: start date, end date or number of occurrences, recurrence pattern (e.g., weekly Tuesday), session start time + end time.
2. The form expands the recurrence into individual editable session rows.
3. Kristin can delete a row (skip a holiday week), edit a row's date/time, or add an extra makeup session.

The rows are the source of truth. The recurrence pattern itself is not stored in the database — it is a UI affordance that seeds the rows. Editing an existing cohort opens the same row UI prefilled with current sessions; there is no "regenerate from recurrence" affordance on edits.

### E. Editing reuses creation forms

**Decision: Edit views use the same form components as create views**, prefilled with existing data. No separate edit-only UI surface. This applies to classes, cohorts, and sessions.

### F. Class form chrome

**Decision: Sectioned single form, one submit.** The class create/edit form presents all 13 fields as a single form with one Save action, visually grouped under sub-headings (Basics / Fees / Image / Publish). Section boundaries are a visual affordance only — no per-section save, no wizard state, no tab switching. Specific field-to-section assignment is form-design detail to be settled during Phase 2 implementation.

Alternatives considered and rejected:

- **Single long form with no visual grouping** — works at 13 fields but doesn't help Kristin scan toward the cluster of fields she wants to edit.
- **Tabbed sections with per-tab saves** — introduces unsaved-changes tracking across hidden tabs and is overkill for a single-admin form of this size.

### G. Cohort form chrome

**Decision: Modal dialog.** Both "New cohort" and "New single session" entry points (decision B) open a centered shadcn `Dialog` over the dimmed class detail page. Editing existing cohorts opens the same modal prefilled (per decision E). The "New single session" modal is the simplified form from decision B; the "New cohort" modal carries the heavier recurring builder + session row list from decision D.

Alternatives considered and rejected:

- **Side drawer / Sheet** — partial class-detail visibility was attractive, but the cohort form's recurring builder + row list competes with the drawer's narrower width.
- **Expandable inline section on the class detail page** — full page width is best for the row list, but multiple expanded cohort forms would make the class detail page very tall, and visual focus on "I'm editing this one thing" is weaker than a modal.

### H. Image upload flow

**Decision: Inline placement, direct browser upload via `supabase-js`.** The image upload control lives inside the class form's "Image" section as a regular field. On file pick, bytes upload directly to Supabase Storage via the client-side `supabase-js` client using Kristin's authenticated session; the form's Server Action only persists the returned Storage URL + alt text + other class fields on Save.

Storage path follows the bucket convention from [ADR-0007](./0007-image-pipeline-and-storage.md) (`site-images/classes/<filename>`). Browser-side writes succeed against the existing RLS policy from Phase 1 Chunk A (INSERT/SELECT/UPDATE granted to `authenticated` on `site-images`).

Alternatives considered and rejected:

- **Separate "Manage image" sub-flow** — cleaner failure isolation, but doubles the interaction count to fully set up a class with an image.
- **Server-side upload via Server Action (file in FormData)** — simpler client code, but routes image bytes through a Vercel function (latency + body-size limit + no upload progress without extra work).
- **Signed upload URL hybrid** — more code than either pure approach (two server actions plus a direct PUT); over-engineered for a single-admin workflow.

Orphan-file risk (file uploaded but the class Save never completes) is mitigated by `upsert: true` with deterministic paths, and accepted as a rare, low-cost residual in a public-read bucket.

### I. Publish UX clarity

**Decision: Status pill (everywhere) + targeted banner (on detail page when blocked).** Publication state is communicated by:

1. A **status pill** next to the class name on both the `/admin/classes` list (per decision J) and the `/admin/classes/[id]` detail page. Pill states:
   - `Live` — all three visibility conditions from [ADR-0015](./0015-content-modeling-classes.md) are met.
   - `Draft` — `class.published = false`.
   - `Hidden — no published cohort` — class is published, but no cohort with `published = true` exists.
   - `Hidden — no upcoming sessions` — class and a cohort are both published, but the cohort has no `cohort_session` with `ends_at > now()`.
2. A **targeted banner** at the top of `/admin/classes/[id]` when the class is in a `Hidden — *` state. The banner names the specific missing piece and links to the action that fixes it (e.g., "[Add cohort]" / "[Add sessions]"). No banner appears when the class is `Live` or `Draft` — the pill is sufficient.

Both signals compute from the same visibility query result so they cannot drift.

Alternatives considered and rejected:

- **Pill only** — at-a-glance state but no "what do I do?" affordance.
- **Banner only** — explains well but redundant when nothing's wrong, and the list view still needs its own indicator.

### J. `/admin/classes` list view

**Decision: Rich list.** Columns: Name, Status pill (from decision I), Category, Skill level, Next session, Last updated. Default sort: Next session ascending; classes with no upcoming session sort to the bottom, ties broken by Last updated descending. Filters: Status, Category, Skill level — each independently selectable, combined with AND. A free-text search input filters by Name.

`Next session` is derived as the earliest `cohort_sessions.starts_at` such that the row's parent cohort is published, the parent class is published, and `ends_at > now()`. When no such row exists, the column renders an em dash.

Alternatives considered and rejected:

- **Minimal (Name + Status only, alpha sort, no filters)** — appropriate for ~30 classes by row count, but loses planning value; Kristin would click into each class to see when its sessions are coming up.
- **Standard (Name + Status + Category + Next session, sort by Status then alpha, filter by Status + Category)** — covered the most common scanning questions but lost the at-a-glance skill-level signal and the recently-edited cue that comes with the Last updated column.

### K. `/admin` dashboard landing

**Decision: Plain navigation cards.** The `/admin` route shows a brief welcome line and two cards — "Classes" linking to `/admin/classes`, "Bulletins" linking to `/admin/bulletins`. No activity feed, no needs-attention prompts, no per-card counts or recent-edits.

Alternatives considered and rejected:

- **"Needs attention" prompts** — productive landing for a planning-minded admin, but the highest-priority case ("published but not visible") is already covered by decision I's targeted banner at the right scope. The dashboard would either duplicate that signal or invent new prompts whose rules ("when is a draft too old?") need design and tuning we can defer.
- **Recent activity feed** — useful in multi-admin products; mostly noise at single-admin scale and would require an audit-trail mechanism the admin doesn't otherwise need.

### L. Past cohort UX

**Decision: Collapsed section below the upcoming cohorts list.** On the class detail page, the cohort list defaults to upcoming cohorts (a cohort qualifies as upcoming if it has at least one `cohort_session.ends_at > now()`). Below that list and below the "New cohort" / "New single session" affordances from decision B, an expandable accordion labeled `▸ Past cohorts (N)` reveals the rest in reverse chronological order. Expanded past-cohort rows reuse the same display as upcoming rows (per decision E); deletion remains available for cleanup.

Alternatives considered and rejected:

- **Separate `Upcoming` / `Past` tabs above the cohort list** — clean separation but introduces a tab pattern that isn't used elsewhere on this page, and the create-cohort affordances awkwardly belong on the Upcoming tab only.
- **Filter chip / toggle (`Upcoming` / `Past` / `All`)** — compact but less discoverable than a labeled section header; Kristin might assume past cohorts had been hard-deleted.

## Rationale

- **Class-centric IA mirrors the data hierarchy** (classes own cohorts own sessions) and gives Kristin a single page (`/admin/classes/[id]`) where everything related to one class lives. Standalone cohort URLs would add navigation overhead with no compensating benefit for a single-admin workflow.
- **Two entry points instead of one wizard** resolves the multi-week-vs-workshop tension at the click level rather than burying it inside a long form. Kristin's choice on the class detail page is also the choice that sets `cohort.kind` — there is no separate "is this a workshop?" toggle to fill in.
- **`kind` enum is explicit, queryable, and immutable per cohort.** It survives session deletions, doesn't depend on conventions, and lets the public-site renderer branch reliably on a single column.
- **Recurring builder is UI-only, not stored** because storing recurrence would force a "what happens when the user edits a single session of a recurring pattern" decision that the studio's scale doesn't need. The row-based model collapses that complexity: rows are authoritative, recurrence is just the bootstrap.
- **Editing reuses creation forms** because the field set is identical and the only meaningful difference is "submit creates" vs "submit updates." Two separate UIs would duplicate work and drift over time.
- **Sectioned single form matches the class form's size.** Thirteen fields are too many for an undifferentiated stack and too few to warrant tabs or a wizard. Visual grouping aids scanning without fragmenting the save action.
- **Modal cohort form keeps the heaviest UI focused.** The recurring builder + session row list is the most concentrated UI surface in the admin; a centered modal gives it the visual focus it earns without contending with the class detail page's other affordances.
- **Direct browser upload keeps image bytes off the Server Action.** The Vercel function stays lean (no multi-megabyte body), upload progress is straightforward to surface, and Vercel's body-size cap stops being a ceiling. The single-Save user experience is preserved because the upload completes on file pick; the form submit only persists the URL.
- **Pill + targeted banner splits two distinct questions.** "Is this live?" needs an answer at every scope (list view, detail page, in passing). "What's blocking visibility?" only matters when the answer to the first question is "no," and only on the page where the fix happens. Splitting the signals to match the questions avoids both terseness and clutter.
- **Rich list view treats `/admin/classes` as a planning surface.** Kristin is more likely to land there to ask "what's coming up?" than to ask "which class do I want to edit?" — so the columns and default sort answer planning questions first.
- **Plain dashboard cards honor the admin's actual scope.** The admin manages exactly two content types (per [ADR-0004](./0004-admin-dashboard-architecture.md)). A landing page that invents activity feeds or dashboards builds surface that doesn't earn its cost at single-admin scale; the highest-value insight ("published but not visible") is already covered on the class detail page by decision I's banner.
- **Collapsed past-cohort section treats history as low-frequency reference.** Past cohorts are rarely browsed but occasionally copied-from when launching a new cohort. Always one click away, never crowding the create flow. The count badge keeps magnitude visible without expanding the section.

## Tradeoffs accepted

- **Cohort tier is hidden for single-session classes**, which means Kristin must learn the "two buttons" affordance instead of seeing one consistent flow. Acceptable: the two buttons map cleanly onto the two real-world cases she already distinguishes (multi-week courses vs. drop-in workshops).
- **Recurrence pattern is not persisted.** A future "change all Tuesday sessions to start 30 minutes earlier" operation would require re-entering the recurrence or editing each row individually. Acceptable at studio scale.
- **`kind` is immutable per cohort.** Converting a single-session workshop into a multi-session cohort (or vice versa) requires deleting and recreating. Acceptable; this conversion would be rare and the data model treats them as distinct kinds.
- **No standalone cohort URLs** means deep-linking to a specific cohort (e.g., from an admin's bookmark) is not possible. Acceptable for a single-admin workflow; revisit if multi-admin needs emerge.
- **Modal cohort form competes with mobile viewports.** Modals are an accessibility footgun on narrow screens. Acceptable because the admin is desktop-first per [ADR-0004](./0004-admin-dashboard-architecture.md) (Kristin manages from a laptop). A future mobile/tablet admin pass may need to switch to a sheet pattern.
- **Direct browser upload can leak orphan files.** Kristin picks a file → bytes upload → she closes the tab before saving the class form. Acceptable: `upsert: true` plus deterministic paths keeps re-uploads idempotent, and any rare orphan is a low-cost residual in a public-read bucket.
- **Status pill and banner must stay aligned.** If they ever disagree (pill says `Live`, banner says "no upcoming sessions"), Kristin loses trust in both. Mitigated by computing both from the same visibility query result and shipping them together.
- **Rich list view executes a per-load join** on `cohorts` + `cohort_sessions` to derive the `Next session` column. Acceptable at ~30-class scale; revisit indexing if the query becomes hot in Phase 2 testing.
- **Plain dashboard defers the "needs attention" insight** to per-class banners. A planning-minded admin might want the same insight aggregated at `/admin`. Acceptable; an aggregation can be added later above the cards without rewriting them.
- **Past cohorts are reachable but not searchable.** No filter applies inside the collapsed section. Acceptable: studio volume is low enough that scrolling a reverse-chronological list is fine; revisit if cohort counts exceed a few dozen per class.

## Related decisions

- Depends on: [ADR-0004](./0004-admin-dashboard-architecture.md) (admin platform), [ADR-0015](./0015-content-modeling-classes.md) (class data model — `kind` column proposed below).
- Influences: Phase 2 of [`implementation-plan.md`](../implementation-plan.md) (the admin chunks will execute against this workflow), future SEO/schema markup work (the `kind` distinction may affect whether single-session offerings emit `Event` vs `Course` JSON-LD — to be revisited in the [ADR-0019](./0019-seo-and-schema-markup.md) implementation).
- Coordinates with: [ADR-0020](./0020-google-calendar-integration.md) (Accepted 2026-05-22) — ADR-0020's amendment to [ADR-0015](./0015-content-modeling-classes.md) is in place (`label` NOT NULL dropped, three sync columns added on `cohort_sessions`). This ADR's `kind` column is complementary; its amendment landed as a second section in ADR-0015 (`## Amendment 2026-05-26 — Cohort kind column`) alongside the 2026-05-22 amendment.

## Amendment landed in ADR-0015 on acceptance

When this ADR moved from In Discussion to Accepted on 2026-05-26, the schema amendment it specified was applied to [ADR-0015](./0015-content-modeling-classes.md) as `## Amendment 2026-05-26 — Cohort kind column`. The amendment adds one column (`cohorts.kind`, enum `'multi_session' | 'single_session'`, immutable post-insert) and narrows the semantics of `cohorts.label` (required for multi-session, optional for single-session — refining the `NOT NULL` relaxation that [ADR-0020](./0020-google-calendar-integration.md)'s 2026-05-22 amendment already made at the column-constraint level). See ADR-0015 for the full amendment text.
