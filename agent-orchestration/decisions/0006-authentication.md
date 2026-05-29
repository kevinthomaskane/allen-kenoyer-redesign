# ADR-0006: Authentication (admin)

- **Status:** Accepted
- **Date:** 2026-05-19
- **Deciders:** Kevin Kane

## Context

[ADR-0004](./0004-admin-dashboard-architecture.md) requires authenticated access to `/admin/*` routes with a flat permission model — any authenticated user has full CRUD across both content types, with one user (Kristin) in practice. [ADR-0005](./0005-database-and-query-layer.md) locked Supabase Postgres as the database and `supabase-js` as the query layer, which sets up Supabase Auth as the natural — but not automatic — default for this decision.

## Options considered

### Provider
- **Supabase Auth** — bundled with the database we're already using; integrates with Row-Level Security; cost is included in the existing Pro plan.
- **Auth.js v5 (NextAuth)** — open-source, App Router-native, transferable skill. Awkward fit without an ORM (no adapter for raw `supabase-js`).
- **Clerk** — polished managed auth, fast to ship. Another vendor and another bill; user identity lives outside Supabase, which complicates RLS.
- **Custom (lucia-auth, oslo, iron-session)** — full control, real engineering investment in password hashing, session management, password reset flows, and email plumbing.

### Method
- **Email + password** — conventional, password-reset flow required.
- **Magic link (passwordless)** — passwordless UX, depends on email delivery.
- **OAuth (Google)** — one-click login if user has Google.
- **Combinations** — Supabase supports multiple methods simultaneously.

### Provisioning
- **Invite-only / pre-seeded** — public signup disabled at the provider level; admins are seeded directly (dashboard, admin API, or invite-by-email).
- **Open signup with email allowlist** — signup page exists, server-side allowlist check.
- **Open signup with domain allowlist** — broader, only useful for many-staff scenarios.

### Login UI
- **Custom in-app login page** — hand-built form calling `supabase.auth.signInWithPassword()`. Full UX control, consistent with [ADR-0004](./0004-admin-dashboard-architecture.md)'s custom-admin choice.
- **`@supabase/auth-ui-react`** — Supabase's pre-built React components. Saves trivial time on a one-form surface; adds a dependency and visual inconsistency with the rest of the admin.

## Decision

This ADR bundles five related calls:

1. **Provider:** Supabase Auth.
2. **Method:** Email + password only. No magic link, no OAuth, no other providers enabled.
3. **Provisioning:** Invite-only. Public signup is disabled in Supabase Auth settings. Admin users are created by Kevin via the Supabase Dashboard or `auth.admin.inviteUserByEmail()`. No `/signup` route exists in the app.
4. **Login UI:** Custom-built. A single `/admin/login` page with email + password inputs. Includes a "forgot password" link that triggers `supabase.auth.resetPasswordForEmail()` and a `/admin/reset-password` page that handles the redirect from the password-reset email.
5. **Session strategy:** Supabase defaults — 1-hour access token, 60-day refresh token — via the `@supabase/ssr` package for App Router cookie-based sessions. No custom session lifetime tuning.

**Authorization enforcement (two layers):**
- **Application layer:** All `/admin/*` routes are protected by middleware that checks for a valid Supabase session. Unauthenticated requests redirect to `/admin/login`.
- **Database layer (defense-in-depth):** RLS policies on the `classes` and `bulletins` tables. Public anonymous reads allowed on rows where `published = true` (and within the active display window for bulletins). Writes (`INSERT`/`UPDATE`/`DELETE`) restricted to authenticated users. Specific RLS policy SQL lives in the content-modeling ADRs ([ADR-0015](./0015-content-modeling-classes.md), [ADR-0016](./0016-content-modeling-bulletin-board.md)) and migration files.

## Rationale

- **Supabase Auth is the natural pairing** with the Supabase database and `supabase-js` SDK locked in [ADR-0005](./0005-database-and-query-layer.md). It integrates directly with RLS, so the authenticated user's identity propagates to the database for row-level policy enforcement — a real defense-in-depth gain that an external auth provider would require extra wiring to replicate.
- **Email + password** is the conventional method for a non-technical user who'll interact with the system intermittently. Magic link's email-delivery dependency adds a failure mode (Kristin can't log in if email is slow); OAuth requires Google account hygiene she may not maintain.
- **Invite-only** is the only sensible posture for an admin surface where unauthorized access has real consequences. Public signup would be a footgun even with an allowlist check.
- **Custom login UI** matches the consistent "fully custom admin" choice from [ADR-0004](./0004-admin-dashboard-architecture.md) and avoids introducing the `@supabase/auth-ui-react` dependency for one form.
- **Supabase session defaults** are sensible (1hr / 60-day) and require no per-project tuning at this scope.

## Tradeoffs accepted

- **Vendor coupling to Supabase deepens.** DB ([0005](./0005-database-and-query-layer.md)) + Auth (this ADR) now both depend on Supabase. Moving off would require migrating both the data and the user identities. Acceptable; the Pro plan economics make migration unlikely.
- **No transferable auth-library experience accrued.** Auth.js skills are more transferable to other companies; choosing Supabase Auth trades that for integration depth. Consistent with the same tradeoff accepted in [ADR-0005](./0005-database-and-query-layer.md) for `supabase-js` over an ORM.
- **Email + password requires a password reset flow.** Standard Supabase function, but a UI page must be built. Not a real cost, just an item on the dev guide checklist.
- **Email-delivery dependency for password resets.** Supabase Auth sends reset emails via its own SMTP by default; for production we configure a custom SMTP provider — Resend, per [ADR-0010: Form submission & transactional email](./0010-form-submission-and-transactional-email.md). Acceptable to use Supabase's default emails until the Resend integration ships (Phase 3).
- **Session refresh on every server request** that touches a protected route. Acceptable overhead.

## Related decisions

- Depends on: [ADR-0001](./0001-frontend-framework.md) (App Router middleware + Server Components), [ADR-0004](./0004-admin-dashboard-architecture.md) (flat permission model), [ADR-0005](./0005-database-and-query-layer.md) (Supabase as the platform).
- Influences: Content modeling — classes (RLS policies), Content modeling — bulletin board (RLS policies), Form submission & transactional email (custom SMTP for auth emails), Styling & UI layer (login form is built with the project's UI primitives).
