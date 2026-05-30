---
id: 02-auth-and-admin-shell
title: Auth & admin shell
phase: 2
status: done
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

Shipped 2026-05-29 on branch `phase-2/02-auth-and-admin-shell`.

**Structure (Kevin's call).** Introduced a route-group split so the admin doesn't
inherit the public marketing chrome: public routes moved into `src/app/(public)/`
(its layout holds `InfoBar` + `SiteNav` + footer), the root `layout.tsx` is now a
bare html/body/fonts shell, and admin chrome lives in
`src/app/admin/(protected)/layout.tsx`. Route groups don't change URLs, so all 14
Phase-1 routes are unchanged (E2E still green). Documented in dev-guide §
App structure.

**Two corrections from Kevin, both applied:** (1) the middleware lives in
`src/proxy.ts` exporting `proxy` — Next.js 16 renamed the `middleware` convention
(verified against the Next 16 upgrade docs); (2) the dev server is not needed and
was killed for a clean E2E run.

**Auth.** `@supabase/ssr` session refresh + `/admin/*` gating in `src/proxy.ts`
→ `src/lib/supabase/middleware.ts`, using `getClaims()` (current Supabase SSR
guidance; the task context's `getUser` note predated checking the docs — noted as
a deviation). Redirect decision extracted to a pure `src/lib/auth-routes.ts`
helper with unit tests. `/admin/login` (custom `signInWithPassword` form +
"forgot password" → `resetPasswordForEmail`), `/admin/reset-password` (PKCE
`exchangeCodeForSession` + `updateUser`), a `signOut` server action, and the
`/admin` dashboard with two plain navigation cards (ADR-0021 K). Login/reset forms
use shadcn primitives (added `card`/`input`/`label`); the heavier Zod + RHF +
`<Form>` stack (ADR-0009) is deferred to task 03's class form. No `/signup` route.

**Verification.** `pnpm check` ✓ (lint + format + typecheck + 30 vitest tests,
incl. the new `auth-routes` tests). `pnpm test:e2e` ✓ (21 passed) — `/admin` and
`/admin/classes` redirect to `/admin/login`, login page reachable, `/signup`
404s, all 14 Phase-1 routes still pass, and the seeded-admin login → dashboard →
sign-out round-trip passes. A throwaway test admin user was created via the
Supabase admin API (secret key from `.env.local`); `E2E_ADMIN_EMAIL` /
`E2E_ADMIN_PASSWORD` live in gitignored `.env.local` and gate that one E2E test.

**Follow-ups (Supabase Dashboard — no Management-API token available, so these
were Kevin's), both completed 2026-05-29:**
1. **Disable public signup** — done; verified via an anon `signUp` probe
   returning `422 signup_disabled` ("Signups not allowed for this instance").
   ADR-0006 invite-only; scope item 6.
2. **Allowlist the reset redirect URL** — done. The password-reset code is built
   and correct; the end-to-end round-trip's only remaining step is a real
   email-link click (email-based reset isn't E2E-automatable), now unblocked.

**Post-merge fix.** The first preview deploy failed: the task-01 `.vercelignore`
entry `supabase/` (unanchored) also matched `src/lib/supabase/`, so Vercel
stripped the client factories and the admin build hit `Module not found:
@/lib/supabase/client`. `next build` and CI don't apply `.vercelignore`, so it
surfaced only on Vercel. Fixed by anchoring both `.vercelignore` and
`.prettierignore` to `/supabase` (the latter had been silently skipping
format-checks on `src/lib/supabase/`). Also confirmed the project uses
asymmetric JWT signing keys (ES256), so `getClaims()` verifies locally.

PR: https://github.com/kevinthomaskane/allen-kenoyer-redesign/pull/2
</content>
