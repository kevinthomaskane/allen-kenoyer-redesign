# ADR-0010: Form submission & transactional email

- **Status:** Accepted
- **Date:** 2026-05-19
- **Deciders:** Kevin Kane

## Context

Two distinct outbound-email needs in this project share infrastructure:

1. **Public form submissions** — contact form, custom-design inquiry, repair inquiry, newsletter signup. All deliver a notification email to the studio inbox.
2. **Supabase Auth transactional emails** — invite email when seeding an admin user, password reset emails for [ADR-0006](./0006-authentication.md). These exist regardless of public-form decisions; Supabase's default SMTP is rate-limited and not suitable for production.

Because both use cases need the same transactional email service, we bundle them in one ADR.

[ADR-0009](./0009-forms-and-validation.md) established that form layer (Zod + RHF + shadcn `<Form>`). This ADR picks up at the submit handler.

## Options considered

### Public form submission pattern
- **Server Actions + transactional email** — form POSTs to a Next.js Server Action, which validates with Zod, then sends a formatted email via a chosen transactional email service.
- **Third-party form service (Formspree, Tally, Basin)** — form POSTs to a vendor endpoint, vendor handles delivery and a dashboard. Doesn't address the Supabase Auth email need.

### Transactional email provider
- **Resend** — modern Next.js default; clean SDK; React Email integration for templates; free tier 3K emails/month.
- **Postmark** — strongest deliverability reputation; no free tier (~$15/mo).
- **AWS SES** — cheapest at scale; high setup overhead.
- **SendGrid** — enterprise-grade but less idiomatic in modern Next.js work.
- **Loops** — marketing-email focused.

### Submission persistence
- **Email-only** — no DB record; submission triggers email and ends. Matches [ADR-0004](./0004-admin-dashboard-architecture.md) admin scope (only classes + bulletin are admin-managed).
- **Email + silent DB persistence** — submissions also written to a `form_submissions` table for audit/recovery; no admin UI to browse.
- **Email + DB + admin browsing UI** — expands admin scope (third managed content type); requires amending [ADR-0004](./0004-admin-dashboard-architecture.md).

## Decision

Three bundled calls:

1. **Public form submission pattern:** Server Actions + transactional email. Public forms POST to feature-local Server Actions that validate against the form's Zod schema and call the email service on success.
2. **Transactional email provider:** Resend (current latest SDK: `resend@6.12.3`). Email templates authored with React Email (`react-email@6.1.5`, `@react-email/components@1.0.12`).
3. **Submission persistence:** Email-only. No `form_submissions` table, no DB write on submit.

**Supabase Auth integration:** Supabase Auth's SMTP settings are configured to send via Resend's SMTP endpoint, so all auth emails (invites, password resets) flow through the same provider with consistent deliverability characteristics and the studio's verified sending domain.

**Sending domain:** `allenkenoyerglass.com` — DNS records (SPF, DKIM, DMARC) configured to authorize Resend as a sender. Specific DNS configuration is dev-guide level.

**Spam protection:** Honeypot field + server-side rate limiting per IP on public form Server Actions. Specific implementation (Vercel Edge Config, Upstash, etc.) is dev-guide level; this ADR records only that the protection layer exists.

## Rationale

- **Server Actions + Resend** is the conventional pattern in this stack. The form submission validates against the same Zod schema the client form uses ([ADR-0009](./0009-forms-and-validation.md)), and the email service is incrementally free because we needed one for Supabase Auth regardless.
- **Resend** is the modern Next.js default with the cleanest SDK ergonomics, comfortable free-tier headroom for this project (3K emails/month against an expected volume of perhaps 50-100/month), and React Email integration for HTML email templates that compose like the rest of the UI.
- **Email-only persistence** matches [ADR-0004](./0004-admin-dashboard-architecture.md)'s locked admin scope. Kristin's workflow is read-the-email-and-reply, not log-into-a-dashboard-and-triage. Adding a submissions table would either be dead code (no UI to browse it) or a scope expansion.
- **Single provider for both surfaces** keeps DKIM/SPF/DMARC configuration simple and avoids two billing relationships.

## Tradeoffs accepted

- **Email delivery is now a single point of failure** for both public-form notifications and admin password recovery. If Resend has an outage, both flows break. Acceptable given Resend's track record and the low-stakes nature of the use case; the silent-DB-persistence option would mitigate the form-side risk if it ever becomes a problem.
- **No long-term audit trail of public-form submissions** beyond the studio's email inbox. If Kristin deletes the email, the submission is gone. Acceptable for a small studio; if compliance ever requires retention, revisit.
- **DNS-level sender authentication is a setup prerequisite.** SPF/DKIM/DMARC records must be in place for `allenkenoyerglass.com` before any email will land in inboxes reliably. Acceptable; one-time setup.
- **Coupling to Resend.** Switching providers requires updating SDK calls and re-configuring DNS. Manageable; the email service is a thin shim and email templates are portable React Email components.
- **Server Actions for all public forms means every submit pays the function cold-start cost** when traffic is sparse. Acceptable at this scale.

## Related decisions

- Depends on: [ADR-0001](./0001-frontend-framework.md) (Server Actions are an App Router primitive), [ADR-0006](./0006-authentication.md) (Supabase Auth uses this provider for outbound mail), [ADR-0009](./0009-forms-and-validation.md) (Server Action handlers validate against the form's Zod schema).
- Influences: Newsletter ESP integration ([ADR-0011 pending](#)) — if newsletter signup writes to an ESP rather than to Resend, the public-form-submission pattern still applies but with a different downstream destination. Spam-protection implementation (dev guide).
