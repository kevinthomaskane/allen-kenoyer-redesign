---
id: 01-data-layer
title: Data layer & schema
phase: 2
status: todo
depends_on: []
adrs_realized: [0005, 0006, 0015, 0016]
---

# Data layer & schema

## Goal

Create the Phase 2 database foundation: the `classes`, `cohorts`, `cohort_sessions`, and `bulletins` tables with their enums, foreign keys, indexes, and RLS policies, plus the committed generated TypeScript types and the `supabase-js` client wiring every later task builds on.

## Context

First Supabase schema work in the project — invoke the `supabase` skill before any Supabase operation; it carries RLS and security guidance absent from training data. MCP workflow: `execute_sql` for iterative schema exploration, `apply_migration` to commit stable DDL as a file in `supabase/migrations/`, `get_advisors` after every DDL change to catch security/performance findings. There are no Storage MCP tools (the bucket already exists from Phase 1 task `01-supabase-storage`).

The full column lists, enums, and the three-condition visibility rule are specified in [ADR-0015](../../decisions/0015-content-modeling-classes.md) (classes/cohorts/sessions, including the `cohort.kind` enum and the `gcal_event_id`/`sync_status`/`sync_error` sync columns) and [ADR-0016](../../decisions/0016-content-modeling-bulletin-board.md) (bulletins). Datetime columns are `timestamptz` per dev-guide § Date/time handling. RLS shape comes from [ADR-0006](../../decisions/0006-authentication.md): anon read of published rows (within the active window for bulletins), authenticated writes. Deployment workflow (local `supabase db push` + GH Action backstop) and the `gen types` command are in [ADR-0005](../../decisions/0005-database-and-query-layer.md).

## Scope (in)

1. Migration creating the `classes` table — all columns, the `category` and `skill_level` enums, `published`, timestamps — per [ADR-0015](../../decisions/0015-content-modeling-classes.md).
2. Migration creating the `cohorts` table including the `kind` enum (`multi_session` | `single_session`), nullable `label`, `enrollment_count`, and independent `published`.
3. Migration creating the `cohort_sessions` table including `starts_at`/`ends_at` (`timestamptz`), the GCal columns (`gcal_event_id`, `sync_status`, `sync_error`), and an index supporting the `ends_at > now()` visibility query.
4. Migration creating the `bulletins` table (nullable `title`, required markdown `message`, `display_start` NOT NULL, nullable `display_end`, `published`).
5. RLS policies on all four tables per [ADR-0006](../../decisions/0006-authentication.md): public/anon `SELECT` restricted to published-and-visible rows; `INSERT`/`UPDATE`/`DELETE` restricted to `authenticated`.
6. Generated types committed (`supabase gen types typescript --linked --schema=public`) to the path settled in dev-guide § Type discipline; fill in that stub with the chosen path in this PR.
7. `supabase-js` browser and server client helpers in `src/lib/` (the `@supabase/ssr`-based clients; auth session handling lands in task `02`, but the client factories are established here).
8. `@supabase/ssr` installed (verify latest version before install, per the dependency rule); confirm the GH Action backstop from [ADR-0005](../../decisions/0005-database-and-query-layer.md) is wired with the required secrets.

## Scope (out)

- Auth, middleware, login UI — task `02-auth-and-admin-shell`.
- Any admin or public UI reading/writing these tables — tasks `03`–`07`.
- Seeding real content — Phase 4 launch ([ADR-0020](../../decisions/0020-google-calendar-integration.md) rollout).
- GCal push behavior — task `06-gcal-sync` (this task only creates the sync columns).

## Test specs

- Vitest: `src/lib/<visibility>.test.ts` covering the class three-condition visibility predicate and the bulletin display-window predicate as pure functions over row fixtures (published/draft, future/past sessions, open-ended vs. windowed) — if the predicate is expressed in TS; if it lives purely in SQL, cover it in the consuming task (`07`).
- RLS verified via SQL/`get_advisors`: anon can `SELECT` a published-visible row and cannot `SELECT` a draft; anon `INSERT`/`UPDATE`/`DELETE` is denied; `authenticated` writes succeed.

## Exit criteria

- All four tables, enums, FKs, and indexes exist; migrations apply cleanly via `supabase db push` and are committed under `supabase/migrations/`.
- `get_advisors` reports no security findings on the new tables (any accepted advisory documented in Resolution).
- Generated types are committed and the app typechecks against them; dev-guide § Type discipline filled in with the path.
- RLS behaves per the test specs (anon read-published-only, authenticated-write).
- `pnpm check` passes.

## Resolution

_Appended on completion. Document what shipped, any in-flight decisions or
deviations, and the PR link._
</content>
