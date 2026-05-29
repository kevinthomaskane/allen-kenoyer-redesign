# CLAUDE.md

Root context for Claude Code, loaded every session. Everything else loads on
demand — pull each doc when its trigger fires:

- **Assigned a task** ("do task `02-admin-auth`") → read
  [`agent-protocol.md`](./agent-orchestration/agent-protocol.md) and follow it;
  it owns the read-order, status transitions, and completion contract (and
  routes you on to the phase README, task file, and cited ADRs).
- **Need orientation** beyond this file — what's shipped, the phase roadmap, the
  data model → [`project-overview.md`](./agent-orchestration/project-overview.md).
- **Writing code** → [`dev-guide.md`](./agent-orchestration/dev-guide.md) for
  conventions (design tokens, motion, icons, import boundaries, naming).
- **Making or citing a hard-to-reverse decision** →
  [`decisions/`](./agent-orchestration/decisions/), the ADR log. Each ADR reads
  as the current decision; changing one is Kevin's call, applied in place.

## What this project is

WordPress-to-custom rebuild for **Allen Kenoyer Glass** (Lawndale, CA stained-glass studio). Public marketing site + authenticated admin/CMS for the studio manager (Kristin). **Locked scope:** no e-commerce, no online class registration. Frontend largely static; the admin dashboard is the primary dynamic surface and the core feature.

## Current state

Development is scoped into sequential phased builds — don't start a phase until
the prior phase's exit criteria are met. For progress and current state, see
[`project-overview.md`](./agent-orchestration/project-overview.md).

## Commands

All scripts live in [`package.json`](./package.json) — run them with `pnpm <script>`
rather than invoking the underlying tools (`eslint`, `prettier`, `tsc`, …)
directly. The pre-push gate is `pnpm check` (mirrors CI; see Hard rules).

Single Vitest test: `pnpm vitest run path/to/file.test.ts -t "test name pattern"`.

## Project layout

```
src/
  app/        # Next.js App Router pages, layouts, route handlers
  lib/        # Shared utilities (cn helper, patterns.ts, etc.)
  components/ # UI primitives (add via `pnpm dlx shadcn@latest add <name>`)
e2e/          # Playwright tests
public/       # Static assets served at /

# Excluded from the Vercel build, not importable from src/, and Prettier-ignored (see Hard rules):
agent-orchestration/  # Agent execution layer: project-overview, agent-protocol, phase docs, task files, dev-guide, ADRs
docs/                 # Stakeholder + one-off: for-kristin/, notes/, website-outline.md, parallel-claude-sessions.md
scripts/              # Migration + tooling scripts; own package.json
content/              # Extracted legacy WordPress content; input to migration, not served at runtime
demo/                 # Original styled redesign pitch — design reference
.agents/              # Installed agent skills (supabase, supabase-postgres-best-practices)
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

Apply on every task:

- **Run `pnpm check` locally before every `git push`.** Mirrors CI; passing locally avoids the failure-then-hotfix loop.
- **No imports into `src/` from `content/`, `scripts/`, `docs/`, `agent-orchestration/`, `demo/`, or `.agents/`.** All are `.vercelignore`'d — the production build fails. See [dev-guide § Import boundaries](./agent-orchestration/dev-guide.md).

## ADR workflow

Each ADR in [`agent-orchestration/decisions/`](./agent-orchestration/decisions/) reads as the **current** decision — no amendment log, no superseding files. When a decision changes, edit the ADR in place so it states the new truth; the prior version lives in git history. Changing a decision is **Kevin's call** — an agent edits an ADR only to reflect a decision Kevin has approved, never to change one unilaterally (per [`agent-protocol.md`](./agent-orchestration/agent-protocol.md)'s escalation rule).

When to write an ADR vs. a dev-guide entry: if reversing the decision touches many files and rewrites other decisions → ADR; otherwise dev-guide (add the section in the same PR per dev-guide's authoring rule). Delineation in [`agent-orchestration/decisions/README.md`](./agent-orchestration/decisions/README.md).
