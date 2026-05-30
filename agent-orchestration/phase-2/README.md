# Phase 2 — Admin / CMS

> The authenticated admin dashboard and the data layer behind it: Kristin manages classes and bulletins, the public site begins reading from the database, and class schedules sync one-way to her Google Calendar.

## Goals

Stand up the core dynamic feature of the rebuild — a custom admin at `/admin/*` (no headless CMS, no Payload) where the studio manager creates and publishes the two content types the site needs: **classes** (two-tier `classes` → `cohorts` → `cohort_sessions`) and **bulletins**. The admin writes to Supabase Postgres via Server Actions; the public site reads the same database via Server Components and stops shipping the Phase 1 static placeholders. A one-way integration mirrors published class schedules into Kristin's public Google Calendar so she never enters a date twice.

The phase delivers a working end-to-end loop on every content type — create in the admin, persist with RLS-enforced writes, render on the public site, and (for classes) propagate to Google Calendar — with auth gating the admin surface and tests covering the visibility rules that decide what the public sees.

## ADRs realized

- [ADR-0004](../decisions/0004-admin-dashboard-architecture.md) — custom Next.js admin at `/admin/*`, Server Actions + Server Components, flat permission model, two content types only
- [ADR-0005](../decisions/0005-database-and-query-layer.md) — Supabase Postgres + `supabase-js`; Supabase CLI migrations in `supabase/migrations/`; generated TS types committed
- [ADR-0006](../decisions/0006-authentication.md) — Supabase Auth (email+password, invite-only) via `@supabase/ssr`; middleware-gated `/admin/*`; login + password reset; RLS as defense-in-depth
- [ADR-0007](../decisions/0007-image-pipeline-and-storage.md) — admin-uploaded class images to the `site-images` bucket (the upload side of the Phase 1 storage setup)
- [ADR-0015](../decisions/0015-content-modeling-classes.md) — classes schema (two-tier + child sessions), enums, three-condition public visibility rule, auto-derived slugs
- [ADR-0016](../decisions/0016-content-modeling-bulletin-board.md) — bulletins schema (single table, markdown body, display window), visibility + ordering rules
- [ADR-0020](../decisions/0020-google-calendar-integration.md) — one-way admin → GCal sync via service account; per-session events; `gcal_event_id`/`sync_status`/`sync_error`; "Sync all"
- [ADR-0021](../decisions/0021-admin-class-workflow-ux.md) — admin class workflow UX (IA, dual cohort entry points, recurring builder, status pill + banner, rich list, dashboard cards, past-cohort accordion)

A later phase may extend an ADR's surface area without re-listing it.

## Scope (in)

Sliced by system/workstream. The data layer and the auth shell are the shared foundation; classes, bulletins, GCal sync, and the public read-wiring build on them. Strictly sequential except where noted as parallel.

- **A — Data layer & schema.** Supabase migrations for `classes`, `cohorts`, `cohort_sessions`, and `bulletins` (enums, FKs, indexes per [ADR-0015](../decisions/0015-content-modeling-classes.md)/[0016](../decisions/0016-content-modeling-bulletin-board.md)), including the `cohort.kind` and GCal sync columns. RLS policies per [ADR-0006](../decisions/0006-authentication.md) (public read of published rows; authenticated writes). Generated `supabase-js` types committed; the `supabase-js` browser/server client wiring + Supabase CLI workflow established.

- **B — Auth & admin shell.** Supabase Auth email+password, invite-only (no `/signup`); `@supabase/ssr` cookie sessions; middleware protecting `/admin/*` with redirect to `/admin/login`; the login page, "forgot password" → `/admin/reset-password` flow; the `/admin` dashboard landing (two navigation cards per [ADR-0021](../decisions/0021-admin-class-workflow-ux.md) K) and the shared admin layout chrome. *Parallel with A once the client wiring from A exists.*

- **C — Classes admin.** `/admin/classes` rich list (columns, sort, filters, search per [ADR-0021](../decisions/0021-admin-class-workflow-ux.md) J), `/admin/classes/new`, `/admin/classes/[id]` detail with the sectioned class form, auto-derived slug, status pill + targeted banner ([ADR-0021](../decisions/0021-admin-class-workflow-ux.md) F/I), and inline class-image upload via browser-side `supabase-js` ([ADR-0007](../decisions/0007-image-pipeline-and-storage.md), [ADR-0021](../decisions/0021-admin-class-workflow-ux.md) H). Establishes the shared date/time display helpers (Intl) for the "Next session" column.

- **D — Cohorts & sessions (scheduling).** Inline cohort management on the class detail page: modal cohort form, the two entry points ("New cohort" multi-session with recurring builder + per-row edits; "New single session"), past-cohort accordion ([ADR-0021](../decisions/0021-admin-class-workflow-ux.md) B/D/G/L). Establishes the Luxon-based wall-time↔UTC `studio-time` utilities for session input and recurrence expansion (dev-guide § Date/time handling).

- **E — Bulletins admin.** `/admin/bulletins` list (active + "Show past") and the create/edit form with the markdown toolbar (bold/italic/link/list) and the `display_start`/`display_end` window controls, including the "published but not visible yet" state surfacing ([ADR-0016](../decisions/0016-content-modeling-bulletin-board.md)). *Parallel with C/D — independent surface sharing only A + B.*

- **F — Google Calendar sync.** Service-account auth wiring (env-configured calendar ID per environment), the one-way push triggered on cohort/session/publish mutations following [ADR-0020](../decisions/0020-google-calendar-integration.md)'s propagation table and event-content spec, DB-wins failure handling with per-row `sync_status` surfacing + retry affordance, and the permanent "Sync all" admin feature.

- **G — Public-site read wiring.** `/classes` and `/classes/[slug]` read from the database (replacing the Phase 1 `lib/classes-content.ts` static placeholder), applying the three-condition visibility rule and the sold-out treatment ([ADR-0015](../decisions/0015-content-modeling-classes.md), [ADR-0020](../decisions/0020-google-calendar-integration.md) public cascade); the homepage bulletin strip rendering active bulletins through `react-markdown` (dev-guide § Markdown rendering); on-demand revalidation so admin edits surface quickly ([ADR-0004](../decisions/0004-admin-dashboard-architecture.md) data flow).

## Scope (out)

- **Content seed migration into the DB and the launch-time "Sync all" against Kristin's production calendar** — the *mechanism* ("Sync all", env-per-environment calendar ID) ships in workstream F; seeding real WordPress class/bulletin content and running it against her live calendar is launch work ([ADR-0020](../decisions/0020-google-calendar-integration.md) operational rollout, Phase 4). Phase 2 is tested with manually-created admin data against a test calendar.
- Contact form submission, transactional email, newsletter ([ADRs 0009–0011](../decisions/), Phase 3).
- SEO surface — `app/sitemap.ts`, per-page `metadata`, `Course`/`Event` JSON-LD that draws on the class schema ([ADR-0019](../decisions/0019-seo-and-schema-markup.md), Phase 4).
- Analytics, monitoring, and URL redirects from the legacy WordPress site ([ADRs 0012](../decisions/0012-analytics-and-monitoring.md), [0018](../decisions/0018-url-redirects-and-migration.md), Phase 4).
- Two-way GCal sync, recurring-event/RRULE modeling, role-based authorization, a third content type — all explicitly rejected in the cited ADRs.
- Patterns catalog admin — patterns remain dev-managed in `lib/patterns.ts` ([ADR-0017](../decisions/0017-content-modeling-patterns-catalog.md)).
- `/admin` activity feed, needs-attention prompts, per-card counts ([ADR-0021](../decisions/0021-admin-class-workflow-ux.md) K rejected these).

## Exit criteria

- Migrations apply cleanly via the Supabase CLI; `classes`/`cohorts`/`cohort_sessions`/`bulletins` exist with their enums, FKs, and RLS policies; `get_advisors` reports no security findings on the new tables; generated types are committed.
- An invited admin can log in at `/admin/login`, reset a password, and reach `/admin`; an unauthenticated request to any `/admin/*` route redirects to login. No `/signup` route exists.
- Kristin can create/edit/publish a class with a multi-session cohort, a single-session workshop, and an uploaded image; the status pill and banner correctly reflect each of the four visibility states.
- Kristin can create/edit/publish a bulletin with a display window; the markdown toolbar inserts syntax and the homepage renders the result.
- Publishing a class+cohort with future sessions creates one GCal event per session (against the test calendar) with the [ADR-0020](../decisions/0020-google-calendar-integration.md) title/description/color spec; unpublishing or deleting removes them; a forced failure flags `sync_status` and the retry affordance recovers it; "Sync all" reconciles from scratch.
- `/classes` and `/classes/[slug]` render only DB-visible classes (three-condition rule), show sold-out treatment when applicable, and reflect an admin edit after revalidation; the homepage shows only active bulletins. No static class/bulletin placeholders remain.
- Each route renders cleanly at mobile (375px), tablet (768px), and desktop (1280px); the admin is desktop-first per [ADR-0004](../decisions/0004-admin-dashboard-architecture.md) but does not break at narrow widths.
- `pnpm check` and `pnpm test:e2e` pass locally and in CI, including unit coverage of the visibility rules and date/time conversions and an E2E walk of the admin auth + class-create + public-render loop. No console errors in the production build.

## Tasks

<!-- generated by `pnpm gen:tracker`; do not edit manually -->

| ID | Title | Status | Depends on |
| -- | ----- | ------ | ---------- |
| 01-data-layer | Data layer & schema | done | — |
| 02-auth-and-admin-shell | Auth & admin shell | in-progress | 01-data-layer |
| 03-classes-admin | Classes admin | todo | 02-auth-and-admin-shell |
| 04-cohorts-and-sessions | Cohorts & sessions | todo | 03-classes-admin |
| 05-bulletins-admin | Bulletins admin | todo | 02-auth-and-admin-shell |
| 06-gcal-sync | Google Calendar sync | todo | 04-cohorts-and-sessions |
| 07-public-read-wiring | Public-site read wiring | todo | 04-cohorts-and-sessions, 05-bulletins-admin |

<!-- end generated -->

## Phase resolution

_Appended when all task exit criteria are met and the phase's own exit criteria
are verified. One short paragraph; per-task narrative lives in the individual
task files' `Resolution` sections._
</content>
</invoke>
