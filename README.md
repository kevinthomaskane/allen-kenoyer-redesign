# Allen Kenoyer Glass — rebuild

WordPress-to-custom rebuild for Allen Kenoyer Glass (Lawndale, CA stained glass studio). Public marketing site plus an authenticated admin/CMS surface for the studio manager. **Locked scope:** no e-commerce, no online class registration.

## Stack

- **Framework:** Next.js 16 (App Router) + React 19 + TypeScript ([ADR-0001](./docs/decisions/0001-frontend-framework.md))
- **Hosting:** Vercel — region `sfo1`, preview deploys public ([ADR-0002](./docs/decisions/0002-hosting-platform.md))
- **Package manager / runtime:** pnpm 11 on Node 24 LTS ([ADR-0003](./docs/decisions/0003-package-manager-and-node-version.md))
- **Database / auth / storage:** Supabase Pro ([ADRs 0005](./docs/decisions/0005-database-and-query-layer.md), [0006](./docs/decisions/0006-authentication.md), [0007](./docs/decisions/0007-image-pipeline-and-storage.md))
- **Styling:** Tailwind v4 + shadcn/ui, light-mode-only ([ADR-0008](./docs/decisions/0008-styling-and-ui-layer.md))
- **Forms & email:** Zod + React Hook Form + shadcn `<Form>`, submitted via Server Actions + Resend ([ADRs 0009](./docs/decisions/0009-forms-and-validation.md), [0010](./docs/decisions/0010-form-submission-and-transactional-email.md))
- **Tests:** Vitest + Playwright ([ADR-0013](./docs/decisions/0013-testing-strategy.md))
- **Lint / format:** ESLint 9 + Prettier ([ADR-0014](./docs/decisions/0014-linting-and-formatting.md))

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

| Command             | What it does                                                                                       |
| ------------------- | -------------------------------------------------------------------------------------------------- |
| `pnpm dev`          | Start the Next.js dev server (Turbopack).                                                          |
| `pnpm build`        | Production build.                                                                                  |
| `pnpm start`        | Run the production build locally.                                                                  |
| `pnpm lint`         | ESLint over the project.                                                                           |
| `pnpm format`       | Run Prettier in write mode.                                                                        |
| `pnpm format:check` | Run Prettier in check mode (used by CI).                                                           |
| `pnpm typecheck`    | `tsc --noEmit` — type-check without emitting JS.                                                   |
| `pnpm test`         | Run Vitest unit tests once.                                                                        |
| `pnpm test:watch`   | Run Vitest in watch mode.                                                                          |
| `pnpm test:e2e`     | Run Playwright E2E tests.                                                                          |
| `pnpm check`        | Run the CI `check` job locally: lint + format:check + typecheck + vitest. Run this before pushing. |
| `pnpm check:e2e`    | `pnpm check` plus the Playwright E2E tests.                                                        |
| `pnpm migrate:images`   | Re-run the image migration to Supabase Storage (idempotent).                                    |
| `pnpm migrate:patterns` | Re-run the pattern-image migration to Supabase Storage (idempotent).                            |

For local E2E: `pnpm exec playwright install` once to download browser binaries.

## Environment variables

Copy `.env.example` to `.env.local` and fill in values. `.env.local` is git-ignored.

- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL. Set in Vercel for preview + production; required locally for `next/image` to fetch from the bucket.
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` — client-safe Supabase key. Set in Vercel for preview + production.
- `SUPABASE_SECRET_KEY` — server-only secret. **Local only** (used by the migration scripts). Never set on Vercel; never prefixed with `NEXT_PUBLIC_`.

Use the modern key format (`sb_publishable_...` and `sb_secret_...`) — not the legacy `anon` / `service_role` JWTs ([ADR-0006](./docs/decisions/0006-authentication.md)).

## Project layout

```
src/
  app/        # Next.js App Router pages, layouts, route handlers
  lib/        # Shared utilities and data modules
  components/ # UI primitives + page-level components
e2e/          # Playwright tests
public/       # Static assets served at /
docs/         # ADRs, plan, conventions — see docs/README.md for the index
demo/         # Original styled redesign pitch — design reference only
scripts/      # Migration scripts; own package.json
content/      # Extracted legacy WordPress content (markdown + images)
```

`content/`, `scripts/`, `docs/`, `demo/`, and `.agents/` are listed in `.vercelignore` and never reach the Vercel build environment. Code in `src/` must not import from them — see [`docs/dev-guide.md`](./docs/dev-guide.md) → *Import boundaries*.

## Where to read next

- **[`CLAUDE.md`](./CLAUDE.md)** — project-wide orientation: source-of-truth docs, ADR workflow, current build state, conventions. Start here when picking the project up.
- **[`docs/README.md`](./docs/README.md)** — index of all documentation; disambiguates canonical from draft.
- **[`docs/implementation-plan.md`](./docs/implementation-plan.md)** — phased build plan with current Status table.
- **[`docs/dev-guide.md`](./docs/dev-guide.md)** — non-ADR conventions for `src/` (design tokens, animations, icons, fonts, shadcn, site-config, import boundaries, etc.). Every rule here is non-negotiable.
- **[`docs/decisions/`](./docs/decisions/)** — the 21 ADRs. Read the relevant one before touching the surface it governs.
