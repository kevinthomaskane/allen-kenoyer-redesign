---
id: 01-submission-pipeline
title: Submission pipeline & contact form
phase: 3
status: todo
depends_on: []
adrs_realized: [0009, 0010]
---

# Submission pipeline & contact form

## Goal

Build the shared public-form submission machinery once — the form stack (Zod + React Hook Form + shadcn `<Form>`), the Resend email-client shim and React Email notification template, and the honeypot + per-IP rate-limit protection layer — and prove it end-to-end on the `/contact` form, so the two inquiry forms in task `02` reuse it.

## Context

**Touches Supabase** (the rate-limit counter) — invoke the `supabase` skill before the first Supabase operation; it carries RLS/security guidance absent from training data. MCP workflow: `execute_sql` for iterative schema work, `apply_migration` to commit the stable counter object as a file in `supabase/migrations/`, `get_advisors` after any DDL. No Storage MCP tools needed. Per the MCP-direct workflow established in Phase 2 task `01` ([`supabase/README.md`](../../../supabase/README.md)).

The form layer is [ADR-0009](../../decisions/0009-forms-and-validation.md): one Zod schema per form feeding both `useForm({ resolver: zodResolver(schema) })` and the Server Action's server-side `safeParse`; shadcn `<Form>`/`<FormField>`/`<FormMessage>` for field + error UX; the form region is `'use client'`. The submission pipeline is [ADR-0010](../../decisions/0010-form-submission-and-transactional-email.md): public forms POST to feature-local Server Actions that validate, run spam protection, then send a React Email-rendered notification via Resend; **email-only — no submission row**. Spam protection (honeypot + Supabase-Postgres-backed per-IP rate limit) is dev-guide § Public-form spam protection; fill that stub in as this ships. Form types derive from the Zod schema via `z.infer` (dev-guide § Type discipline).

**Build and test against Resend's sandbox / a dev-verified domain.** Production sender-domain verification (SPF/DKIM/DMARC on `allenkenoyerglass.com`) and the Supabase Auth → Resend SMTP cutover are Phase 4 launch work (per the Phase 3 README Scope (out)) — do **not** block this task on them. The notification recipient (studio inbox, e.g. `akglass@allenkenoyerglass.com`) and the dev sender are env-configured.

**Coordination:** Phase 2 task `03-classes-admin` (running in parallel) also introduces the RHF + Zod + shadcn `<Form>` stack for the admin class form — whichever lands first adds the dependency and the shadcn `<Form>` primitive. Add them here if absent; don't duplicate config.

## Scope (in)

1. **Dependencies** (verify latest stable before install, per the dependency rule): `resend`, `react-email` + `@react-email/components`, and — if not already present from Phase 2 — `react-hook-form` and the shadcn `<Form>` primitive (`pnpm dlx shadcn@latest add form`). Zod is the validation library.
2. **Resend email-client shim** in `src/lib/email/` (server-only) — a thin wrapper reading the API key + sender/recipient from env and sending a React Email-rendered message. The single send path both this phase's forms and (later) Supabase Auth flow through conceptually.
3. **React Email notification template** rendering a submitted form's fields into a formatted email to the studio inbox.
4. **Spam-protection layer** per dev-guide § Public-form spam protection: the honeypot-field convention (hidden input; non-empty ⇒ return success-shaped output, send nothing) and the **Supabase-Postgres-backed per-IP rate-limit helper** (the counter object + the Server-Action-side check, keyed by client IP within a window). Fill in the dev-guide stub with the chosen shape.
5. **Shared submission pattern**: the shadcn `<Form>` composition and a standard `{ ok, fieldErrors?, formError? }`-shaped result returned by public-form Server Actions, surfaced through `<FormMessage>` (field-level) + a form-level success/error state. Establishes the "one Zod schema → `zodResolver` + server `safeParse`" convention task `02` follows.
6. **Contact form end-to-end** (`/contact`): a `'use client'` form region (name, email, message), its colocated Zod schema, and a feature-local Server Action that validates → honeypot + rate-limit → sends via the shim. Keep the existing phone/`mailto` contact details on the page as an alternate path.

## Scope (out)

- Custom-design & repair inquiry forms — task `02-inquiry-forms`.
- Production sender-domain verification + Supabase Auth → Resend SMTP cutover — Phase 4 launch ([ADR-0010](../../decisions/0010-form-submission-and-transactional-email.md), [ADR-0018](../../decisions/0018-url-redirects-and-migration.md)).
- File/photo upload on the form — out of phase (README Scope (out)); text-only.
- Any DB persistence of submissions beyond the rate-limit counter — email-only ([ADR-0010](../../decisions/0010-form-submission-and-transactional-email.md)); the counter is abuse-protection infra, not a submission record.
- Newsletter signup — already shipped in Phase 1 ([ADR-0011](../../decisions/0011-newsletter-esp-integration.md)).

## Test specs

- Vitest: `src/app/(public)/contact/schema.test.ts` (or colocated) — the contact Zod schema accepts a valid payload and rejects missing name, malformed email, and empty message.
- Vitest: the honeypot check and the rate-limit window logic as units where expressed in TS (honeypot detection; window/ceiling math). If the rate limit lives purely in SQL, cover it via a Server-Action integration assertion instead and note that in Resolution.
- Playwright: `e2e/contact-form.spec.ts` — a valid submission (Resend send mocked/stubbed) shows the success state; an invalid submission shows field-level errors and sends nothing; a honeypot-filled submission is accepted success-shaped without a send.

## Exit criteria

- The contact form validates client-side via Zod + RHF + shadcn `<Form>` with field-level errors, and re-validates server-side against the **same** schema in its Server Action.
- A valid submission sends a formatted Resend notification (sandbox / dev-verified domain) to the env-configured studio inbox and shows a success state; an invalid one shows field errors and sends nothing.
- The honeypot and the Supabase-Postgres-backed per-IP rate limit reject without sending email; the rate-limit counter exists in Postgres and `get_advisors` reports no new security findings (any accepted advisory documented in Resolution).
- No submission row is persisted (email-only); dev-guide § Public-form spam protection is filled in.
- `pnpm check` and `pnpm test:e2e` pass.

## Resolution

_Appended on completion. Document what shipped, any in-flight decisions or
deviations, and the PR link._
