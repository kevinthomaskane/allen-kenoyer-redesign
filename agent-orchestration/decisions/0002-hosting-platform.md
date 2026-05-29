# ADR-0002: Hosting platform

- **Status:** Accepted
- **Date:** 2026-05-19
- **Deciders:** Kevin Kane

## Context

[ADR-0001](./0001-frontend-framework.md) locked Next.js (App Router) as the framework, which constrains the hosting space to platforms that support Next.js's serverless functions, ISR, image optimization, and middleware. The site is largely static, but the admin dashboard and ISR for class/bulletin content both require a host with a real Node-compatible runtime — pure-static hosts are out.

Audience and operational constraints:
- Studio is in Lawndale, CA. The admin user (Kristin) and the primary visitor audience are in greater Los Angeles. Function region should reflect this where it's free to do so.
- 10xDev (Kevin) is the sole developer and operator post-launch. Hosting needs to fit how 10xDev already runs client work.
- The client is non-technical; any operational complexity (account setup, billing, deploy) lands on 10xDev.

## Options considered

### Option A — Vercel
The Next.js company's own platform. First-party support for every Next.js feature (App Router, RSC, Server Actions, ISR, on-demand revalidation, `next/image`, middleware, edge runtime). Zero-config deployment from Git. Preview deployments per branch/PR. Pro plan covers commercial use, Speed Insights, Web Analytics, Edge Config, and longer function execution.

### Option B — Cloudflare Pages (with Next.js adapter)
Cheaper at scale, generous free tier, global edge runtime. Tradeoff: requires the `@cloudflare/next-on-pages` adapter; not all Next.js features map cleanly (Node-specific APIs, image optimization, ISR semantics differ); ongoing compatibility drift as Next.js evolves.

### Option C — Netlify
Comparable feature set to Vercel for Next.js, with their own adapter and Edge Functions. Mature platform. Tradeoff: Next.js support is second-class compared to Vercel; historically lags on new Next.js feature support; less natural fit.

### Option D — Self-hosted Node (VPS, Fly.io, Render, etc.)
Maximum control, no platform lock-in. Tradeoff: ops burden falls entirely on 10xDev — TLS, scaling, deploy pipelines, image optimization infrastructure, log aggregation — for a site whose total complexity does not justify that overhead.

## Decision

**Vercel (Pro plan), function region pinned to `sfo1`, project owned by the 10xDev Vercel team, preview deployments public.**

This ADR bundles five tightly-coupled hosting calls:

1. **Platform:** Vercel.
2. **Plan tier:** Pro (Kevin's existing 10xDev account).
3. **Ownership:** Vercel project lives under the 10xDev team; billing flows through 10xDev.
4. **Function region:** `sfo1` (San Francisco) — closest Vercel region to the LA audience and to the admin user.
5. **Preview deployments:** Public (default). Vercel's automatic `X-Robots-Tag: noindex` header is sufficient SEO protection for pre-launch work.

## Rationale

- **Vercel is the natural pairing with Next.js**, building on [ADR-0001](./0001-frontend-framework.md). First-party support eliminates adapter friction and keeps the option space wide for downstream ADRs (image optimization, ISR strategy, edge config, etc.).
- **10xDev-owned project** matches how Kevin runs client work; no need to onboard a non-technical client through Vercel signup and billing.
- **Pro plan** is already in place on the 10xDev account; no incremental project-level cost. Pro is also the minimum tier for commercial use under Vercel's ToS.
- **`sfo1` function region** is a free latency win for the LA-based admin and audience (~15ms vs ~70ms for the default `iad1`). Static pages are served from Vercel's global edge regardless.
- **Public previews** with `noindex` headers are the lowest-friction posture for sharing WIP with the client. Password protection's added friction was not worth it for this engagement.

## Tradeoffs accepted

- **10xDev ownership creates a handoff dependency.** If the client ever moves to another developer, the Vercel project must be transferred and billing reassigned. Acceptable because the maintenance posture assumes 10xDev is the long-term operator.
- **Vercel ecosystem coupling beyond Next.js.** Future use of Vercel-managed storage (Postgres, KV, Blob) would deepen this; non-Vercel hosting would require migrating those too. Each storage decision will be made on its own merits in subsequent ADRs.
- **Preview URLs are derivable from branch names.** A determined visitor could find them. `noindex` prevents SEO leakage but not human curiosity. Acceptable for a marketing-site rebuild with no sensitive pre-launch content.
- **Pro plan is a fixed 10xDev overhead**, not a per-project cost, but worth noting in client-billing math.

## Related decisions

- Depends on: [ADR-0001](./0001-frontend-framework.md) (Next.js constrains the hosting space).
- Influences: Image pipeline & storage (Vercel image optimization is the default), Database (Vercel Postgres is now in the option space), Authentication (Vercel KV / Edge Config affect session strategy), Analytics & monitoring (Vercel Speed Insights / Web Analytics are now first-party options).
