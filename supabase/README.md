# supabase/

Repo-side record of the database schema. **These SQL files mirror what has been
applied to the remote Supabase project (`allen-kenoyer-glass`,
`lgbeihhbkwnxykaaebbj`) — they are a reviewable history, not a CLI-driven
pipeline.**

## Workflow (MCP-direct)

Per [ADR-0005](../agent-orchestration/decisions/0005-database-and-query-layer.md),
schema changes are applied through the **Supabase MCP connector**, not the
Supabase CLI:

- **Develop / iterate:** `execute_sql` against the project.
- **Commit a change:** `apply_migration` (records a versioned entry in the
  project's migration history) — then mirror the exact SQL into a
  `migrations/<version>_<name>.sql` file here so the repo has the record.
- **After DDL:** run `get_advisors` and fix or document findings.
- **Types:** regenerate via the connector and commit to
  [`src/types/database.ts`](../src/types/database.ts) (see dev-guide §
  Type discipline).

There is no `supabase/config.toml`, no `db push`, and no GitHub Action — the CLI
workflow ADR-0005 originally described was never adopted; the ADR records the
MCP-direct approach as the current decision.

`migrations/` filenames use the `<version>_<name>` stamp the connector assigns,
so this directory stays orderable and matches `list_migrations` output.
