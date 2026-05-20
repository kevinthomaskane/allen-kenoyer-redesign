# ADR-0019: SEO & schema markup approach

- **Status:** Accepted
- **Date:** 2026-05-20
- **Deciders:** Kevin Kane

## Context

The rebuild preserves the existing site's SEO equity (handled by [ADR-0018](./0018-url-redirects-and-migration.md)) and is an opportunity to materially strengthen it. The studio is a 47-year-old local business in the Greater Los Angeles area with a strong Google review profile and clear entity signals (NAP, hours, social presence, founder/staff). `docs/seo-research.md` enumerates the available signals and proposes a broad menu of structured-data and on-page optimizations.

This ADR locks the *implementation set* — which schema types we actually emit, where they live in code, how the sitemap is generated, the canonical-URL and robots.txt posture, the OG/Twitter image approach, and how we validate the output. The research document is the input; this ADR is the commitment.

Constraints that apply:

- **Locked content set** (per [ADR-0004](./0004-admin-dashboard-architecture.md) and the modeling ADRs): no FAQ page, no About/Team page, no per-product detail pages for supplies, no individual pattern detail pages, no online registration. Schema types that depend on those pages are out of scope.
- **`trailingSlash: true`** ([ADR-0018](./0018-url-redirects-and-migration.md)). All canonical URLs end in `/`.
- **Class visibility rule** ([ADR-0015](./0015-content-modeling-classes.md)): a class is publicly visible only when published AND it has at least one published cohort with at least one upcoming session. Sitemap and structured-data emission both respect this rule.
- **Testing posture** ([ADR-0013](./0013-testing-strategy.md)): Vitest + targeted Playwright, both CI-gated. Schema validation slots into the existing CI flow.

## Options considered

### Schema types to implement
- **LocalBusiness composite** (`[LocalBusiness, ArtGallery, EducationalOrganization]`) — high-value, captures NAP, hours, geo, sameAs, aggregateRating.
- **`Course` per class** — class detail pages emit Course markup.
- **`Event` per cohort/session** — each cohort's sessions emit Event markup.
- **`Person` for staff** — would require an About/Team page that doesn't exist in scope.
- **`Review` per testimonial** — individual testimonial markup beyond the LocalBusiness `aggregateRating`.
- **`Product` per supply** — would require per-supply detail pages that don't exist in scope.
- **`FAQPage`** — would require an FAQ page that isn't in scope.

### JSON-LD authoring approach
- **Hand-rolled helper functions** — `buildLocalBusinessSchema()`, `buildCourseSchema(class)`. No dependencies.
- **`schema-dts` for compile-time types** — TypeScript types for schema.org. Build-time validation, tiny dependency.
- **Higher-level SEO library** (`next-seo` or similar) — opinionated framework for meta + JSON-LD.

### Sitemap source
- **`app/sitemap.ts`** — Next.js App Router convention; function returning entries; queries DB for dynamic routes.
- **Static `public/sitemap.xml`** — hand-written or build-script-generated.
- **`next-sitemap`** library.

### OG / Twitter image strategy
- **Per-page dynamic** — `ImageResponse` API generates per-page OG images at request time.
- **Static + per-page where available** — site-wide fallback, overridden by page-specific images when present.
- **Static site-wide only** — one OG image everywhere.

### robots.txt posture
- **Allow all + block `/admin/*`**.
- **Allow all + block `/admin/*` + `/api/*`**.
- **Allow all, no blocks**.

### Canonical URL policy
- **Self-canonical on every page**.
- **Only on pages with query-string variants**.

### Validation
- **Manual via Google Rich Results Test on a checklist**.
- **Automated CI check** (schema validator in the test suite).
- **Both**.

## Decision

### Structured data (JSON-LD)

Two schema implementations:

1. **LocalBusiness composite** — site-wide on home, contact, and the classes index page. Composite type `[LocalBusiness, ArtGallery, EducationalOrganization]` with the field set per `docs/seo-research.md §10a`: name/alternateName, description, foundingDate, url, telephone, email, full PostalAddress, GeoCoordinates, openingHoursSpecification, priceRange, sameAs (social profiles), hasMap, aggregateRating.
2. **`Course` per class** — emitted on each class detail page. Drawn from the `classes` row (name, description, skill_level, prerequisite) and the parent organization (the studio's LocalBusiness as `provider`). Class detail pages exist for any visible class (per [ADR-0015](./0015-content-modeling-classes.md)).

**Excluded by decision:**
- **No `Event` per cohort.** Course markup alone is sufficient; layering Event adds complexity without proportionate rich-result gain at our scale.
- **No `Person` for staff.** No About/Team page in scope.
- **No per-`Review` markup on testimonials.** The LocalBusiness `aggregateRating` carries the review signal in summary form. Per-Review markup deferred unless we add a dedicated testimonials/reviews page later.
- **No `Product` for supplies.** No per-supply detail pages.
- **No `FAQPage`.** No FAQ page in scope.

### JSON-LD authoring

Hand-rolled helper functions, typed against `schema-dts`. Pattern:

```ts
import type { LocalBusiness, Course, WithContext } from 'schema-dts';

export function buildLocalBusinessSchema(): WithContext<LocalBusiness> { ... }
export function buildCourseSchema(class_: Class): WithContext<Course> { ... }
```

Each page that needs JSON-LD injects it via a `<script type="application/ld+json">` block in the App Router layout/page. No `next-seo` or other higher-level library. The `schema-dts` version is checked at install time per the project's dependency policy.

### Sitemap

Generated by `app/sitemap.ts` (Next.js App Router convention). The function returns:

- **Static routes:** `/`, `/custom-design/`, `/classes/`, `/classes/calendar/`, `/supplies/`, `/supplies/patterns/`, `/supplies/patterns/beginner/`, `/supplies/patterns/intermediate/`, `/supplies/patterns/advanced/`, `/supplies/patterns/mirrors-and-frames/`, `/repairs/`, `/portfolio/`, `/cabinet-doors/`, `/contact/`.
- **Dynamic class detail routes:** one entry per visible class. Visibility is the same rule the public site uses — `class.published === true AND ≥1 published cohort AND ≥1 upcoming session`. Drafts, expired classes, and unpublished cohorts are excluded.
- **Excluded:** `/admin/*`, any preview/dev-only routes.

`lastModified` for class entries derives from the class row's `updated_at`. For static routes, it's the deploy timestamp.

### OG / Twitter images

One static site-wide OG image. No per-page overrides, no dynamic generation. Default Twitter card type is `summary_large_image` using the same image.

The image lives at `/public/og-image.[ext]` (1200×630, per OG spec) and is referenced from the root layout's metadata.

### robots.txt

Generated via `app/robots.ts` (Next.js convention, paralleling `app/sitemap.ts`):

```
User-agent: *
Allow: /
Disallow: /admin/

Sitemap: https://allenkenoyerglass.com/sitemap.xml
```

Admin authentication ([ADR-0006](./0006-authentication.md)) is the real access control; the `Disallow` is a hint to well-behaved crawlers, not a security boundary.

### Canonical URLs

Self-canonical declared on every page via Next.js metadata exports. Every page declares `<link rel="canonical" href="https://allenkenoyerglass.com[path]/">` pointing to itself in the canonical (trailing-slash) form. Reinforces the URL scheme from [ADR-0018](./0018-url-redirects-and-migration.md).

### Per-page meta

Title and description per page authored as per-route `metadata` exports (Next.js App Router convention). Static pages get static metadata; class detail pages get dynamic metadata derived from the class row (name → title, description → description, with site-name suffix).

### Validation

Automated in CI. The Vitest suite includes tests that:

1. Call each schema builder with representative data and assert the returned object validates against the expected schema shape (using `schema-dts` types at compile time + a small set of runtime assertions for required fields).
2. For class pages, render a sample class through the builder and confirm the emitted JSON contains required `Course` fields (name, description, provider).

A pre-launch and post-launch manual check using Google Rich Results Test is part of the migration runbook but not a recurring CI step.

## Rationale

- **Two-schema implementation is the right ROI band for this site.** LocalBusiness composite is the highest-leverage signal a local studio can emit — it directly informs the Knowledge Panel, local-pack ranking, and the Map listing. `Course` per class targets a richer SERP appearance for the class catalog, which is the studio's primary inbound-discovery surface. The other schema types proposed in `docs/seo-research.md` are valuable in principle but each depends on a page that isn't in scope; emitting markup for content that doesn't exist would be cargo-culting.
- **Hand-rolled helpers + `schema-dts`** is the smallest reasonable approach. `schema-dts` is types-only — no runtime cost — and catches typos and structural mistakes at build time. A higher-level SEO library would be larger, more opinionated, and would need to be evaluated for whether it composes cleanly with Next.js App Router metadata. The 2-schema scope doesn't warrant the dependency.
- **`app/sitemap.ts` is the App Router-native pattern.** It runs in the same Node context as Server Components, so querying Supabase for visible classes is a normal database call. No build-time pre-generation step to maintain, no `next-sitemap` config to keep in sync. Class entries automatically reflect the visibility rule from [ADR-0015](./0015-content-modeling-classes.md) — drafts and expired classes never leak into the sitemap.
- **Static site-wide OG image is the simplest choice that doesn't actively hurt.** Dynamic per-page OG images are polished but cost build/runtime complexity and another component to maintain. The studio's social-share volume is low; one well-designed OG image (the storefront or a brand card) covers every page acceptably.
- **Self-canonical on every page** is the defensive default. Combined with `trailingSlash: true`, it reinforces one canonical form for every page and pre-empts ambiguity if a page ever ends up reachable via more than one URL.
- **Automated CI validation** is worth the small upfront cost because schema regressions are silent — a typo in a builder function won't break the page, just the structured-data signal. Catching regressions at PR time is much better than discovering them weeks later via Search Console. The cost is one Vitest file; the upside is a long-running safety net.
- **`Disallow: /admin/`** in robots.txt is a hint, not a control — the admin's actual protection is the Supabase Auth gate from [ADR-0006](./0006-authentication.md). Including it costs nothing and signals correct intent to crawlers.

## Tradeoffs accepted

- **No `Event` markup per cohort.** Class detail pages won't appear as Event-type rich results (calendar entries, "next session" callouts). Acceptable — `Course` carries the relevant educational-content signal, and the studio's enrollment is in-person regardless of how Google presents the class.
- **No per-testimonial Review markup.** The studio's strong review profile is signaled via `aggregateRating` only. Individual review snippets won't appear as separate rich results. Acceptable for now; reversible by adding `Review` schema later if we add a dedicated reviews page.
- **No per-page OG image.** Social shares of class pages won't show the class's image — they'll show the site default. Acceptable; the studio's social distribution is primarily Instagram/Facebook native posts, not link-shares, so the per-page OG payoff is small.
- **No `Person`, `Product`, or `FAQPage` markup.** Each is omitted because the corresponding page isn't in scope. If any of those pages is added later, the corresponding schema is an additive change to this ADR.
- **`app/sitemap.ts` queries Supabase on every request to `/sitemap.xml`.** Acceptable; the route is cached via Next.js's standard mechanisms (revalidation tag tied to class mutations or short-interval ISR), and sitemap requests are rare and bot-driven.
- **CI schema validation increases test runtime.** Marginal — the assertions are unit tests on pure functions, no browser involved.
- **Static OG image must be maintained outside the build.** If the brand or hero treatment changes, the OG image is updated manually. Acceptable for a brand that's been stable for decades.

## Related decisions

- Depends on: [ADR-0001](./0001-frontend-framework.md) (App Router conventions for `app/sitemap.ts`, `app/robots.ts`, per-route `metadata`), [ADR-0013](./0013-testing-strategy.md) (CI test suite hosts the schema validation), [ADR-0015](./0015-content-modeling-classes.md) (Course schema and sitemap entries derive from the class data shape and the visibility rule), [ADR-0018](./0018-url-redirects-and-migration.md) (canonical URLs reinforce the trailingSlash:true scheme).
- Influences: dev-guide line items — the OG image asset (1200×630), the `schema-dts` install, the builder function locations (`lib/schema/*.ts` or similar), the per-route metadata pattern, the Vitest schema-validation test file.
- Document of record: [`docs/seo-research.md`](../seo-research.md) (input research; not normative). This ADR is the implementation commitment.
