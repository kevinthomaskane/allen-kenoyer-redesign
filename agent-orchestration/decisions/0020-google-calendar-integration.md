# ADR-0020: Google Calendar integration

- **Status:** Accepted
- **Date:** 2026-05-22
- **Deciders:** Kevin Kane

## Context

The website rebuild outline ([`website-outline.md`](../website-outline.md)) initially framed `/classes/calendar` as a custom calendar replacing the Google Calendar embed — "no more dual tracking." After follow-up conversation with Kristin (the studio manager), she explicitly wants to keep her public Google Calendar. The site's own class listing remains independent (driven by [ADR-0015](./0015-content-modeling-classes.md)), but the admin must keep her Google Calendar in sync as a side-effect of class management, so she does not have to enter the same dates twice.

This ADR specifies *how* that backend integration works: direction, granularity, authentication, event content, failure handling, and operational rollout. It also specifies the schema columns on [ADR-0015](./0015-content-modeling-classes.md) that this integration requires.

Constraints that apply:

- **DB is the source of truth.** Public-site rendering, admin views, and visibility logic all read from the database defined in [ADR-0015](./0015-content-modeling-classes.md). Google Calendar is a downstream mirror.
- **No online registration** (locked scope from [README](./README.md)). Calendar events carry no booking or RSVP semantics.
- **One administrative user** (Kristin) makes writes intermittently. Volume is small — a handful of GCal API calls per week at peak.
- **`/classes/calendar` remains** as Kristin's existing Google Calendar (embed or link, decided in Phase 2). Whatever the website shows for `/classes/calendar`, the calendar Kristin and her students actually look at is *her* public Google Calendar, populated by this integration.

## Options considered

This ADR bundles six tightly-coupled sub-decisions. Each was explored in turn; only the chosen direction and the rejected alternatives are summarized here.

### Sync direction

- **One-way (admin → GCal).** Admin writes propagate to Google Calendar. GCal-side edits are not observed.
- **Two-way sync.** Changes Kristin makes directly in GCal flow back into the database. Requires webhooks or polling, plus conflict resolution. Substantially more complex.

### Event granularity

- **One event per `cohort_session` row.** A five-week cohort becomes five independent events on the calendar. 1:1 mapping with the schema.
- **One recurring event per cohort.** A single GCal series with five instances. Requires deriving an RRULE from the sessions table; non-uniform schedules become "exception" events, which is GCal's most error-prone API surface.

### GCal-to-DB mapping

- **`gcal_event_id` column on `cohort_sessions`.** Store whatever ID GCal returns when an event is created. Explicit, debuggable, requires one nullable column.
- **Deterministic event IDs.** Tell GCal to use `aks-session-<our-uuid>` as the event ID. No schema change, but failed-retry semantics get harder (409 conflicts) and debugging is implicit.

### Authentication model

- **Dedicated Google service account, shared write access to Kristin's calendar.** Service account JSON key in Vercel env; Kristin grants the service account's email "writer" access via her Google Calendar UI once. No OAuth flow, no refresh-token expiry, no Workspace required.
- **OAuth refresh token from Kristin's personal account.** She grants the app calendar-write access once; writes are made as her. Failure mode: refresh tokens can be revoked by Google for inactivity or password changes, breaking the integration silently.
- **Workspace + domain-wide delegation.** Overkill — requires a paid Google Workspace plan Kristin does not have.

### Failure semantics

- **Strict transactional.** GCal-push failure rolls back the DB write. A Google outage stops admin work entirely.
- **DB-wins with surfaced sync status.** DB write commits; if GCal push fails, the row is flagged and the admin shows a "GCal out of sync — retry" affordance. Idempotent retry via GET-before-write.
- **Queued background retry.** DB-wins plus a real retry worker on backoff. Vercel has no native background workers — would require Supabase pg_cron or an external queue, plus retry-status tracking.

### Backfill / launch sync

- **Lazy on next edit.** No backfill; existing sessions enter GCal only when next edited. Brittle.
- **One-time migration script.** Throwaway code that walks the DB and pushes everything once.
- **Permanent "Sync all" admin button.** First-class feature, used once at launch with seeded data, available thereafter as the heavy-weight recovery tool.

## Decision

This ADR bundles six calls:

1. **Sync direction:** strictly one-way, admin → GCal. GCal-side edits are not reflected back into the database.
2. **Event granularity:** one GCal event per `cohort_session` row.
3. **Mapping:** explicit `gcal_event_id` column on `cohort_sessions`.
4. **Authentication:** dedicated Google Cloud service account with shared writer access to Kristin's calendar. Calendar is always addressed by its calendar ID (env var), never by `primary` or via `CalendarList` enumeration.
5. **Failure handling:** DB-wins. New columns `sync_status` and `sync_error` on `cohort_sessions`. Retries are idempotent — a retry GETs the event by stored `gcal_event_id` before deciding to create vs. update.
6. **Backfill:** "Sync all" is a permanent admin feature, not a one-off script. Run once at launch against seeded data; available thereafter as the recovery tool when state drifts.

### Schema requirements

This integration drives three columns on `cohort_sessions` — `gcal_event_id` (the GCal event ID, null until first synced), `sync_status` (`synced` \| `pending` \| `failed`, defaults to `pending`), and `sync_error` (last failure message) — and requires `cohorts.label` to be nullable (required for multi-session cohorts, optional for single-session, where the session date disambiguates). These columns are part of [ADR-0015](./0015-content-modeling-classes.md)'s class schema; this ADR is the reason they exist.

### Event content specification

**Title format**

- Multi-session cohort: `{class.name} — {cohort.label} — Class {n} of {total}`
- Single-session cohort: `{class.name} — {formatted session date}` (no "Class N of M" suffix)
- Sold-out prefix (when applicable): `[SOLD OUT] ` prepended to the title

`n` is the session's chronological position (1-based, ordered by `starts_at` within the cohort). When a session's date changes such that ordinals shift among siblings, every affected session's title is re-pushed to GCal.

**Description** (plain text, blank lines between sections):

```
Skill level: {class.skill_level}
Category: {class.category}

{class.description}

Prerequisite: {class.prerequisite}      ← omitted if null
Tuition: ${class.tuition}
Kit/Supply fee: ${supply_fee + kit_fee}  ← combined; line omitted if both fields null, otherwise shows the sum (treating a null field as 0)
Notes: {class.fee_notes}                 ← omitted if null
Class size: max {class.max_students}     ← omitted if null

Full details: https://allenkenoyerglass.com/classes/{class.slug}/
```

Conditional fields hide cleanly when null — no "N/A" placeholders. `enrollment_count` is **never** included.

**Location:** the studio's street address as a literal string. Renders as a tappable "Get directions" link in most calendar clients.

**Color (per `class.category`):**

| Category | GCal named color |
|---|---|
| `stained_glass` | Tomato (red) |
| `mosaic` | Basil (green) |
| `fused_glass` | Grape (purple) |
| `other` | Tangerine (orange) |

### Propagation rules

GCal event existence mirrors the public-visibility rule from [ADR-0015](./0015-content-modeling-classes.md). Events exist on the calendar iff all three of: `class.published = true`, `cohort.published = true`, and the session row exists.

| Admin action | Effect on GCal |
|---|---|
| Add a session to a published cohort under a published class | Create event |
| Add a session to a draft cohort (or draft class) | No event created |
| Edit a session's start/end time | Update event; recompute ordinals; re-push any siblings whose ordinal shifted |
| Delete a session | Delete event; recompute and re-push sibling ordinals |
| Publish a cohort (or class) that wasn't | Create events for all its future sessions |
| Unpublish a cohort (or class) that was | Delete all its events from GCal |
| Delete a cohort | Same as unpublishing — all events gone |
| Delete a class | All events from all cohorts gone |
| Edit `cohort.enrollment_count` or `class.max_students` such that the sold-out state flips | Re-push every session event in the affected cohort(s) with the updated title |

### Operational rollout

1. **During development:** integration is built against a Kevin-owned test calendar. `GCAL_CALENDAR_ID` differs per Vercel environment (development, preview, production).
2. **Pre-launch:** content migration script seeds `classes`, `cohorts`, and `cohort_sessions` from the current WordPress site. Kristin grants the service account's email writer access on her production calendar via the Google Calendar UI. Production env vars are switched to her calendar ID. **"Sync all" is then run once** from the admin to push every published-cohort-with-future-sessions into her calendar.
3. **Post-launch:** every admin write triggers a synchronous GCal push per the propagation rules. "Sync all" remains available as the recovery tool.

### Public-site cascade

The sold-out marker introduced here gives `cohort.enrollment_count` public-facing *consequences* (via the title prefix on her calendar), even though the count value itself is still never displayed. The public `/classes/[slug]` page should be brought into consistent treatment — showing each cohort as sold-out when appropriate — during Phase 2's classes-page implementation. This is downstream work, not part of this ADR's surface.

## Rationale

- **One-way sync matches the workflow.** Kristin manages classes in the admin, not in Google Calendar directly. Modeling GCal as a downstream mirror keeps the data model single-headed and avoids the conflict-resolution surface of two-way sync, which we would never use.
- **One event per session matches the schema.** `cohort_sessions` is already an independent-rows table, not a recurrence pattern. Mapping 1:1 keeps every operation clean: edit one session = update one event; non-uniform schedules and holiday skips just work. Recurring-event APIs in GCal are the most failure-prone surface in the calendar SDK.
- **An explicit `gcal_event_id` column is worth the schema cost.** Deterministic IDs avoid the column but make retry semantics harder (409-on-conflict) and obscure debugging. The boring choice — store what GCal returns — produces a system where any row's GCal mirror state is visible by reading the row.
- **Service account beats OAuth refresh token at this scale.** Refresh tokens can be revoked by Google for inactivity or password changes, breaking integrations silently and requiring re-grant by the user. A service account with a shared ACL has no expiry path, no consent-screen warnings, and no dependency on Kristin's account hygiene. The cosmetic cost — events authored by the service account, not "Kristin" — is acceptable on a calendar already branded "Allen Kenoyer Glass Classes."
- **DB-wins failure semantics keep the admin operational under upstream outage.** A strict transactional model would make a transient Google outage block class management entirely. Surfacing per-row sync status with a one-click retry recovers the same correctness guarantee asynchronously, at the cost of accepting brief drift windows.
- **"Sync all" as a permanent feature pays double dividends.** It's the launch-time backfill mechanism *and* the recovery tool when sync state drifts for any other reason. Building it once as a first-class feature is no more work than a throwaway script and leaves operational headroom.
- **Plain-text descriptions render consistently across calendar clients.** GCal supports light HTML in descriptions, but rendering varies (web vs. iOS vs. Android vs. third-party clients). Plain text with line breaks and auto-linkified URLs is consistent everywhere.
- **Per-category colors give viewers a scannable visual signal** without leaking any data the title doesn't already convey. The mapping (Tomato / Basil / Grape / Tangerine) is set by studio preference; the four GCal named colors are well-separated in hue across the palette.

## Tradeoffs accepted

- **`enrollment_count`'s no-longer-strictly-admin-only consequences.** [ADR-0015](./0015-content-modeling-classes.md) was explicit that the count is "admin-only planning aid. Never displayed publicly." The sold-out marker doesn't display the count itself, but it makes its consequences public. [ADR-0015](./0015-content-modeling-classes.md) records this in its `enrollment_count` note so future readers do not get a wrong picture. The integrity of "the number is private" is preserved; the integrity of "the count has no public effect" is not.
- **Service account-authored events on a personal Google account.** Standard GCal API behavior on non-Workspace calendars: events created by a non-owner ACL'd writer appear with the service account as the author when viewed in detail. Acceptable on a class calendar already branded with the studio's identity.
- **One-time onboarding step.** Kristin must add the service account's email to her calendar's ACL in the Google Calendar UI ("Settings and sharing > Share with specific people > Add people and groups > role: Make changes to events"). One-time, ~30 seconds, well-documented in the onboarding brief — but it is a step she has to take.
- **Drift windows under sync failure.** Between a failed GCal push and the user noticing the retry affordance, the DB and GCal disagree. Acceptable because the admin is the source of truth and the public site does not consult GCal — drift is only visible to people viewing her Google Calendar directly.
- **Sibling re-push when ordinals shift.** A session-time edit can cascade into multiple GCal updates if it changes chronological position. Bounded to one cohort (usually 2–6 events). Acceptable.
- **No two-way sync.** Edits Kristin makes directly in GCal are lost on the next admin write. We mitigate by educating her (and the brief) that the admin is where edits should be made. Acceptable because the admin is the workflow we are building; GCal-direct edits should be the exception.
- **GCal's 11 named colors are the entire palette.** If Kristin ever wants custom hex colors per category, that requires the per-event custom-color API surface, which is currently underused and inconsistently supported in clients. Acceptable at this scale.
- **API quota becomes billable later in 2026.** Google announced that exceeding the free quota will be billable later in 2026, with 90+ days' notice. At the studio's expected volume (~5–50 calls/day), we are four orders of magnitude below the threshold. Accept and revisit if Google changes the free tier shape materially.

## Related decisions

- Depends on: [ADR-0004](./0004-admin-dashboard-architecture.md) (custom admin with Server Actions as the write surface), [ADR-0005](./0005-database-and-query-layer.md) (Supabase as the platform; new columns land via Supabase CLI migrations), [ADR-0015](./0015-content-modeling-classes.md) (the schema this amends).
- Influences: Phase 2 of [`implementation-plan.md`](../implementation-plan.md) (GCal integration ships alongside the CMS rollout); future Phase 2 work on `/classes/[slug]` rendering (sold-out treatment on the public site).
- Reflected in: [ADR-0015](./0015-content-modeling-classes.md)'s schema — the `gcal_event_id` / `sync_status` / `sync_error` columns on `cohort_sessions`, the nullable `cohorts.label`, and the `enrollment_count` sold-out note all exist because of this integration.
