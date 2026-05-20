# ADR-0012: Analytics & monitoring

- **Status:** Accepted
- **Date:** 2026-05-19
- **Deciders:** Kevin Kane

## Context

The site needs *some* level of operational visibility — at minimum, traffic data to inform SEO and content decisions. Beyond that, error tracking, performance monitoring, and uptime monitoring are all optional layers that improve operational confidence at varying cost in tooling complexity and client-side weight.

The SEO research (`docs/seo-research.md`) establishes traffic insight as the primary analytics need. The admin dashboard introduces a real surface area where silent client-side bugs would matter, raising the question of dedicated error tracking.

## Options considered

### Web analytics
- **Google Analytics 4 (GA4)** — industry standard, deep Search Console integration, requires cookie consent banner.
- **Vercel Web Analytics** — included in Pro, no cookies, no consent banner, lightweight.
- **Plausible / Fathom** — privacy-friendly third-party, paid.
- **None.**

### Error monitoring
- **Sentry** — full client + server error capture, grouping, source maps. Free tier 5K errors/month.
- **Vercel's built-in error logging** — server-side errors only (Functions, Server Actions, build). No client capture, no grouping.
- **None.**

### Performance monitoring
- **Vercel Speed Insights** — included in Pro, tracks real-user Core Web Vitals.
- **External RUM (Datadog, New Relic, etc.)** — overkill.
- **None.**

### Uptime monitoring
- **External (UptimeRobot, BetterStack)** — independent ping-and-alert, free tiers available.
- **None** — rely on Vercel's status.

## Decision

Minimal monitoring surface. Five bundled calls:

1. **Web analytics:** Vercel Web Analytics (included in Pro). No Google Analytics, no Plausible, no other web analytics service.
2. **Error monitoring:** Vercel's built-in server-side error logging only. No Sentry, no client-side error capture service.
3. **Performance monitoring:** None. Vercel Speed Insights is explicitly off.
4. **Cookie consent banner:** Not required — Vercel Web Analytics is cookieless, no other tracking is in use, and CCPA's notice requirements are satisfied without an interactive consent gate.
5. **Uptime monitoring:** None. Rely on Vercel's status page.

## Rationale

- **Vercel Web Analytics over GA4** because GA4's primary advantage (deep Google ecosystem integration) doesn't justify the cookie-consent UX overhead and bundle weight for a small business marketing site. Google Search Console will be set up regardless and covers organic-search insight needs that overlap with GA4. The cookieless / no-banner posture is itself a UX win.
- **Vercel built-in over Sentry** because the project explicitly chose minimal additional tooling. Server-side errors (which are the most consequential for the admin dashboard's data mutations) are captured in Vercel logs. Client-side error capture would be a useful safety net but is not strictly required for a low-traffic site with a single primary admin user; if silent bugs become a real problem, this decision can be revisited.
- **No Speed Insights** because the project is opting for the lightest possible client-side surface. Core Web Vitals will still influence Google rankings; we just won't see real-user telemetry on them. Field data via PageSpeed Insights / Search Console fills the gap for SEO purposes.
- **No external uptime monitoring** because the studio has no SLA requirement and Vercel's own status posture is adequate for a low-stakes marketing site.

## Tradeoffs accepted

- **No client-side error visibility.** A React bug, hydration error, or network failure on a visitor's browser is invisible to us unless someone reports it. Acceptable risk given the site's complexity profile; revisit if the admin dashboard starts showing user-reported issues we can't reproduce.
- **No real-user performance data.** Build-time Lighthouse scores and PageSpeed Insights field data (which Google reports independently) are our only Core Web Vitals signals. Acceptable; we trust standard Next.js performance patterns.
- **Outage detection is delayed.** If Vercel has a partial regional outage that doesn't trip their own status page, we learn about it from a visitor. Acceptable for the volume and stakes.
- **Analytics is shallow.** Vercel Web Analytics gives pageviews, top pages, top referrers, geographic data — but no conversion funnels, no event tracking, no user flows. If SEO content work later needs deeper insights, GA4 (with consent banner) becomes a candidate for a new ADR.
- **No cookie consent banner means no flexibility to add cookied analytics later** without also adding the banner. Acceptable; deliberate choice to keep the public site minimal.

## Related decisions

- Depends on: [ADR-0002](./0002-hosting-platform.md) (Vercel Pro provides Web Analytics).
- Influences: SEO & schema markup approach (Search Console setup becomes the primary organic-traffic signal), nothing else materially.
