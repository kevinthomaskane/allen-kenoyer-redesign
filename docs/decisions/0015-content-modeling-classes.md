# ADR-0015: Content modeling — classes

- **Status:** Accepted
- **Date:** 2026-05-20
- **Deciders:** Kevin Kane

## Context

[ADR-0004](./0004-admin-dashboard-architecture.md) committed to a custom-built admin managing exactly two content types: classes and bulletin posts. The field list for classes is documented in `docs/archive/current-pages-for-kristin.txt` (name, category, skill level, prerequisite, description, sessions, dates/times, tuition, supply fee, kit fee, max students, published/draft).

This ADR locks the *shape* of the class content model — how those fields are structured into tables, how a class relates to its scheduled offerings, what the visibility semantics are, and what enums/types each field uses. The field list itself is settled; the modeling decisions below cascade into the schema migration ([ADR-0005](./0005-database-and-query-layer.md)), the admin UI surface ([ADR-0004](./0004-admin-dashboard-architecture.md)), and the future SEO/schema markup ADR (`Course`/`Event` structured data).

Constraints that apply:

- **No online registration** (locked scope). Enrollment is in-person or by phone; the model carries no reservation state.
- **Same database for admin and public** ([ADR-0004](./0004-admin-dashboard-architecture.md)). Schema must support transactional admin writes (Server Actions) and read-heavy public queries (Server Components, ISR).
- **Studio reality:** Kristin runs the same named classes repeatedly (e.g., "Beginning Copper Foil"), sometimes in parallel cohorts (Tuesday evenings vs. Saturday mornings). Class names, descriptions, and fees are stable; what changes per offering is who's teaching when.

## Options considered

### Option A — Single record per class, dates as a flat list
One row per class with an embedded list of session dates. When Kristin re-offers a class, she edits the dates field in place. Simplest schema; one source of truth per named class. Cannot represent two concurrent cohorts of the same class without either two duplicate rows or a "cohort label" hack on each date.

### Option B — Single record per scheduled run
Each scheduled offering is its own row ("Beginning Copper Foil — Spring 2026", "— Fall 2026"). Re-offering means duplicating the row. Schema stays flat; description/fees/category get duplicated across cohorts; renaming the underlying course requires editing every row.

### Option C — Two-tier: Class (template) + Cohort (offering) with child sessions table
One `classes` row per named course (stable fields). One or more `cohorts` rows per class (label, publish state, enrollment counter). A child `cohort_sessions` table holds the actual date+time rows. Cleanest model for concurrent cohorts and stable course info; more schema and more admin UI than the flat options.

### Option D — Embedded JSON for sessions
Variation on either A or C that stores sessions as a JSONB array on the parent row rather than a child table. Simpler schema, but queries like "all classes with an upcoming session" require unnesting JSON instead of using a regular index on `starts_at`.

## Decision

**Option C — two-tier model with a child sessions table.** Specifically:

### Schema

**`classes` table** (one row per named course):

| Field | Type | Notes |
|---|---|---|
| `id` | uuid (PK) | |
| `slug` | text (unique) | Auto-derived from `name` on every save. Not admin-editable. |
| `name` | text | |
| `category` | enum | `stained_glass` \| `mosaic` \| `fused_glass` \| `other` |
| `skill_level` | enum | `beginner` \| `intermediate` \| `advanced` \| `all_levels` |
| `prerequisite` | text (nullable) | Free-text — used to express nuance like "foil proficiency required". |
| `description` | text | |
| `tuition` | numeric (currency) | |
| `supply_fee` | numeric (currency, nullable) | |
| `kit_fee` | numeric (currency, nullable) | |
| `fee_notes` | text (nullable) | Free-text qualifiers like "+ glass at cost" or "materials extra". |
| `max_students` | integer (nullable) | |
| `image_url` | text (nullable) | Optional. See [ADR-0007](./0007-image-pipeline-and-storage.md) for storage. |
| `image_alt` | text (nullable) | Required when `image_url` is present. |
| `published` | boolean | Draft/publish toggle. |
| `created_at`, `updated_at` | timestamptz | |

**`cohorts` table** (one row per offering of a class):

| Field | Type | Notes |
|---|---|---|
| `id` | uuid (PK) | |
| `class_id` | uuid (FK → `classes.id`) | |
| `label` | text | Short identifier — "Tuesday evenings", "Spring 2026". Used to distinguish concurrent cohorts on the public page. |
| `enrollment_count` | integer (nullable) | Admin-only planning aid. Never displayed publicly. |
| `published` | boolean | Independent of `class.published`. Lets Kristin draft a cohort before announcing it. |
| `created_at`, `updated_at` | timestamptz | |

**`cohort_sessions` table** (one row per individual session date):

| Field | Type | Notes |
|---|---|---|
| `id` | uuid (PK) | |
| `cohort_id` | uuid (FK → `cohorts.id`) | |
| `starts_at` | timestamptz | |
| `ends_at` | timestamptz | |
| `created_at`, `updated_at` | timestamptz | |

### Public visibility rule

A class is visible on the public site if and only if **all three** are true:

1. `class.published === true`
2. There exists at least one `cohort` for the class with `cohort.published === true`
3. That cohort has at least one `cohort_session` with `ends_at > now()`

When the last upcoming session of the last published cohort passes, the class disappears from public view automatically. Kristin re-publishes implicitly by adding new sessions (or a new cohort).

### Lifecycle of expired cohorts

Expired cohorts persist in the database indefinitely. The admin class-detail view shows upcoming cohorts by default with a "Show past cohorts" toggle revealing the rest. Kristin can manually delete past cohorts if she wants; no automatic cleanup job runs.

### Slug behavior

Slugs are auto-generated from `name` on every save (kebab-case, stripped of non-alphanumerics). Class renames change the URL. There is no slug history table — inbound links to a renamed class will 404.

## Rationale

- **The two-tier model matches the studio's actual operation.** Class names and descriptions are stable across years; what varies is who runs which cohort when. Storing the stable parts once (and the variable parts per offering) avoids the duplication of Option B and the inability-to-represent-concurrent-cohorts of Option A.
- **A child `cohort_sessions` table beats JSON for our access pattern.** The "is this class visible?" query is `WHERE EXISTS (SELECT … cohort_session WHERE ends_at > now())` — that wants a regular index on `starts_at`/`ends_at`, which JSONB doesn't give us cleanly. The cost is one more table; the win is plain SQL for visibility and any future "upcoming sessions this week" query.
- **Strict enums for `category` and `skill_level`** give the public site clean filtering and consistent display. Nuance from the existing site ("Intermediate Foil", "Intermediate/Advanced") goes into `prerequisite` or `description`, where it reads more naturally as prose anyway.
- **Three scalar fee fields + `fee_notes`** preserves the studio's pricing reality. Tuition, supply fee, and kit fee are knowable numbers; "glass at cost" and "materials extra" are not. Forcing those into structured fields would either lose information or require a more complex repeating-fee model than the field set warrants.
- **Per-cohort `published` flag** lets Kristin plan a cohort ahead of time without committing to public visibility. The class itself can stay published; the new cohort drafts while she finalizes dates.
- **Auto-derived non-editable slugs** trade rename safety for one fewer field Kristin has to think about. Class names are stable in practice; the studio's traffic doesn't accumulate deep bookmarks. If we ever need slug history, that's an additive change to a `class_slug_history` table without touching the rest of the schema.
- **Expired cohorts persist** because (a) deleting on a schedule requires a background job and the supporting infrastructure is unnecessary at this scale; (b) Kristin gets accidental history as a side benefit — useful when re-launching a cohort, where she can copy the previous one's structure.

## Tradeoffs accepted

- **Three tables instead of one.** More schema, more admin form surface (a class detail page must list and manage cohorts, and a cohort form must list and manage sessions). Acceptable because the data shape is genuinely two-tier; flattening it would push complexity into either duplicated rows or stringly-typed cohort labels.
- **Class renames break URLs.** No `class_slug_history` table; renaming a class invalidates any external link to the old URL. Acceptable because (a) the studio's class names are decades-stable and (b) we can add a slug history table later without altering existing records.
- **No native scheduled publish.** A `publish_at` datetime was considered and skipped — the combination of `class.published`, `cohort.published`, and "no upcoming sessions = hidden" covers the practical need (Kristin can stage a cohort with sessions and keep it draft until the right moment). The cost: if Kristin wants a class to go public at 6 AM next Tuesday without manual intervention, she can't.
- **Strict enums lose richness.** Variations like "Intermediate Foil" can't be expressed in the level field itself — they live in `prerequisite` or `description`. Acceptable because public filtering and SEO/schema markup benefit from clean values; the lost nuance is the kind of information students read in prose anyway.
- **`fee_notes` is unstructured.** Strings like "+ glass at cost" can't be price-extracted for `Offer`/`Course` schema markup. Acceptable: the structured fees (tuition/supply/kit) cover the price portion of schema markup; `fee_notes` is human-readable supplemental text.
- **`enrollment_count` is admin-trust.** No system enforces consistency between it and any external roster Kristin keeps. It's a planning aid, not a reservation system.
- **No history of past cohorts as a feature.** Expired cohorts persist accidentally; if Kristin deletes them, that history is gone with no recovery. Acceptable because the project scope does not include analytics or historical reporting on classes.

## Amendment 2026-05-22 — Schema additions for Google Calendar integration

Per [ADR-0020](./0020-google-calendar-integration.md), integrating class data with Kristin's public Google Calendar requires three additive columns and one column relaxation against this ADR's schema. The amendment is non-breaking; existing rows take the new defaults / null values cleanly.

**`cohort_sessions`** — three new columns:

| Field | Type | Notes |
|---|---|---|
| `gcal_event_id` | text (nullable) | The ID returned by Google Calendar when an event is created for this session. Null when the session has never been synced (e.g., parent cohort is draft). |
| `sync_status` | text (enum-checked: `synced` \| `pending` \| `failed`) | Per-row sync state. Defaults to `pending` on insert. |
| `sync_error` | text (nullable) | Last error message from a failed push. Cleared on successful sync. |

**`cohorts.label`** — type unchanged, `NOT NULL` constraint dropped:

| Field | Change | Notes |
|---|---|---|
| `label` | required → optional | Required for multi-session cohorts (used to distinguish concurrent runs); optional for one-off single-session cohorts where the session date already disambiguates. The public visibility rule and admin views are unchanged. |

**Rationale note on `enrollment_count`.** This ADR's original framing — *"admin-only planning aid. Never displayed publicly"* — remains true for the value itself. The sold-out title prefix introduced by [ADR-0020](./0020-google-calendar-integration.md) does, however, make `enrollment_count`'s *consequences* public: when `enrollment_count >= max_students`, every Google Calendar event for the affected cohort is prefixed `[SOLD OUT]`. The count number is still never displayed; the derived sold-out state is.

## Amendment 2026-05-26 — Cohort kind column

Per [ADR-0021](./0021-admin-class-workflow-ux.md), the admin UI surfaces two distinct cohort creation flows ("New cohort" for multi-session courses, "New single session" for one-off workshops), and the public site renders the two kinds with different card layouts. A reliable column-level signal is needed so the renderer doesn't have to derive intent from session count.

**`cohorts`** — one new column:

| Field | Type | Notes |
|---|---|---|
| `kind` | enum (`'multi_session' \| 'single_session'`) | Set on insert based on the admin's entry-point choice; immutable thereafter. The public site renderer branches on this column. |

**Field semantics revised by this amendment:**

- `label` semantics narrow: required for `kind = 'multi_session'`, optional/auto-generated for `kind = 'single_session'` (single-session workshops do not need a human-meaningful cohort label; the date and time serve as identification). [ADR-0020](./0020-google-calendar-integration.md)'s 2026-05-22 amendment already dropped the database-level `NOT NULL` constraint on `label`; this amendment adds the `kind`-conditional rule that the admin and renderer enforce on top of that constraint relaxation.

**Tradeoff:** Converting a single-session workshop into a multi-session cohort (or vice versa) requires deleting and recreating the cohort, since `kind` is immutable. Acceptable; conversion would be rare and the data model treats them as distinct kinds.

## Related decisions

- Depends on: [ADR-0004](./0004-admin-dashboard-architecture.md) (defines class as one of the two admin-managed content types), [ADR-0005](./0005-database-and-query-layer.md) (Postgres + Supabase CLI migrations will implement this schema), [ADR-0007](./0007-image-pipeline-and-storage.md) (Supabase Storage backs the optional class image).
- Influences: Content modeling — bulletin board (next ADR; similar publish/visibility patterns), SEO & schema markup (later ADR; `Course` + `Event` markup will draw from class + cohort + session shape), admin UI build (class detail view manages a list of cohorts; cohort form manages a list of sessions), public `/classes` page rendering (visibility query joins all three tables).
