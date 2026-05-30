---
id: 03-classes-admin
title: Classes admin
phase: 2
status: done
depends_on: [02-auth-and-admin-shell]
adrs_realized: [0004, 0007, 0015, 0021]
---

# Classes admin

## Goal

Build the class-level admin surface: the `/admin/classes` rich list and the class create/edit detail form (the stable course fields, auto-derived slug, sectioned layout, and inline image upload), with the status pill + targeted banner communicating publication state.

## Context

Touches Supabase Storage (browser-side image upload) — invoke the `supabase` skill before first use. Image upload follows [ADR-0021](../../decisions/0021-admin-class-workflow-ux.md) decision H: on file pick, bytes upload directly to the `site-images` bucket via the client-side `supabase-js` client under Kristin's authenticated session (path `site-images/classes/<filename>`, `upsert: true`); the Server Action only persists the returned URL + alt text on Save. Fill in dev-guide § Admin image upload when this lands. The Phase 1 RLS policy already grants `authenticated` writes to the bucket.

Form shape is [ADR-0021](../../decisions/0021-admin-class-workflow-ux.md) decision F (single sectioned form — Basics / Fees / Image / Publish — one Save), the rich list is decision J (columns, sort, filters, search), and the status pill + banner are decision I (four visibility states, computed from one shared visibility query so they cannot drift). Slug is auto-derived from `name` on every save, non-editable ([ADR-0015](../../decisions/0015-content-modeling-classes.md)). Forms use Zod + React Hook Form + shadcn `<Form>` ([ADR-0009](../../decisions/0009-forms-and-validation.md)); mutations are Server Actions ([ADR-0004](../../decisions/0004-admin-dashboard-architecture.md)). The "Next session" column uses the Intl display helpers (dev-guide § Date/time handling).

## Scope (in)

1. `/admin/classes` rich list — columns (Name, Status pill, Category, Skill level, Next session, Last updated), default sort (Next session asc, no-upcoming sinks to bottom, tie on Last updated desc), AND-combined Status/Category/Skill filters, and a Name free-text search ([ADR-0021](../../decisions/0021-admin-class-workflow-ux.md) J).
2. `/admin/classes/new` and `/admin/classes/[id]` using shared create/edit form components (edit prefills; same components per [ADR-0021](../../decisions/0021-admin-class-workflow-ux.md) E).
3. Sectioned class form (Basics / Fees / Image / Publish) with Zod validation; settle the field-to-section assignment ([ADR-0021](../../decisions/0021-admin-class-workflow-ux.md) F leaves this to implementation).
4. Auto-derived non-editable slug on save.
5. Inline class image upload (browser-side `supabase-js`) + alt text (required when an image is present).
6. Status pill (four states) + targeted banner on the detail page when in a `Hidden — *` state, both computed from one shared visibility query ([ADR-0021](../../decisions/0021-admin-class-workflow-ux.md) I).
7. Shared Intl-based date/time display helpers used by the Next-session column.

## Scope (out)

- Cohort and session management (the detail page's cohort list, modals, recurring builder) — task `04-cohorts-and-sessions`.
- GCal push on save — task `06-gcal-sync`.
- Public-site class rendering — task `07-public-read-wiring`.
- Luxon write-side conversion utilities — task `04` (this task only formats existing timestamps for display).

## Test specs

- Vitest: `src/lib/<slug>.test.ts` (slug derivation: spaces, punctuation, casing, collisions) and a test for the status-pill state resolver across the four visibility states.
- Vitest: rich-list sort/filter logic over row fixtures (default sort, no-upcoming sink, combined filters, name search).
- Playwright: `e2e/admin-classes.spec.ts` — a seeded admin creates a class, sees it in the list with the correct pill, edits it, and uploads an image that persists on reload.

## Exit criteria

- An admin can create, edit, and publish/unpublish a class; slug auto-derives from name.
- An image uploads on file pick and its URL persists with the class on Save; alt text is required when an image is present.
- The status pill shows the correct one of four states; the banner appears only in `Hidden — *` states and links to the fixing action.
- The list renders with correct default sort and working filters/search.
- `pnpm check` and `pnpm test:e2e` pass.

## Resolution

Shipped the class-level admin surface. `/admin/classes` is a rich list (server
component joins `classes` + `cohorts` + `cohort_sessions` once per load, ~30-row
scale per ADR-0021) feeding a client table that filters (AND-combined
Status/Category/Skill), name-searches, and sorts (Next session asc, no-upcoming
sinks, Last-updated-desc tiebreak) via the pure `selectClassRows`. `new` and
`[id]` share `ClassForm`; edit prefills via `classRowToFormValues`.

Pure logic landed test-first in `src/lib/`: `slug.ts` (`slugify` + collision-
resolving `uniqueSlug`), `class-status.ts` (`resolveClassStatus` → the four
states; `classStatusInfo` is the single label source the pill and banner both
read, so they can't drift), `class-list.ts` (sort/filter/search),
`datetime.ts` (Intl studio-zone helpers), plus `class-form-schema.ts` and
`class-labels.ts`. 56 unit tests pass.

Decisions/deviations:
- **Field→section (ADR-0021 F, left to implementation):** Basics (name,
  category, skill, prerequisite, description, max_students) · Fees (tuition,
  supply_fee, kit_fee, fee_notes) · Image (upload + alt) · Publish (published).
- **Form typing:** two schemas off one field set — `classFormSchema` (all
  strings, so RHF input === output, no transform/Control type conflict) for the
  client; `classWriteSchema` (transform → DB shape, blanks → null) which the
  Server Action re-validates the raw input through. Alt-required-when-image is
  enforced in the schema, not just UI.
- **Image path (deviates from ADR-0021 H's "deterministic path" wording):**
  `classes/<uuid>-<slug>.<ext>`. A per-pick UUID prevents two classes that
  upload a same-named file from clobbering each other; the orphan residual the
  ADR already accepts covers the pick-but-never-Save case. Direct browser
  upload under Kristin's session; the action only persists the returned URL.
- **`STUDIO_TZ`** added to `site-config.ts` (the dev-guide already pointed here);
  dev-guide § Admin image upload and § Date/time handling filled in.

Slug auto-derives on every save and excludes the edited row from the
uniqueness check. The `[id]` page carries a `#cohorts` placeholder section that
the banner links to and task 04 will populate.

Verified: `pnpm check` (lint/prettier/typecheck/56 tests) and `pnpm build`
both pass; `pnpm test:e2e` passes with the new `admin-classes.spec.ts`
round-trip skipped where `E2E_ADMIN_*` creds are absent (same gating as the
task-02 auth round-trip — it exercises create→list→publish→image-persist when
run against a seeded user).

PR: https://github.com/kevinthomaskane/allen-kenoyer-redesign/pull/4
</content>
