# ADR-0001: Frontend framework

- **Status:** Accepted
- **Date:** 2026-05-19
- **Deciders:** Kevin Kane

## Context

The Allen Kenoyer Glass rebuild is a content-heavy informational site (~20 marketing pages plus pattern and portfolio catalogs) paired with a self-service admin dashboard for the studio manager to manage classes and bulletin posts. Per locked scope (see [`README.md`](./README.md)), there is **no e-commerce and no online class registration** — the frontend is largely static, and the dynamic surface area is limited to admin-managed content and lead-capture forms.

Constraints that bear on this decision:
- **SEO is the business case.** Local search, schema markup, fast LCP, crawlable HTML, and Core Web Vitals all matter.
- **Image-heavy.** 165+ pattern thumbnails across four catalogs, plus portfolio and custom-work galleries. The framework's image pipeline directly affects build cost and runtime performance.
- **Mixed render needs.** Most pages are static (SSG). Class listings and the bulletin board change as Kristin edits them and want to update without a redeploy (ISR or on-demand revalidation).
- **Admin dashboard lives in the same app.** Auth-gated routes, form mutations, and CRUD against a database — patterns that the framework's data layer should support cleanly.
- **Single-developer maintenance.** Whatever ecosystem we pick has to be supportable by one person (Kevin/10xDev) long after launch.

## Options considered

### Option A — Next.js (App Router)
React-based meta-framework, current latest stable `16.2.6`. Strongest ecosystem in this category. Built-in image optimization (`next/image`), first-class SSG + ISR + on-demand revalidation, Server Components and Server Actions for the admin dashboard's data-mutation patterns, route handlers for form endpoints. Mature deployment story on Vercel and self-host options via standalone output. Tradeoff: App Router complexity (server vs. client component boundaries, caching model) is a learning surface even for experienced React devs.

### Option B — Astro
Content-first framework with islands architecture. Excels at static marketing sites and is arguably *better* than Next.js for the public-facing ~20 pages. Native MDX, fewer JS bytes shipped by default, simpler mental model. Tradeoff: the admin dashboard is the weak point — Astro is not designed for app-style auth-gated CRUD UIs and would likely need a separate framework or a heavy React island, splitting the codebase.

### Option C — Remix / React Router 7
React-based, strong story for forms and data mutations (admin dashboard pattern). Web-standards-first approach. Tradeoff: image optimization and ISR-equivalent patterns are less batteries-included than Next.js; smaller ecosystem of integrations (CMS adapters, deployment targets); single-developer support burden is slightly higher.

### Option D — SvelteKit
Comparable feature set to Next.js with a smaller, lighter runtime. Excellent DX. Tradeoff: smaller ecosystem of third-party UI/admin components; smaller hiring pool if the project ever needs another developer; team's React fluency doesn't transfer.

### Option E — Vite + React (no meta-framework)
Maximum control, minimum magic. Tradeoff: SSG, ISR, image optimization, routing, and SEO-critical SSR/streaming all have to be wired up by hand. For a content+admin site of this size, the reinvention cost is large with no obvious payoff.

## Decision

**Next.js (App Router) with TypeScript, current latest stable `16.2.6`.**

This single ADR bundles three closely-coupled choices made together:
1. **Framework:** Next.js
2. **Router:** App Router (not Pages Router)
3. **Language:** TypeScript

## Rationale

- **Primary maintainer's framework of choice.** Kevin (10xDev) works in Next.js daily; long-term single-developer maintainability is the dominant factor on a client handoff project of this size. Picking the stack the maintainer is fastest in beats picking a marginally-better-fit stack he'd have to ramp up on.
- **Site is largely SSG**, per locked scope. SSG is Next.js's strongest render mode, and `next/image` handles the pattern catalog + portfolio image volume without a separate CDN decision.
- **Vercel is the preferred hosting target** (to be formalized in the Hosting ADR). Next.js + Vercel is the most natural pairing and removes integration friction across image optimization, ISR, and deployment.
- **App Router specifically**, because it is the standard for new Next.js work since v13, is required for several current and future framework features, and matches Kevin's existing patterns.
- **TypeScript** for static typing across the admin dashboard's data layer (forms, API contracts with the database) where runtime errors would be costly and silent.

## Tradeoffs accepted

- **Ecosystem coupling to Next.js / Vercel.** A future move to a different host requires a serverless adapter or self-hosted Node deployment; pure-static hosts are off the table.
- **Heavier static output than a static-only stack.** Astro in particular would ship fewer JS bytes for the marketing pages in isolation; we accept this to keep the admin dashboard in the same codebase and the same mental model.
- **Yearly Next.js majors with breaking changes.** Ongoing minor upgrade work is part of the maintenance cost.
- **App Router caching/rendering model has a documented learning surface.** Marginal cost here because Kevin already works in it daily; flagged for any future contributor.

## Related decisions

- Influences: Hosting platform, Image pipeline, Styling approach, Admin/CMS architecture, Authentication, Form submission, SEO/schema approach — most subsequent ADRs.
- Depends on: none.
