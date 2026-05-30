# ADR-0005: Database & query layer

- **Status:** Accepted
- **Date:** 2026-05-19
- **Deciders:** Kevin Kane

## Context

[ADR-0004](./0004-admin-dashboard-architecture.md) requires a database that supports transactional writes from Next.js Server Actions for two content types (`Class`, `Bulletin`), with public-site reads from Server Components. Volume is low and writes are single-actor in practice (one studio admin).

Kevin already has a Supabase Pro plan in use across 10xDev projects, which establishes a strong "use what we already pay for" prior.

## Options considered

### Engine
- **Postgres** — mature, structured, the default modern Next.js pairing, supported by every relevant provider.
- **MySQL** — comparable, less common in the Next.js ecosystem.
- **SQLite (Turso / LibSQL)** — small, cheap, edge-friendly; fine for single-writer at this scale but smaller tooling ecosystem.
- **MongoDB / document store** — overkill for two structured schemas with fixed fields.

### Provider
- **Supabase Pro** — Postgres with Supavisor pooling, built-in auth and storage and realtime if we want them, generous Pro tier already paid for.
- **Vercel Postgres** (Neon-powered) — first-party with Vercel, $20/mo Pro, fewer bundled features.
- **Neon** (direct) — same engine as Vercel Postgres, sometimes cheaper.
- **Self-hosted Postgres** — overkill for this scope.

### Query layer
- **`supabase-js` SDK** — talks to PostgREST (Supabase's auto-generated REST layer on Postgres), bundles auth/storage/realtime clients, integrates with Row-Level Security. Vendor-coupled.
- **Drizzle ORM** — TypeScript-native, schema-as-code, direct Postgres connection, portable.
- **Prisma** — mature ORM, schema in `.prisma` DSL, generated client, requires `prisma generate` on every build, portable.
- **Kysely / raw SQL** — maximum control, more boilerplate.

### Migration tooling
- **Supabase CLI** — `supabase migration new` + `supabase db push`, migrations as SQL files in `supabase/migrations/`, native to the platform.
- **ORM-native migrations** (Prisma `migrate`, Drizzle `drizzle-kit`) — only applicable if we'd picked an ORM.
- **Hand-rolled SQL + ad-hoc apply** — no thanks.

## Decision

This ADR bundles four tightly-coupled calls:

1. **Engine:** Postgres.
2. **Provider:** Supabase Pro (Kevin's existing 10xDev account).
3. **Query layer:** `supabase-js` SDK. No ORM.
4. **Migration tooling:** the **Supabase MCP connector**, with migration SQL mirrored into the repo at `supabase/migrations/`. (The Supabase CLI / `db push` workflow this ADR originally specified was never adopted; this records the approach actually in use as of Phase 2.)

**Authoring workflow (4a):** Iterate with the connector's `execute_sql`; when a change is stable, commit it with `apply_migration`, which records a versioned entry in the project's migration history. No local `supabase start` / `db diff` step.

**Deployment workflow (4b):** Schema is applied directly to the project via `apply_migration` — there is no `db push` and no GitHub Action backstop. The reviewable record is the SQL mirrored into `supabase/migrations/<version>_<name>.sql` (filename matching the connector-assigned version) plus the project's own migration history. After any DDL, run `get_advisors` and fix or document findings.

**Coordination guardrail:** A single developer applies changes from one place (the connector), so there is no concurrent-push race to manage. If the team grows or a CI-driven pipeline becomes warranted, revisit — adopting the CLI `db push` + Action model is a forward option.

**TypeScript types:** Regenerate via the connector after schema changes and commit the result to `src/types/database.ts`; treat the generated file as an artifact committed to the repo so the app has accurate types without a generation step on every deploy.

## Rationale

- **Supabase Pro is already paid for** and has overhead capacity orders of magnitude above what this site will use. Picking a different Postgres provider would mean paying for or operating something incremental for no gain.
- **Postgres is the right engine** for two structured content types with fixed schemas, and is the default Next.js Server Actions target.
- **`supabase-js` over an ORM** is the pragmatic call at this scope: the SDK collapses auth, storage, realtime, and data access into one client; PostgREST handles all CRUD that two simple tables need; Row-Level Security gives us defense-in-depth that ORM patterns require us to enforce in application code. The vendor-coupling tradeoff is acceptable because we are already vendor-coupled to Supabase for the database itself.
- **Supabase CLI migrations** are the platform-native workflow, well-supported, and produce reviewable SQL files in the repo. Choosing them over ORM-native tooling avoids redundant abstractions.
- **Local-manual + GH Action backstop** is the lowest-risk operational posture for a single developer: the human gate catches bad migrations before they land in production, and the Action prevents a "I forgot to push" gap if a migration is merged to main without a local apply.

## Tradeoffs accepted

- **Vendor coupling to Supabase.** Moving off Supabase would require rewriting all data-access code (replacing `supabase-js` with whatever the new provider's idiom is) plus migrating the database. Acceptable because the Pro plan economics and bundled feature surface (auth, storage) make migration unlikely; if it ever happens, the rewrite is bounded because the data model is small.
- **Less query expressiveness than raw SQL or an ORM.** `supabase-js` is PostgREST-shaped, which makes complex joins, window functions, CTEs, and aggregations awkward — they require Postgres RPC functions instead. Acceptable because the two-table data model has no complex queries; revisit if scope grows.
- **No transferable ORM experience accrued.** Earlier in this discussion we considered Prisma specifically for career-skill leverage; choosing `supabase-js` trades that for project-fit. Acceptable per Kevin's call after the comparison.
- **No automated migration pipeline / human-gate Action.** Schema is applied directly via the connector, so no CI step re-applies or verifies migrations on merge. Mitigated by the single-developer reality, the `supabase/migrations/` mirror as the review record, and the `get_advisors` step after each DDL. Revisit if the team or release cadence grows.

## Operational notes (referenced by but not part of this decision)

- **Supabase MCP connector** is the schema/SQL/types tooling for this project (decision point 4) — the official Claude connector; setup is per-developer tooling, not project architecture.
- **Server-side secret:** `SUPABASE_SECRET_KEY` (the modern replacement for the legacy `service_role` JWT) lives only in local `.env.local`, used by server-side scripts (e.g. the image migration). No GitHub Action secrets are required, since there is no migration-deploy Action.

## Related decisions

- Depends on: [ADR-0001](./0001-frontend-framework.md), [ADR-0002](./0002-hosting-platform.md), [ADR-0004](./0004-admin-dashboard-architecture.md).
- Influences: Authentication ([ADR-0006](./0006-authentication.md) — Supabase Auth is the natural pairing), Image pipeline & storage ([ADR-0007](./0007-image-pipeline-and-storage.md) — Supabase Storage is the natural pairing), Content modeling — classes ([ADR-0015](./0015-content-modeling-classes.md)) and bulletin board ([ADR-0016](./0016-content-modeling-bulletin-board.md)) (schemas live in `supabase/migrations/`).
