---
id: 06-gcal-sync
title: Google Calendar sync
phase: 2
status: todo
depends_on: [04-cohorts-and-sessions]
adrs_realized: [0020]
---

# Google Calendar sync

## Goal

Mirror published class schedules one-way into Kristin's Google Calendar: a service-account integration that creates/updates/deletes one event per `cohort_session` on every relevant admin mutation, with DB-wins failure handling, per-row sync status + retry, and a permanent "Sync all" reconciliation feature.

## Context

[ADR-0020](../../decisions/0020-google-calendar-integration.md) specifies this integration end to end — read it in full. Key points: strictly one-way (admin → GCal; GCal-side edits are not read back); one event per session; explicit `gcal_event_id` stored per session; **dedicated Google Cloud service account** with shared writer access, calendar always addressed by `GCAL_CALENDAR_ID` (env var, differs per Vercel environment — dev/preview/prod), never `primary`. DB-wins failure semantics: the DB write commits; a failed push flags `sync_status = 'failed'` + `sync_error` and surfaces a retry affordance; retries are idempotent (GET by stored `gcal_event_id` before deciding create vs. update). The event title/description/location/color spec and the full propagation table (what each admin action does to GCal, including sibling-ordinal re-push and the `[SOLD OUT]` prefix when `enrollment_count >= max_students`) are in [ADR-0020](../../decisions/0020-google-calendar-integration.md) — implement them exactly.

The sync columns (`gcal_event_id`, `sync_status`, `sync_error`) already exist from task `01`; this task writes them. Sessions/cohorts created in task `04` default to `sync_status = 'pending'`. During development the integration runs against a Kevin-owned test calendar — no production credentials. Install the Google API client (verify latest version before install). Service-account JSON key lives in Vercel env, never committed.

## Scope (in)

1. Service-account auth wiring and a GCal client addressing the calendar by `GCAL_CALENDAR_ID`; env wiring for dev/preview/prod.
2. Event create/update/delete per the propagation table, triggered from the cohort/session/publish mutations built in tasks `03`/`04`.
3. Event content per [ADR-0020](../../decisions/0020-google-calendar-integration.md) — title (multi vs. single-session formats, `Class n of total`, `[SOLD OUT]` prefix), plain-text description with conditional fields, location, per-category color.
4. Ordinal recomputation + sibling re-push when a session time change shifts chronological position; sold-out re-push when the sold-out state flips.
5. DB-wins failure handling: commit the DB write, flag `sync_status`/`sync_error` on push failure, surface a per-row "GCal out of sync — retry" affordance; idempotent retry via GET-before-write.
6. Permanent "Sync all" admin feature reconciling every published-cohort-with-future-sessions into the calendar.

## Scope (out)

- Seeding real content and running "Sync all" against Kristin's production calendar — Phase 4 launch ([ADR-0020](../../decisions/0020-google-calendar-integration.md) rollout). This task builds and tests the mechanism against a test calendar only.
- Two-way sync, recurring/RRULE events — explicitly rejected ([ADR-0020](../../decisions/0020-google-calendar-integration.md)).
- Public sold-out treatment on `/classes` — task `07-public-read-wiring` (this task only emits the calendar title prefix).

## Test specs

- Vitest: title/description builders over fixtures — multi vs. single-session titles, ordinal numbering, conditional description fields omitted when null, combined kit/supply fee, `[SOLD OUT]` prefix toggling on the sold-out threshold.
- Vitest: propagation resolver — given an admin action + before/after state, asserts the intended GCal op (create/update/delete/no-op) and which siblings re-push.
- Integration (against the test calendar, gated so CI can skip without credentials): create → update → delete round-trip leaves no orphan events; a forced failure sets `sync_status = 'failed'` and a retry recovers; "Sync all" reconciles a drifted state.

## Exit criteria

- Publishing a class + cohort with future sessions creates one correctly-formatted event per session on the test calendar; unpublishing/deleting removes them.
- A session-time edit that shifts ordinals re-pushes affected siblings; a sold-out flip re-pushes titles.
- A forced push failure flags the row and the retry affordance recovers it; "Sync all" reconciles from scratch.
- `pnpm check` passes (and `pnpm test:e2e` if E2E coverage is added); credential-gated integration tests pass locally.

## Resolution

_Appended on completion. Document what shipped, any in-flight decisions or
deviations, and the PR link._
</content>
