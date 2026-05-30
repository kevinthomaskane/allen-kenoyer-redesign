---
id: 02-auth-and-admin-shell
title: Auth & admin shell
phase: 2
status: todo
depends_on: [01-data-layer]
adrs_realized: [0004, 0006, 0021]
---

# Auth & admin shell

## Goal

Gate `/admin/*` behind Supabase Auth (email + password, invite-only) using `@supabase/ssr` cookie sessions, and stand up the admin shell — login, password reset, the protected layout chrome, and the `/admin` dashboard landing — so subsequent admin tasks have an authenticated surface to build in.

## Context

Touches Supabase Auth — invoke the `supabase` skill before first use for the `@supabase/ssr` SSR/cookie patterns and the `getUser` (not `getSession`) server-validation guidance. Builds on the client factories from task `01-data-layer`.

[ADR-0006](../../decisions/0006-authentication.md) settles the method (email+password only), provisioning (invite-only; no `/signup`; users seeded via Supabase Dashboard or `inviteUserByEmail`), the two enforcement layers (middleware on `/admin/*` + RLS from task `01`), and the password-reset flow (`resetPasswordForEmail` → `/admin/reset-password`). [ADR-0004](../../decisions/0004-admin-dashboard-architecture.md) places the admin at `/admin/*` in the same app. The dashboard landing is plain navigation cards (Classes, Bulletins) per [ADR-0021](../../decisions/0021-admin-class-workflow-ux.md) decision K — no activity feed or counts. Supabase's default auth emails are acceptable until the Resend SMTP integration ships in Phase 3.

## Scope (in)

1. `@supabase/ssr` middleware refreshing the session and protecting `/admin/*` — unauthenticated requests redirect to `/admin/login`.
2. `/admin/login` — custom email + password form calling `signInWithPassword`, built with project UI primitives; includes a "forgot password" link.
3. Password reset: `resetPasswordForEmail` trigger and the `/admin/reset-password` page handling the email redirect.
4. Shared `/admin` layout chrome (authenticated nav, sign-out).
5. `/admin` dashboard landing — welcome line + two navigation cards (Classes → `/admin/classes`, Bulletins → `/admin/bulletins`) per [ADR-0021](../../decisions/0021-admin-class-workflow-ux.md) K.
6. Confirm public signup is disabled in Supabase Auth settings; document the invite workflow.

## Scope (out)

- Classes / bulletins admin UI — tasks `03`, `04`, `05` (the dashboard cards link to routes built there).
- Custom SMTP (Resend) for auth emails — Phase 3 ([ADR-0010](../../decisions/0010-form-submission-and-transactional-email.md)).
- Role-based authorization — explicitly rejected ([ADR-0004](../../decisions/0004-admin-dashboard-architecture.md) flat model).

## Test specs

- Playwright: `e2e/admin-auth.spec.ts` — unauthenticated visit to `/admin` and `/admin/classes` redirects to `/admin/login`; a seeded admin can log in and land on `/admin`; sign-out returns to login; `/signup` does not exist (404).
- Vitest: any pure middleware route-matching / redirect helper logic covered with unit tests.

## Exit criteria

- Every `/admin/*` route is unreachable while unauthenticated (redirects to login); reachable after login.
- A seeded admin can log in, sign out, and complete a password reset round-trip.
- `/admin` shows the two navigation cards; no `/signup` route exists.
- `pnpm check` and `pnpm test:e2e` pass.

## Resolution

_Appended on completion. Document what shipped, any in-flight decisions or
deviations, and the PR link._
</content>
