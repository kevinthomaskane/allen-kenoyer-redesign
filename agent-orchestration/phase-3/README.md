# Phase 3 — Forms & Integrations

> The public site's outbound communication: three inquiry forms submit through a validated Server Action + Resend pipeline to the studio inbox, on the project's standard Zod + RHF + shadcn `<Form>` stack, with honeypot + per-IP spam protection.

## Goals

Wire up the only dynamic surface the public marketing site still lacks — its forms. Three pages that today expose a bare `mailto:` link get real forms: **contact**, **custom-design inquiry**, and **repair inquiry**. Each is built on the locked form stack (Zod + React Hook Form + shadcn `<Form>`), POSTs to a feature-local Server Action that re-validates against the same Zod schema, and on success sends a formatted notification email to the studio inbox via Resend. Submissions are email-only — no database row, no admin browsing UI ([ADR-0010](../decisions/0010-form-submission-and-transactional-email.md), [ADR-0004](../decisions/0004-admin-dashboard-architecture.md)).

The phase establishes the shared submission machinery once — the Resend email-client shim, the React Email notification template, the honeypot + per-IP rate-limit protection layer, and the shared submit/pending/success/error form UX — and proves it end-to-end on the contact form, then reuses it for the two richer inquiry forms.

Phase 3 builds and tests this pipeline against Resend's sandbox / a dev-verified domain. Production sender-domain verification and the Supabase Auth → Resend SMTP cutover are **launch work** deferred to Phase 4 (see Scope (out)). The newsletter touchpoints already shipped in Phase 1 (see Scope (out)).

## ADRs realized

- [ADR-0009](../decisions/0009-forms-and-validation.md) — form-building layer for the public forms: Zod schemas, React Hook Form state, shadcn `<Form>` field/error components; single schema per form reused client- and server-side
- [ADR-0010](../decisions/0010-form-submission-and-transactional-email.md) — Server Actions + Resend submission pipeline for public forms; React Email templates; honeypot + per-IP rate limiting; email-only persistence (no `form_submissions` table). _Production domain verification (SPF/DKIM/DMARC) and the Supabase Auth SMTP cutover are deferred to Phase 4 launch — see Scope (out)._
- [ADR-0011](../decisions/0011-newsletter-esp-integration.md) — newsletter via Constant Contact hosted links. _The build (Subscribe + "view latest" links in `lib/site-config.ts`) already shipped in Phase 1; Phase 3 carries no newsletter build — see Scope (out)._

A later phase may extend an ADR's surface area without re-listing it.

## Scope (in)

Sliced by workstream. Workstream A establishes the shared submission machinery and proves it on the simplest form; workstream B reuses that machinery for the two richer inquiry forms. Strictly sequential (B depends on A).

- **A — Submission pipeline & shared form layer (incl. contact form).** Add `react-hook-form` + `resend` + React Email dependencies. Build the Resend email-client shim and the React Email notification template; the spam-protection layer (honeypot field + per-IP rate-limit helper invoked from every public-form Server Action); and the shared shadcn `<Form>` submission pattern (a single Zod schema feeding both `zodResolver` and the Server Action, plus pending/success/error UX). Prove the whole loop end-to-end with the **contact form** (`/contact`): name + email + message → Server Action (Zod-validated, honeypot + rate-limit checked) → Resend notification to the studio inbox.

- **B — Inquiry forms.** The **custom-design inquiry** (`/custom-design`) and **repair inquiry** (`/repairs`) forms, reusing A's machinery with their own richer field sets and Zod schemas (e.g. project type / description / preferred contact), each POSTing to a feature-local Server Action → Resend. Replaces the bare `mailto:` CTA on each page with an on-page form.

## Scope (out)

- **Production email infrastructure** — Resend sender-domain verification (SPF/DKIM/DMARC on `allenkenoyerglass.com`) and the Supabase Auth → Resend SMTP cutover. Phase 3 builds and tests against Resend's sandbox / a dev-verified domain; the production cutover is launch work in **Phase 4**, alongside the DNS cutover ([ADR-0010](../decisions/0010-form-submission-and-transactional-email.md), [ADR-0018](../decisions/0018-url-redirects-and-migration.md)).
- **Public file/photo upload on forms** — no legacy or demo precedent; ADR-0010 persistence is email-only and ADR-0007 storage is admin-write only. Customers continue to share reference photos via the studio-email link present on each page. Text-only forms.
- **Newsletter signup / "view latest" build** — already shipped in **Phase 1** (Constant Contact hosted links in `lib/site-config.ts` per [ADR-0011](../decisions/0011-newsletter-esp-integration.md)). The only open newsletter item is confirming the "view latest" archive URL with Kristin — a launch-checklist confirmation (**Phase 4**), not a build task.
- **Submission persistence & admin browsing of submissions** — email-only by [ADR-0010](../decisions/0010-form-submission-and-transactional-email.md); a `form_submissions` table or admin triage UI is a rejected expansion of [ADR-0004](../decisions/0004-admin-dashboard-architecture.md)'s locked two-content-type scope.
- **SEO surface, analytics, and legacy URL redirects** — Phase 4 ([ADRs 0012](../decisions/0012-analytics-and-monitoring.md), [0018](../decisions/0018-url-redirects-and-migration.md), [0019](../decisions/0019-seo-and-schema-markup.md)).

## Exit criteria

- The three public forms (contact, custom-design, repair) validate client-side via Zod + RHF + shadcn `<Form>` with field-level error display, and re-validate server-side against the **same** Zod schema inside their Server Actions.
- A valid submission sends a formatted Resend notification email to the env-configured studio inbox (verified against Resend's sandbox / a dev-verified domain) and shows the user a success state; an invalid submission shows field-level errors and sends nothing.
- The honeypot field and the per-IP rate limit reject bot/abusive submissions without sending email.
- No submission is written to the database (email-only per [ADR-0010](../decisions/0010-form-submission-and-transactional-email.md)).
- Each form page renders cleanly at mobile (375px), tablet (768px), and desktop (1280px).
- `pnpm check` and `pnpm test:e2e` pass locally and in CI, including unit coverage of each form's Zod schema (valid + invalid cases) and the spam-protection helpers, and an E2E happy-path submission with the Resend send mocked/stubbed. No console errors in the production build.

## Tasks

<!-- generated by `pnpm gen:tracker`; do not edit manually -->

| ID | Title | Status | Depends on |
| -- | ----- | ------ | ---------- |
| 01-submission-pipeline | Submission pipeline & contact form | todo | — |
| 02-inquiry-forms | Inquiry forms | todo | 01-submission-pipeline |

<!-- end generated -->

## Phase resolution

_Appended when all task exit criteria are met and the phase's own exit criteria
are verified. One short paragraph; per-task narrative lives in the individual
task files' `Resolution` sections._
