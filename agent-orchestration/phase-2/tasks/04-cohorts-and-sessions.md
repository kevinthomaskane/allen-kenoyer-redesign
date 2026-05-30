---
id: 04-cohorts-and-sessions
title: Cohorts & sessions
phase: 2
status: todo
depends_on: [03-classes-admin]
adrs_realized: [0015, 0021]
---

# Cohorts & sessions

## Goal

Add inline cohort and session management to the class detail page: the two cohort entry points (multi-session with a recurring builder, and single-session), per-row session editing, and the past-cohort accordion — establishing the Luxon-based wall-time↔UTC scheduling utilities.

## Context

This task introduces the project's first write-side date/time handling — read dev-guide § Date/time handling. Build a small `src/lib/studio-time.ts` (or similar) wrapping Luxon: convert Kristin's wall-clock input in `STUDIO_TZ` to a UTC instant for storage (`DateTime.fromObject({…}, { zone: STUDIO_TZ }).toUTC()`) and expand a weekly recurrence into session rows with DST-safe stepping (`.plus({ weeks: 1 })`). Install `luxon` (verify latest version before install). Display continues to use the Intl helpers from task `03`.

UX is fully specified in [ADR-0021](../../decisions/0021-admin-class-workflow-ux.md): two entry points "New cohort" / "New single session" (decision B), both in a centered shadcn `Dialog` (decision G); the recurring builder seeds editable rows that are the source of truth — recurrence itself is not persisted (decision D); single-session auto-creates a `cohorts` row with `kind = 'single_session'` + one session; `kind` is set on insert and immutable (decision C / [ADR-0015](../../decisions/0015-content-modeling-classes.md)); the cohort list defaults to upcoming with a collapsed `▸ Past cohorts (N)` accordion (decision L). Editing reuses the creation forms prefilled (decision E).

## Scope (in)

1. Cohort list on the class detail page — upcoming cohorts by default; each row reuses one display component.
2. "New cohort" modal — label, recurring builder (start date, end/occurrences, weekly pattern, session start/end times), expansion into editable session rows, per-row add/edit/delete, published toggle.
3. "New single session" modal — date + start/end time + published toggle; auto-creates `kind = 'single_session'` cohort + one session, no label/recurrence.
4. Edit reuses the same modals prefilled; no separate edit UI.
5. `▸ Past cohorts (N)` collapsed accordion below the upcoming list and the create affordances; expanded rows reuse the upcoming display; deletion available.
6. `src/lib/studio-time.ts` Luxon utilities (wall-time→UTC, UTC→wall-time, DST-safe weekly expansion) with unit tests.

## Scope (out)

- GCal push when a session/cohort is created, edited, published, or deleted — task `06-gcal-sync` (this task persists rows and `sync_status` defaults to `pending`).
- Public rendering of cohorts/sessions and sold-out treatment — task `07-public-read-wiring`.
- Storing recurrence patterns — explicitly rejected ([ADR-0021](../../decisions/0021-admin-class-workflow-ux.md) D; rows are authoritative).

## Test specs

- Vitest: `src/lib/studio-time.test.ts` — wall-time→UTC round-trips across a DST boundary (PST↔PDT); weekly recurrence expansion produces correct local times on both sides of the March/November switch; ends_at after starts_at.
- Vitest: single-session create produces one `single_session` cohort + one session; multi-session row edits/deletes preserve the row set.
- Playwright: `e2e/admin-cohorts.spec.ts` — admin opens a class, creates a multi-session cohort via the recurring builder, deletes one row, adds a single-session workshop; both appear correctly; a past cohort shows under the accordion.

## Exit criteria

- An admin can create a multi-session cohort (recurring builder → editable rows), a single-session workshop, and edit either by reopening the prefilled modal.
- Session times entered as studio wall-clock persist as correct UTC instants, verified across a DST boundary.
- Past cohorts appear only under the accordion; upcoming cohorts show by default.
- `pnpm check` and `pnpm test:e2e` pass.

## Resolution

_Appended on completion. Document what shipped, any in-flight decisions or
deviations, and the PR link._
</content>
