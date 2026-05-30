---
id: 03-classes-admin
title: Classes admin
phase: 2
status: in-progress
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

_Appended on completion. Document what shipped, any in-flight decisions or
deviations, and the PR link._
</content>
