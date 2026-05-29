# ADR-0014: Linting & formatting

- **Status:** Accepted
- **Date:** 2026-05-19
- **Deciders:** Kevin Kane

## Context

Every TypeScript + React project benefits from a linter (catching real bugs and enforcing patterns) and a formatter (eliminating stylistic debate). The realistic choice in 2026 is between the established two-tool pairing (ESLint + Prettier) and the newer all-in-one alternative (Biome). Both are mature enough for production.

## Options considered

- **ESLint + Prettier** — established pairing, largest plugin ecosystem, Next.js's default tooling. Two configs, two dev dependencies.
- **Biome** — Rust-powered all-in-one, ~25x faster, single config. Smaller plugin ecosystem in early 2026; less first-class Next.js integration.
- **ESLint only, no formatter** — uncommon; loses the Prettier "no debate about style" benefit.
- **Prettier only, no linter** — loses linting benefits entirely.

## Decision

Three bundled calls:

1. **Linter:** ESLint, pinned to the **9.x maintenance line** (current: `eslint@9.39.4`). See "Amendment 2026-05-20" below.
2. **Formatter:** Prettier (current latest: `prettier@3.8.3`).
3. **CI enforcement:** lint and format-check run in the GitHub Actions PR/push workflow (the same workflow as the test job from [ADR-0013](./0013-testing-strategy.md)). PRs are blocked on lint errors or formatting drift.

### Amendment 2026-05-20 — ESLint 9.x vs 10.x

The original decision pinned `eslint@10.4.0` ("current latest"). When Phase 0 wired up linting, ESLint 10 turned out to be incompatible with the React/Next.js ecosystem in practice: `eslint-config-next@16.2.6` (matching Next.js 16.2.6) transitively pulls `eslint-plugin-react@7.37.5`, which still calls `context.getFilename()` — removed in ESLint 10. `eslint-plugin-react` has no published fix and no public ETA.

Two options were considered: stay on 10 with broken linting until upstream catches up, or downgrade to the 9.x maintenance line (`9.39.4`, fully supported, what the plugin ecosystem actually targets in 2026). We chose to downgrade. The ADR's spirit — "use the conventional Next.js pairing on a maintained line" — is satisfied better by 9.x today than by 10.x. Revisit once `eslint-plugin-react` ships ESLint 10 support.

**Configuration baseline** (dev-guide level — locked here only as intent):
- ESLint config extends Next.js's recommended rules (`eslint-config-next`) plus `typescript-eslint` rules.
- Prettier handles all formatting; ESLint format rules disabled via `eslint-config-prettier` so the two tools don't fight.
- `prettier-plugin-tailwindcss` for class-attribute sorting given [ADR-0008](./0008-styling-and-ui-layer.md)'s Tailwind dependency.
- Pre-commit hooks (Husky + lint-staged) are a dev-process choice and not part of this ADR — to be decided in the dev guide.

## Rationale

- **ESLint + Prettier is the conventional Next.js pairing.** Next.js 16 ships with ESLint setup by default, Vercel deployments respect `.eslintrc`, and the plugin ecosystem (typescript-eslint, eslint-plugin-next, eslint-plugin-tailwindcss, etc.) covers every concern this project would surface. Choosing Biome would mean writing more custom config and possibly missing rules that the ESLint ecosystem provides out of the box.
- **CI enforcement matches [ADR-0013](./0013-testing-strategy.md)'s posture.** Process gates that aren't enforced are advisory at best; PR-gating lint means consistency is mechanical, not discipline-dependent.
- **Prettier eliminates style discussions.** Single-developer or not, ceding formatting to Prettier removes any judgment call about indentation, quote style, semicolons, line length, etc. The time saved compounds.

## Tradeoffs accepted

- **Two tools instead of one.** Slightly more config surface and a marginally slower lint+format pass than Biome would give. Acceptable; the ecosystem advantage dominates at this project's scope.
- **ESLint config maintenance.** ESLint config syntax evolves (flat config in v9+, etc.); we accept the upkeep. Next.js's `eslint-config-next` smooths most of this.
- **`prettier-plugin-tailwindcss` ties formatting to Tailwind.** Acceptable since [ADR-0008](./0008-styling-and-ui-layer.md) is already a Tailwind project; if we ever leave Tailwind, the plugin gets removed.
- **CI gate adds workflow runtime per PR.** Marginal; lint runs in seconds.

## Related decisions

- Depends on: [ADR-0001](./0001-frontend-framework.md) (Next.js's ESLint integration), [ADR-0008](./0008-styling-and-ui-layer.md) (Tailwind class sorting plugin), [ADR-0013](./0013-testing-strategy.md) (shared CI workflow).
- Influences: GitHub Actions workflow file (one workflow runs tests + lint + format-check on PR), dev-guide editor setup (recommended VSCode extensions, format-on-save settings).
