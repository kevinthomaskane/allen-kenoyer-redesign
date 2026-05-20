# Allen Kenoyer Glass — rebuild

WordPress-to-custom rebuild for Allen Kenoyer Glass (Lawndale, CA stained glass studio). Public marketing site plus an authenticated admin/CMS surface for the studio manager. No e-commerce, no online class registration.

## Stack

- **Framework:** Next.js 16 (App Router) + React 19 + TypeScript ([ADR-0001](./docs/decisions/0001-frontend-framework.md))
- **Hosting:** Vercel — region `sfo1` ([ADR-0002](./docs/decisions/0002-hosting-platform.md))
- **Package manager / runtime:** pnpm 11 on Node 24 LTS ([ADR-0003](./docs/decisions/0003-package-manager-and-node-version.md))
- **Styling:** Tailwind v4 + shadcn/ui ([ADR-0008](./docs/decisions/0008-styling-and-ui-layer.md))
- **Tests:** Vitest + Playwright ([ADR-0013](./docs/decisions/0013-testing-strategy.md))
- **Lint/format:** ESLint 9 + Prettier ([ADR-0014](./docs/decisions/0014-linting-and-formatting.md))

The full decision log lives in [`docs/decisions/`](./docs/decisions/). The phased build plan is in [`docs/implementation-plan.md`](./docs/implementation-plan.md).

## Prerequisites

- Node `24.15.0` (pinned in `.nvmrc`). Use nvm: `nvm use`.
- pnpm `11.1.3` (pinned in `package.json` `packageManager`). Activate via corepack: `corepack enable && corepack prepare pnpm@11.1.3 --activate`.

## Getting started

```bash
pnpm install
pnpm dev
```

App runs at `http://localhost:3000`.

## Scripts

| Command             | What it does                                     |
| ------------------- | ------------------------------------------------ |
| `pnpm dev`          | Start the Next.js dev server (Turbopack).        |
| `pnpm build`        | Production build.                                |
| `pnpm start`        | Run the production build locally.                |
| `pnpm lint`         | ESLint over the project.                         |
| `pnpm format`       | Run Prettier in write mode.                      |
| `pnpm format:check` | Run Prettier in check mode (used by CI).         |
| `pnpm typecheck`    | `tsc --noEmit` — type-check without emitting JS. |
| `pnpm test`         | Run Vitest unit tests once.                      |
| `pnpm test:watch`   | Run Vitest in watch mode.                        |
| `pnpm test:e2e`     | Run Playwright E2E tests.                        |

For local E2E: `pnpm exec playwright install` once to download browser binaries.

## Environment variables

Copy `.env.example` to `.env.local` and fill in values. `.env.local` is git-ignored. Phase 0 has no required env vars yet.

## Project layout

```
src/
  app/        # Next.js App Router pages, layouts, route handlers
  lib/        # Shared utilities (cn helper, etc.)
  components/ # UI primitives (added via `pnpm dlx shadcn@latest add <name>`)
e2e/          # Playwright tests
public/       # Static assets served at /
docs/         # ADRs, implementation plan, content extraction notes
demo/         # Original styled redesign pitch — design reference, will be removed once Phase 1 codifies its style patterns
scripts/      # Standalone migration scripts (content extraction); own package.json
content/      # Extracted legacy WordPress content (markdown), input to Phase 1/2 content migration
```

## Design tokens & styling

All colors and radii flow through Tailwind tokens defined in `src/app/globals.css`. **No hex literals anywhere in JSX, CSS modules, or inline styles** — use Tailwind utilities (`bg-primary`, `text-muted-foreground`, `border-accent-gold`, etc.). If a color is needed that isn't tokenized, add the token first.
