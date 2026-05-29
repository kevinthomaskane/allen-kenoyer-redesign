# CLAUDE.md

Guidance for Claude Code when working with this repo. Substantive project context lives in [`agent-orchestration/project-overview.md`](./agent-orchestration/project-overview.md); per-task instructions in [`agent-orchestration/agent-protocol.md`](./agent-orchestration/agent-protocol.md); conventions in [`agent-orchestration/dev-guide.md`](./agent-orchestration/dev-guide.md).

## What this project is

WordPress-to-custom rebuild for **Allen Kenoyer Glass** (Lawndale, CA stained-glass studio). Public marketing site + authenticated admin/CMS for the studio manager (Kristin). **Locked scope:** no e-commerce, no online class registration. Frontend largely static; the admin dashboard is the one dynamic surface and the core feature.

## Working on an assigned task

When Kevin assigns you a task (e.g., "do task `01-admin-auth`"), read [`agent-orchestration/agent-protocol.md`](./agent-orchestration/agent-protocol.md) and follow it — it owns dep verification, citation reads, status transitions, completion, escalation. For broader project context, read [`agent-orchestration/project-overview.md`](./agent-orchestration/project-overview.md).

## Current state

- Phase 0 (Foundation) ✓ shipped 2026-05-20
- Phase 1 (Public Marketing Site) ✓ shipped 2026-05-26
- Phases 2–4 not started

Phased execution is sequential by default; don't start Phase N+1 until Phase N's exit criteria are met. Status table + summaries: [`project-overview.md`](./agent-orchestration/project-overview.md).

## Commands

```bash
pnpm dev               # Next.js dev server (Turbopack)
pnpm build             # Production build
pnpm lint              # ESLint
pnpm format            # Prettier --write
pnpm format:check      # Prettier --check (CI uses this)
pnpm typecheck         # tsc --noEmit
pnpm test              # Vitest run
pnpm test:watch        # Vitest watch
pnpm test:e2e          # Playwright E2E
pnpm check             # lint + format:check + typecheck + vitest (mirrors CI)
pnpm check:e2e         # pnpm check + Playwright
pnpm migrate:images    # Idempotent re-run of non-pattern image migration
pnpm migrate:patterns  # Idempotent re-run of pattern image migration
pnpm gen:tracker       # Regenerate phase task trackers from task-file frontmatter
```

Single Vitest test: `pnpm vitest run path/to/file.test.ts -t "test name pattern"`. Local E2E needs `pnpm exec playwright install` once.

## Project layout

```
src/
  app/        # Next.js App Router pages, layouts, route handlers
  lib/        # Shared utilities (cn helper, patterns.ts, etc.)
  components/ # UI primitives (add via `pnpm dlx shadcn@latest add <name>`)
e2e/                  # Playwright tests
public/               # Static assets served at /
agent-orchestration/  # Agent execution layer: project-overview, agent-protocol, phase docs, task files, dev-guide, ADRs
docs/                 # Stakeholder + one-off: for-kristin/, notes/, website-outline.md, parallel-claude-sessions.md
scripts/              # Migration + tooling scripts. Own package.json.
content/              # Extracted legacy WP content. Input to migration; not served at runtime; vercelignored.
demo/                 # Original styled redesign pitch — design reference; vercelignored.
```

## Tech stack

- Next.js 16 App Router + React 19 + TypeScript ([ADR-0001](./agent-orchestration/decisions/0001-frontend-framework.md))
- Vercel Pro, 10xDev team, `sfo1` ([ADR-0002](./agent-orchestration/decisions/0002-hosting-platform.md))
- pnpm 11 + Node 24 LTS ([ADR-0003](./agent-orchestration/decisions/0003-package-manager-and-node-version.md))
- Supabase Pro — Postgres + Auth + Storage ([ADRs 0005](./agent-orchestration/decisions/0005-database-and-query-layer.md), [0006](./agent-orchestration/decisions/0006-authentication.md), [0007](./agent-orchestration/decisions/0007-image-pipeline-and-storage.md))
- Tailwind v4 + shadcn/ui, light-mode-only ([ADR-0008](./agent-orchestration/decisions/0008-styling-and-ui-layer.md))
- Zod + React Hook Form + shadcn `<Form>` ([ADR-0009](./agent-orchestration/decisions/0009-forms-and-validation.md)); Server Actions + Resend ([ADR-0010](./agent-orchestration/decisions/0010-form-submission-and-transactional-email.md))
- Vitest + Playwright, CI-gated ([ADR-0013](./agent-orchestration/decisions/0013-testing-strategy.md))
- ESLint 9 + Prettier ([ADR-0014](./agent-orchestration/decisions/0014-linting-and-formatting.md))

## Hard rules

Apply on every task regardless of dev-guide section relevance:

- **Run `pnpm check` locally before every `git push`.** Mirrors CI; passing locally avoids the failure-then-hotfix loop.
- **All colors flow through Tailwind tokens.** No hex/rgb literals, no inline `style={{ color: ... }}`. See [dev-guide § Design tokens & styling](./agent-orchestration/dev-guide.md).
- **No imports into `src/` from `content/`, `scripts/`, `docs/`, `agent-orchestration/`, `demo/`, or `.agents/`.** All are `.vercelignore`'d — the production build fails. See [dev-guide § Import boundaries](./agent-orchestration/dev-guide.md).
- **Secrets:** `.env.local` is git-ignored. The Supabase secret key (`sb_secret_...`) lives only there — never in Vercel, never prefixed `NEXT_PUBLIC_`. The publishable key (`sb_publishable_...`) is client-safe and goes in Vercel.

## ADR workflow

ADRs in [`agent-orchestration/decisions/`](./agent-orchestration/decisions/) are immutable once Accepted. To change a decision, add `### Amendment YYYY-MM-DD — <title>` at the bottom of the ADR plus italic forward pointers from each affected section. Always read the bottom of an ADR before quoting it.

When to write an ADR vs. a dev-guide entry: if reversing the decision touches many files and rewrites other decisions → ADR; otherwise dev-guide (add the section in the same PR per dev-guide's authoring rule). Delineation in [`agent-orchestration/decisions/README.md`](./agent-orchestration/decisions/README.md).

## Supabase tooling

Skills installed at `.agents/skills/supabase` and `.agents/skills/supabase-postgres-best-practices`. Invoke before first Supabase API use per session — they capture RLS gotchas (Storage upsert needs INSERT + SELECT + UPDATE; views bypass RLS unless `security_invoker = true`; `TO authenticated` alone is BOLA/IDOR) absent from training data.

Use Supabase MCP `execute_sql` for iterative schema work, `apply_migration` to commit stable changes, `get_advisors` after DDL. No Storage MCP tools — bucket creation is via SQL (`storage.buckets` is a regular table); uploads via local Node scripts using `@supabase/supabase-js`.

## Tool ignore-list scope

Prettier ignores `docs/`, `agent-orchestration/`, `demo/`, `content/`, `scripts/`, `.agents/`. ESLint runs across `src/` and `e2e/`.
