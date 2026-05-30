---
id: 02-inquiry-forms
title: Inquiry forms
phase: 3
status: todo
depends_on: [01-submission-pipeline]
adrs_realized: [0009, 0010]
---

# Inquiry forms

## Goal

Add the two richer public inquiry forms — **custom-design** (`/custom-design`) and **repair** (`/repairs`) — reusing the form stack, Resend pipeline, and spam-protection layer built in task `01`, each with its own Zod schema and field set, replacing the page's current bare `mailto:` CTA with an on-page form.

## Context

Builds entirely on task `01-submission-pipeline`: the same Zod + RHF + shadcn `<Form>` stack ([ADR-0009](../../decisions/0009-forms-and-validation.md)), the same Resend shim + React Email notification template and `{ ok, fieldErrors?, formError? }` Server-Action result shape, and the same honeypot + Supabase-Postgres-backed per-IP rate-limit layer ([ADR-0010](../../decisions/0010-form-submission-and-transactional-email.md), dev-guide § Public-form spam protection). This task **reuses** that machinery — it does not rebuild it, and it adds no new Supabase schema (it calls task `01`'s existing rate-limit counter).

Each form's fields are derived from its page's existing content rather than invented: `/custom-design` already walks the visitor through theme/style/project-type prompts, and `/repairs` already lists the repairable item types (`REPAIR_ITEMS`). Notifications route to the same env-configured studio inbox. **Text-only — no file/photo upload** (README Scope (out)); the page keeps its existing phone/`mailto` details as an alternate path. Build and test against Resend's sandbox / dev-verified domain — production domain verification is Phase 4.

## Scope (in)

1. **Custom-design inquiry form** (`/custom-design`): a `'use client'` form region + colocated Zod schema + feature-local Server Action reusing task `01`'s shim and spam layer. Fields derived from the page's existing prompts (e.g. name, email, phone, project type/location, description/vision). Replaces the `mailto:` CTA with the form.
2. **Repair inquiry form** (`/repairs`): the same pattern, with fields derived from the page (e.g. name, preferred contact, item type from `REPAIR_ITEMS`, description of the damage). Replaces the `mailto:` CTA with the form.
3. Each Server Action validates against its schema, runs the shared honeypot + per-IP rate-limit check, and sends a Resend notification to the studio inbox via the shared template (a light per-form variant is fine).

## Scope (out)

- The shared machinery (Resend shim, React Email template, spam-protection layer, the `<Form>` submit pattern) — built in task `01`; reused here, not rebuilt.
- Production sender-domain verification + Supabase Auth SMTP cutover — Phase 4 launch ([ADR-0010](../../decisions/0010-form-submission-and-transactional-email.md), [ADR-0018](../../decisions/0018-url-redirects-and-migration.md)).
- File/photo upload — out of phase (README Scope (out)); text-only.
- Submission persistence — email-only ([ADR-0010](../../decisions/0010-form-submission-and-transactional-email.md)).

## Test specs

- Vitest: a schema test per form — each accepts a valid payload and rejects its key invalid cases (missing required field, malformed email).
- Playwright: `e2e/inquiry-forms.spec.ts` — for each of `/custom-design` and `/repairs`, a valid submission (Resend send mocked/stubbed) shows the success state and an invalid submission shows field-level errors and sends nothing.

## Exit criteria

- Both forms validate client-side via Zod + RHF + shadcn `<Form>` and re-validate server-side against the same schema in their Server Actions.
- A valid submission on each sends a formatted Resend notification (sandbox / dev domain) to the studio inbox and shows a success state; an invalid one shows field errors and sends nothing.
- The honeypot and per-IP rate limit apply to both forms (reusing task `01`'s helper).
- Each page renders cleanly at 375 / 768 / 1280px; the `mailto:` CTA is replaced by the form with contact details retained.
- `pnpm check` and `pnpm test:e2e` pass.

## Resolution

_Appended on completion. Document what shipped, any in-flight decisions or
deviations, and the PR link._
