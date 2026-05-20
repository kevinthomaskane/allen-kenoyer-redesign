# ADR-0004: Admin dashboard / CMS architecture

- **Status:** Accepted
- **Date:** 2026-05-19
- **Deciders:** Kevin Kane

## Context

Per the locked project scope ([README](./README.md)), the admin dashboard is the core dynamic feature of an otherwise largely-static site. The studio manager must be able to manage time-sensitive content with no developer involvement.

The admin manages exactly two content types:

1. **Classes** — with the field set documented in `current-pages-for-kristin.txt` (name, category, skill level, prerequisite, description, sessions, dates/times, tuition, supply fee, kit fee, max students, published/draft).
2. **Bulletin posts** — title, message, display start/end dates, published/draft. Active bulletins display on the homepage.

No other site content needs to be admin-editable — studio hours, contact info, page copy, portfolio, and the pattern catalog are all developer-managed.

## Options considered

### Option A — Fully custom admin in Next.js
Admin routes at `/admin/*` in the same Next.js app. Server Actions + Zod for mutations, Server Components for list views, custom-built forms and tables. Data lives in our own database (next ADR) and is read by both the admin and the public site.

### Option B — Payload CMS (co-located)
Runs inside the Next.js app, auto-generates a polished admin UI from TypeScript schemas, uses our own database, ships in the same Vercel deploy. Trades implementation time for a dependency to maintain and Payload's UX patterns.

### Option C — Keystatic (git-based co-located CMS)
Content as files in the repo; publish is a commit + redeploy. Disqualified up front because bulletins must appear instantly and class listings change too frequently for a deploy-per-edit workflow.

### Option D — External headless CMS (Sanity, Contentful, Strapi, Directus)
Third-party admin service, Next.js fetches via API. Overkill for two content types and a single admin user; introduces a service to manage with no proportional gain.

## Decision

**Custom-built admin inside the Next.js app.** Specifically:

1. **Approach:** Option A (fully custom). No headless CMS, no Payload, no scaffold library.
2. **Scope:** Two content types only — `Class` and `Bulletin`. Everything else on the site is developer-managed and out of admin scope.
3. **Location:** Admin routes live at `/admin/*` in the same Next.js app as the public site. Same database.
4. **Permission model:** Flat — any authenticated admin user has full CRUD across both content types. No role-based authorization. Likely a single user (Kristin) in practice, but the model is multi-user-capable from the start.
5. **Data flow:** Admin writes to the database via Server Actions. The public site reads from the database via Server Components (with ISR/on-demand revalidation for class and bulletin pages).

## Rationale

- **Scope is too tight to justify a CMS.** Two content types, one admin user, no need for content versioning or branching, no asset management library needed (classes and bulletins are text-only). Pulling in Payload or Sanity for this would be paying maintenance cost on a feature surface we don't use.
- **Custom gives full UX control for a non-technical user.** Kristin's workflow (create a class, set published, post a bulletin with display dates) deserves a tailored interface — generic CMS field editors are usually more confusing than a hand-built form for a 12-field class type.
- **Single codebase, single database, single deploy** is the lowest-operational-overhead posture for a sole maintainer, which matches [ADR-0002](./0002-hosting-platform.md)'s 10xDev-owned hosting model.
- **Flat permission model** matches the studio reality: even if Cyndee or an instructor eventually gets admin access, none of them need restricted permissions. Role-based authz would be over-engineering.
- **Server Actions + Server Components** are the App Router-native primitives ([ADR-0001](./0001-frontend-framework.md)) for exactly this pattern — auth-gated mutations against a database.

## Tradeoffs accepted

- **More upfront dev time** building admin primitives (form components, list tables, draft/publish toggles, validation feedback, image upload UI if it becomes needed) than picking Payload would have required. Recouped over the long tail because we maintain only our own code, not Payload's release cadence.
- **Adding a third content type later means writing UI for it from scratch.** No auto-generated CMS forms to lean on. Acceptable while the content scope stays at two types; if the scope ever grows substantially, revisiting this ADR (or layering on Payload) becomes the right move.
- **Flat permission model cannot easily restrict per-user capabilities** without revising the auth/authz layer. If we ever need "bulletin-only" or "classes-only" users, that's a real change. Acceptable because the studio's organizational structure does not suggest this need.
- **Same-DB read coupling between admin and public site** means schema changes affect both surfaces. Acceptable and arguably correct — they're two views over the same data, not two different systems.

## Related decisions

- Depends on: [ADR-0001](./0001-frontend-framework.md) (App Router and Server Actions enable this pattern), [ADR-0002](./0002-hosting-platform.md) (Vercel deployment supports the admin and public site in one app).
- Influences: Database (must support transactional writes from Server Actions; informs SQL vs document choice), Authentication (single auth concern for `/admin/*`; needs to be flat-multi-user-capable), Styling & UI layer (admin and public site share UI primitives), Forms & validation (Server Actions + Zod is the unified mutation pattern for both surfaces), Content modeling — classes, Content modeling — bulletin board.
