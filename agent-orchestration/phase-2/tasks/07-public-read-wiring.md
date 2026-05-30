---
id: 07-public-read-wiring
title: Public-site read wiring
phase: 2
status: todo
depends_on: [04-cohorts-and-sessions, 05-bulletins-admin]
adrs_realized: [0004, 0015, 0016, 0020]
---

# Public-site read wiring

## Goal

Switch the public site from the Phase 1 static placeholders to live database reads: `/classes` and `/classes/[slug]` render only DB-visible classes (with sold-out treatment), the homepage shows active bulletins through `react-markdown`, and admin edits surface via on-demand revalidation.

## Context

Closes the end-to-end loop — admin writes (tasks `03`–`05`) become public reads here. This replaces the Phase 1 `src/lib/classes-content.ts` static placeholder; remove it once the routes read from the DB.

Class visibility is the three-condition rule from [ADR-0015](../../decisions/0015-content-modeling-classes.md) (class published AND a published cohort AND a future session) — reuse the visibility predicate established in tasks `01`/`03`, do not re-derive it. Public rendering branches on `cohort.kind` (multi vs. single-session) per [ADR-0021](../../decisions/0021-admin-class-workflow-ux.md). Sold-out treatment: show a cohort as sold-out when `enrollment_count >= class.max_students` ([ADR-0020](../../decisions/0020-google-calendar-integration.md) public cascade) — this is DB-derived and independent of GCal (no dependency on task `06`); the count value itself is never displayed. Bulletins render through `react-markdown` per dev-guide § Markdown rendering (allowlisted elements, no raw HTML, `rel="noopener noreferrer"` on links); fill in that section's `allowedElements` specifics here. Data flow + revalidation are [ADR-0004](../../decisions/0004-admin-dashboard-architecture.md) (Server Components read; on-demand revalidation on admin mutations). Display formatting uses the Intl helpers from task `03`.

## Scope (in)

1. `/classes` — list of DB-visible classes (three-condition rule), replacing the static placeholder; renders from Server Components.
2. `/classes/[slug]` — class detail rendering its visible cohorts, branching on `cohort.kind`, showing session dates/times (Intl display) and sold-out treatment where applicable.
3. Homepage bulletin strip — active bulletins (visibility rule) ordered newest-first, rendered via `react-markdown`.
4. On-demand revalidation so an admin publish/edit surfaces on the public routes promptly ([ADR-0004](../../decisions/0004-admin-dashboard-architecture.md)).
5. Remove `src/lib/classes-content.ts` and any remaining static class/bulletin placeholders.

## Scope (out)

- SEO/schema markup (`Course`/`Event` JSON-LD) — Phase 4 ([ADR-0019](../../decisions/0019-seo-and-schema-markup.md)).
- `/classes/calendar` — remains the Google Calendar embed shipped in Phase 1 ([ADR-0020](../../decisions/0020-google-calendar-integration.md)); unchanged here.
- Admin-side surfaces — tasks `03`–`06`.

## Test specs

- Vitest: the public visibility/sold-out selectors over row fixtures (draft class hidden; published class with only past sessions hidden; sold-out flag derivation); the `react-markdown` config (allowed elements render, disallowed elements/raw HTML stripped, links get `rel`).
- Playwright: `e2e/public-classes.spec.ts` — a published class with a future cohort appears on `/classes` and its `/classes/[slug]`; a draft/expired class does not; a sold-out cohort shows the sold-out treatment; an active bulletin renders on the homepage with markdown formatting.

## Exit criteria

- `/classes` and `/classes/[slug]` render only DB-visible classes per the three-condition rule; no static class placeholders remain.
- Single- vs. multi-session cohorts render correctly; sold-out treatment shows when applicable; the count is never displayed.
- The homepage shows only active bulletins, rendered through `react-markdown` with the allowlist; no raw HTML executes.
- An admin edit surfaces on the public routes after revalidation.
- `pnpm check` and `pnpm test:e2e` pass.

## Resolution

_Appended on completion. Document what shipped, any in-flight decisions or
deviations, and the PR link._
</content>
