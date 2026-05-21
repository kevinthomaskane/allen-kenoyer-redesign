# ADR-0021: Admin class workflow UX

- **Status:** In Discussion
- **Date:** _pending_
- **Deciders:** Kevin Kane

## Context

[ADR-0004](./0004-admin-dashboard-architecture.md) settled the admin platform (custom Next.js, Server Actions, flat permissions, classes + bulletins as the two content types). [ADR-0015](./0015-content-modeling-classes.md) settled the class data shape — a two-tier model with `classes` (named courses), `cohorts` (specific offerings), and `cohort_sessions` (individual date+time rows).

Neither ADR specifies *how* Kristin moves through the UI to create those records. That workflow design is the subject of this ADR.

Two design tensions shape the work:

1. **Data model vs. mental model.** ADR-0015 introduced cohorts as a separate tier to handle concurrent runs of the same class (Tuesday-evening cohort vs. Saturday-morning cohort of "Beginning Copper Foil"). Kristin's onboarding doc (`docs/current-pages-for-kristin.txt`) describes the workflow more flatly — dates feel like a property of the class, not a separate entity. The UI must reconcile the explicit data shape with the simpler mental model.
2. **Multi-week courses vs. one-off workshops.** The studio's class list mixes 5-week structured courses ("Beginning Copper Foil") with drop-in workshops ("3-D Beveled Star", "Cutting Class"). Forcing every class through the same multi-session cohort flow would add friction for the workshop case; ignoring the distinction would lose useful frontend rendering signal.

Constraints that apply:

- The admin user is one person (Kristin) with no developer assistance ([ADR-0004](./0004-admin-dashboard-architecture.md) scope).
- No online registration ([locked scope](./README.md)) — the workflow does not include any reservation state.
- The schema in [ADR-0015](./0015-content-modeling-classes.md) is the source of truth; UI must produce valid records against that schema.

## Decisions to date

### A. Information architecture

**Decision: Class-centric routes with nested cohorts.**

- `/admin` — dashboard landing (shape TBD; see Open questions)
- `/admin/classes` — list of all classes (published + draft)
- `/admin/classes/new` — create new class form
- `/admin/classes/[id]` — class detail page (class info form + cohort list + cohort creation entry points + session management)

Cohorts and sessions are managed inline on the class detail page. No standalone cohort URLs (`/admin/cohorts/[id]` does not exist).

### B. Cohort creation entry points

**Decision: Two affordances on the class detail page — "New cohort" and "New single session".**

- **"New cohort"** opens the multi-session cohort form (label, recurring session builder, per-row session edits, published toggle). Used for structured courses ("Beginning Copper Foil — Spring 2026, 5 Tuesday evenings").
- **"New single session"** opens a simplified form (date + start time + end time + published toggle, no cohort label, no recurring builder). Used for one-off workshops. Behind the scenes, a `cohorts` row is auto-created with `kind = 'single_session'` plus exactly one `cohort_sessions` row.

The dual entry point absorbs the data model's cohort tier into the UI without exposing it for the workshop case. The frontend branches rendering on `cohort.kind` (a new column proposed by this ADR — see "On acceptance" section below).

### C. Single-session distinction in the data

**Decision: `kind` enum column on the `cohorts` table.** Values: `'multi_session' | 'single_session'`. Set on insert based on the admin's entry-point choice; immutable thereafter. This is a schema change against [ADR-0015](./0015-content-modeling-classes.md); the amendment block lands in that ADR when this one (and [ADR-0020](./0020-google-calendar-integration.md), which proposes overlapping changes) move to Accepted. See "On acceptance" section below.

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

## Open questions

These are deferred to subsequent drilling sessions and will be resolved before this ADR moves to Accepted.

1. **Class form chrome** — single long form for all 13 class fields, or sectioned (basics / fees / image / publish)?
2. **Cohort form chrome** — does the cohort form open as a modal, a side drawer, or an expandable inline section on the class detail page?
3. **Image upload flow** — inline with class form or separate step? Direct browser-to-Supabase-Storage upload via `supabase-js`, or server-side via Server Action?
4. **Publish UX clarity** — ADR-0015's visibility rule has three conditions (`class.published` AND a published cohort exists AND that cohort has a future session). How does the UI communicate combined visibility when one piece is missing (e.g., class published but no cohorts)? A status pill? A banner? A disabled-with-explanation affordance?
5. **`/admin/classes` list view** — what columns? Filter by published/draft? Filter by has-upcoming-cohort? Sort defaults?
6. **`/admin` dashboard landing** — recent activity, "needs attention" prompts, or just navigation cards to the two content types (classes + bulletins)?
7. **Past cohort UX** — ADR-0015 specifies a "Show past cohorts" toggle on the class detail page. Where does it sit visually? Collapsed section, separate tab, or filter chip?

## Rationale

_(To be expanded as remaining open questions resolve. Captured here for the decisions made to date.)_

- **Class-centric IA mirrors the data hierarchy** (classes own cohorts own sessions) and gives Kristin a single page (`/admin/classes/[id]`) where everything related to one class lives. Standalone cohort URLs would add navigation overhead with no compensating benefit for a single-admin workflow.
- **Two entry points instead of one wizard** resolves the multi-week-vs-workshop tension at the click level rather than burying it inside a long form. Kristin's choice on the class detail page is also the choice that sets `cohort.kind` — there is no separate "is this a workshop?" toggle to fill in.
- **`kind` enum is explicit, queryable, and immutable per cohort.** It survives session deletions, doesn't depend on conventions, and lets the public-site renderer branch reliably on a single column.
- **Recurring builder is UI-only, not stored** because storing recurrence would force a "what happens when the user edits a single session of a recurring pattern" decision that the studio's scale doesn't need. The row-based model collapses that complexity: rows are authoritative, recurrence is just the bootstrap.
- **Editing reuses creation forms** because the field set is identical and the only meaningful difference is "submit creates" vs "submit updates." Two separate UIs would duplicate work and drift over time.

## Tradeoffs accepted

- **Cohort tier is hidden for single-session classes**, which means Kristin must learn the "two buttons" affordance instead of seeing one consistent flow. Acceptable: the two buttons map cleanly onto the two real-world cases she already distinguishes (multi-week courses vs. drop-in workshops).
- **Recurrence pattern is not persisted.** A future "change all Tuesday sessions to start 30 minutes earlier" operation would require re-entering the recurrence or editing each row individually. Acceptable at studio scale.
- **`kind` is immutable per cohort.** Converting a single-session workshop into a multi-session cohort (or vice versa) requires deleting and recreating. Acceptable; this conversion would be rare and the data model treats them as distinct kinds.
- **No standalone cohort URLs** means deep-linking to a specific cohort (e.g., from an admin's bookmark) is not possible. Acceptable for a single-admin workflow; revisit if multi-admin needs emerge.
- **Form chrome and publish UX are open.** Carrying open questions into the ADR is the cost of recording decisions incrementally rather than waiting until everything is settled. Acceptable because the structural decisions (IA, cohort kind, session entry pattern) are the ones that shape the schema and downstream Phase 2 work; chrome and publish-clarity choices are reversible UX polish.

## Related decisions

- Depends on: [ADR-0004](./0004-admin-dashboard-architecture.md) (admin platform), [ADR-0015](./0015-content-modeling-classes.md) (class data model — `kind` column proposed below).
- Influences: Phase 2 of [`implementation-plan.md`](../implementation-plan.md) (the admin chunks will execute against this workflow), future SEO/schema markup work (the `kind` distinction may affect whether single-session offerings emit `Event` vs `Course` JSON-LD — to be revisited in the [ADR-0019](./0019-seo-and-schema-markup.md) implementation).
- Coordinates with: [ADR-0020](./0020-google-calendar-integration.md) (Proposed) — both this ADR and ADR-0020 propose amendments to [ADR-0015](./0015-content-modeling-classes.md)'s `cohorts` schema, with overlapping treatment of `label`. When both accept, the two amendment blocks should be merged into a single coherent block in ADR-0015.

## On acceptance — amendment to drop into ADR-0015

When this ADR moves from In Discussion to Accepted, paste the block below into [ADR-0015](./0015-content-modeling-classes.md) as a new section between "Tradeoffs accepted" and "Related decisions" (matching the placement convention used for [ADR-0014's amendment](./0014-linting-and-formatting.md#amendment-2026-05-20--eslint-9x-vs-10x)). Fill in the date with the day this ADR is Accepted.

> ### Amendment YYYY-MM-DD — Cohort kind column
>
> Per [ADR-0021](./0021-admin-class-workflow-ux.md), the admin UI surfaces two distinct cohort creation flows ("New cohort" for multi-session courses, "New single session" for one-off workshops), and the public site renders the two kinds with different card layouts. A reliable column-level signal is needed so the renderer doesn't have to derive intent from session count.
>
> **`cohorts`** — one new column:
>
> | Field | Type | Notes |
> |---|---|---|
> | `kind` | enum (`'multi_session' \| 'single_session'`) | Set on insert based on the admin's entry-point choice; immutable thereafter. The public site renderer branches on this column. |
>
> **Field semantics revised by this amendment:**
>
> - `label` semantics narrow: required for `kind = 'multi_session'`, optional/auto-generated for `kind = 'single_session'` (single-session workshops do not need a human-meaningful cohort label; the date and time serve as identification). If [ADR-0020](./0020-google-calendar-integration.md) is also Accepted, its `label`-nullable change covers the database constraint; the row above covers the `kind`-conditional rule the admin and renderer enforce.
>
> **Tradeoff:** Converting a single-session workshop into a multi-session cohort (or vice versa) requires deleting and recreating the cohort, since `kind` is immutable. Acceptable; conversion would be rare and the data model treats them as distinct kinds.
