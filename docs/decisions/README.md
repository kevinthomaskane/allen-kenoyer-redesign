# Architecture Decision Log

This directory contains Architecture Decision Records (ADRs) for the Allen Kenoyer Glass website rebuild. Each ADR captures a single significant decision: what we chose, why, what we rejected, and what tradeoffs we accepted.

## How this log works

- One decision per file. Numbered sequentially in the order they are **decided** (not the order they are proposed).
- Decisions are immutable once accepted. If we change our mind, write a new ADR that supersedes the old one, and update the old one's status.
- Use [`TEMPLATE.md`](./TEMPLATE.md) as the starting point for any new ADR.

## Status legend

- **Pending** — On the roadmap, not yet discussed
- **In Discussion** — Actively being decided
- **Accepted** — Decision locked in
- **Superseded by ADR-####** — Replaced by a later decision
- **Deprecated** — No longer relevant

## Decision index

| # | Title | Status |
|---|---|---|
| [0001](./0001-frontend-framework.md) | Frontend framework (Next.js + App Router + TypeScript) | Accepted |
| [0002](./0002-hosting-platform.md) | Hosting platform (Vercel Pro, sfo1, public previews) | Accepted |
| [0003](./0003-package-manager-and-node-version.md) | Package manager & Node version (pnpm + Node 24 LTS) | Accepted |
| [0004](./0004-admin-dashboard-architecture.md) | Admin dashboard / CMS architecture (custom-built in Next.js, classes + bulletins, flat permissions) | Accepted |
| [0005](./0005-database-and-query-layer.md) | Database & query layer (Supabase Postgres + supabase-js + Supabase CLI migrations) | Accepted |
| [0006](./0006-authentication.md) | Authentication (Supabase Auth, email+password, invite-only, custom login UI) | Accepted |
| [0007](./0007-image-pipeline-and-storage.md) | Image pipeline & storage (Supabase Storage + next/image) | Accepted |
| [0008](./0008-styling-and-ui-layer.md) | Styling & UI layer (Tailwind v4 + shadcn/ui, light-only) | Accepted |
| [0009](./0009-forms-and-validation.md) | Forms & validation (Zod + React Hook Form + shadcn `<Form>`) | Accepted |
| [0010](./0010-form-submission-and-transactional-email.md) | Form submission & transactional email (Server Actions + Resend + React Email, email-only) | Accepted |
| [0011](./0011-newsletter-esp-integration.md) | Newsletter ESP integration (Constant Contact, link/embed, no API) | Accepted |
| [0012](./0012-analytics-and-monitoring.md) | Analytics & monitoring (Vercel Web Analytics only, minimal stack) | Accepted |
| [0013](./0013-testing-strategy.md) | Testing strategy (Vitest + targeted Playwright, CI-gated) | Accepted |
| [0014](./0014-linting-and-formatting.md) | Linting & formatting (ESLint + Prettier, CI-gated) | Accepted |
| [0015](./0015-content-modeling-classes.md) | Content modeling — classes (Class + Cohort + CohortSession, hidden until upcoming sessions exist) | Accepted |
| [0016](./0016-content-modeling-bulletin-board.md) | Content modeling — bulletin board (single table, markdown message, inline-only, newest-first) | Accepted |
| [0017](./0017-content-modeling-patterns-catalog.md) | Content modeling — patterns catalog (TS module + static /public images, grid + lightbox, no per-pattern URL) | Accepted |
| [0018](./0018-url-redirects-and-migration.md) | URL redirect & WordPress migration strategy (next.config.ts redirects, trailingSlash: true, 301s, hard cutover) | Accepted |
| [0019](./0019-seo-and-schema-markup.md) | SEO & schema markup approach (LocalBusiness composite + Course per class, schema-dts, app/sitemap.ts, CI validation) | Accepted |
| [0020](./0020-google-calendar-integration.md) | Google Calendar integration (one-way DB → GCal sync, per-session events, service account auth, DB-wins failure handling) | Proposed |
| [0021](./0021-admin-class-workflow-ux.md) | Admin class workflow UX (class-centric IA, dual entry points, `kind` enum, recurring builder + per-row edits) | In Discussion |

ADR numbers (`0001`, `0002`, …) are assigned as each decision is accepted, in chronological order. The Pending list above will shrink as decisions move into their own files; new decisions can be added to it at any time.

### What is NOT an ADR

Small choices that are easy to swap and don't reshape the codebase live in the **development guide** (to be written in Phase 2 of the project roadmap), not here. Examples: icon library, font choices, date utility, ID generation, animation library, individual schema-markup implementations, build-time scripts. If you're not sure whether something deserves an ADR, ask: *"would reversing this require touching many files and rewriting other decisions?"* If yes, it's an ADR; if no, it's a dev-guide line item.

## Project scope (locked)

These are foundational scope decisions established before the ADR process began. They are not ADRs themselves but they constrain every decision below:

- **No e-commerce.** The site does not sell patterns, tool kits, or any product online.
- **No online class registration.** Class signup remains in-person or by phone per studio policy.
- **Frontend is largely static.** Pages are informational; dynamic content is limited to admin-managed classes and bulletin posts.
- **Admin dashboard is the core feature.** The client (studio manager) must be able to manage classes and bulletin posts independently, with no developer involvement.
