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
4. **Migration tooling:** Supabase CLI, with migration SQL files committed to the repo at `supabase/migrations/`.

**Authoring workflow (4a):** Hand-written SQL for one-liners; `supabase db diff -f <name>` against a local `supabase start` instance for non-trivial schema changes. Both are acceptable and used as needed.

**Deployment workflow (4b):** Local-manual `supabase db push` as the primary path (Kevin runs it before deploying), with a **GitHub Action backstop** that runs `supabase db push --linked` on merge to `main`. The two are complementary: local-manual gives the human gate; the Action ensures nothing is forgotten if a migration lands in `main` without a local push.

**Coordination guardrail:** Per Supabase's documented warning, concurrent pushes from different sources can race. Since this project has a single developer, the practical rule is *run `db push` locally before merging, then let the Action no-op on the now-applied migration.* If the team ever grows, revisit.

**TypeScript types:** Run `supabase gen types typescript --linked --schema=public > src/types/supabase.ts` after schema changes; treat the generated file as a build artifact committed to the repo so the app has accurate types without a generation step on every deploy.

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
- **Concurrent-push race** between local-manual and the GH Action backstop is a real risk if not coordinated. Mitigated by single-developer reality and the documented rule of pushing locally before merging.

## Operational notes (referenced by but not part of this decision)

- **Supabase MCP server** is available as an official Claude connector. Recommended for this project's AI-assisted workflow — gives direct schema/SQL/types tooling without leaving the conversation. Setup is per-developer tooling, not project architecture.
- **Required GitHub secrets** for the deployment Action: `SUPABASE_ACCESS_TOKEN`, `SUPABASE_DB_PASSWORD`, `SUPABASE_PROJECT_ID`. Specific Action YAML lives in the dev guide.

## Related decisions

- Depends on: [ADR-0001](./0001-frontend-framework.md), [ADR-0002](./0002-hosting-platform.md), [ADR-0004](./0004-admin-dashboard-architecture.md).
- Influences: Authentication (Supabase Auth becomes the natural default for [ADR-0006](#) — to be decided separately), Image pipeline & storage (Supabase Storage becomes the natural default for image hosting — to be decided separately), Content modeling — classes / bulletin board (schemas will live in `supabase/migrations/`).
