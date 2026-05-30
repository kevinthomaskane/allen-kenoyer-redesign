---
id: 05-bulletins-admin
title: Bulletins admin
phase: 2
status: done
depends_on: [02-auth-and-admin-shell]
adrs_realized: [0004, 0016]
---

# Bulletins admin

## Goal

Build the bulletin admin surface: the `/admin/bulletins` list (active by default, "Show past" toggle) and the create/edit form with a markdown toolbar and display-window controls, including a clear "published but not yet visible" state.

## Context

Independent of the classes path — shares only the data layer (task `01`) and the admin shell (task `02`), so it parallels tasks `03`/`04`.

Schema and rules are in [ADR-0016](../../decisions/0016-content-modeling-bulletin-board.md): single `bulletins` table; `message` stored as markdown; `display_start` required (form defaults to "now"), `display_end` optional (null = open-ended); visibility = published AND `display_start <= now()` AND (`display_end IS NULL OR display_end > now()`). The form provides a small toolbar (bold/italic/link/list) inserting markdown syntax into a textarea — Kristin doesn't type raw syntax. The expired-bulletin lifecycle (persist + "Show past" toggle) mirrors the cohort pattern from [ADR-0021](../../decisions/0021-admin-class-workflow-ux.md) L. Forms use Zod + React Hook Form + shadcn `<Form>` ([ADR-0009](../../decisions/0009-forms-and-validation.md)); display windows use the Intl/Luxon helpers per dev-guide § Date/time handling. The "Published but not visible yet" case (`published = true`, `display_start` in the future) must read as an explicit admin state ([ADR-0016](../../decisions/0016-content-modeling-bulletin-board.md) tradeoff note).

## Scope (in)

1. `/admin/bulletins` list — active bulletins by default (newest `display_start` first), "Show past" toggle revealing expired ones; delete available.
2. Create/edit form (shared components, prefilled on edit) — optional title, required markdown `message` textarea with the bold/italic/link/list toolbar, `display_start` (defaults to now) and optional `display_end` controls, published toggle.
3. Explicit status display distinguishing Draft / Published-and-visible / Published-but-queued (future `display_start`) / Expired.

## Scope (out)

- Public homepage rendering of bulletins (the markdown render + strip) — task `07-public-read-wiring`.
- Image, detail pages, type/severity, manual pin/sort — all explicitly excluded ([ADR-0016](../../decisions/0016-content-modeling-bulletin-board.md)).

## Test specs

- Vitest: bulletin visibility resolver over fixtures — draft hidden; published+within-window visible; future `display_start` queued (not visible); null `display_end` open-ended; past `display_end` expired.
- Playwright: `e2e/admin-bulletins.spec.ts` — admin creates a bulletin with the toolbar, sees it in the active list, sets a future start and confirms the queued status reads correctly, and reveals a past bulletin via "Show past".

## Exit criteria

- An admin can create/edit/publish/delete a bulletin; the toolbar inserts markdown syntax.
- The list shows active bulletins newest-first by default and reveals expired ones via the toggle.
- The four status states (incl. published-but-queued) are visually unambiguous.
- `pnpm check` and `pnpm test:e2e` pass.

## Resolution

Shipped on branch `parallel/05-bulletins-admin` (parallel worktree per
`docs/parallel-claude-sessions.md`, alongside the `03-classes-admin` session).

**Surface.** `/admin/bulletins` list (active by default — draft/queued/visible,
newest `display_start` first — with a "Show past (N)" link revealing expired
rows, mirroring the cohort lifecycle), `/admin/bulletins/new`, and
`/admin/bulletins/[id]` edit. A shared `BulletinForm` (React Hook Form + Zod +
shadcn `<Form>`, ADR-0009) does both create and edit; create/update/delete are
Server Actions that re-validate with the same schema, convert wall-time→UTC at
the boundary, write through the authenticated cookie client (RLS-enforced,
ADR-0006), then `revalidatePath`. The markdown toolbar (bold/italic/link/list)
inserts syntax via a pure, unit-tested `markdown.ts` helper. The four ADR-0016
states render as distinct status badges; "Queued" is the explicit
published-but-not-visible-yet state (ADR-0016 tradeoff note).

**Date/time foundation landed here (Kevin's call).** Task 05 established the
shared `src/lib/studio-time.ts` (`wallTimeToUtc` / `utcToWallTimeInput` /
`nowWallTimeInput` via Luxon, `formatStudioDateTime` via Intl) and `STUDIO_TZ`
in `site-config.ts`, ahead of task 04 — which the phase plan had nominally
chartered to create it. Task 04 now *extends* it with recurrence stepping;
dev-guide § Date/time and phase-2 README workstream D were updated to match, and
a new dev-guide § Forms documents the ADR-0009 stack (its first landing — task
02 had deferred it).

**Reused, not duplicated.** `isBulletinVisible` (shipped by task 01) now
delegates to a new `bulletinStatus` 4-state classifier so the boolean and the
classifier cannot drift; task 01's visibility tests still stand.

**Deps** (versions verified at install): `luxon@3.7.2`, `zod@4.4.3`,
`react-hook-form@7.76.1`, `@hookform/resolvers@5.4.0`, `@types/luxon@3.7.1`.
shadcn primitives added: `form`, `textarea`, `switch`, `badge`, `table`.

**One shared-config fix.** `vitest.config.ts` had no path-alias resolution, so a
runtime `@/` import (`STUDIO_TZ`) failed under Vitest — type-only `@/` imports
had masked the gap. Added `resolve.alias` mirroring tsconfig's `@/* → ./src/*`.

**Verification.** `pnpm check` ✓ (lint + format + typecheck + 47 Vitest tests,
incl. the `bulletinStatus` 4-state cases, `studio-time` DST round-trip, and
`markdown` insertion coverage). `pnpm test:e2e` ✓ (24 passed) — run with seeded
admin creds: toolbar-create→Visible→delete, future-start→Queued,
expired→hidden-until-"Show past", plus the existing auth + smoke suites.

PR: https://github.com/kevinthomaskane/allen-kenoyer-redesign/pull/3

