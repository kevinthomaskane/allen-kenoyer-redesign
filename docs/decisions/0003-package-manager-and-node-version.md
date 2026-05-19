# ADR-0003: Package manager & Node version

- **Status:** Accepted
- **Date:** 2026-05-19
- **Deciders:** Kevin Kane

## Context

The project needs a package manager and a Node runtime version pinned before any dependency installation work begins. Both choices ripple into CI behavior, lockfile semantics, install speed, Vercel build behavior, and the friction of every future contributor (or future-Kevin) coming back to the repo.

Versions verified at decision time (`npm view` / `nodejs.org/dist`):
- **Node 24.15.0** — latest LTS ("Krypton"), released 2026-04-15
- **Node 26.1.0** — latest "current" release (not yet LTS), 2026-05-06
- **pnpm 11.1.3** — latest stable, requires Node `>=22.13`

## Options considered

### Package manager

**npm.** Bundled with Node, zero install step, ubiquitous. Slowest install of the four. Disk-inefficient (duplicates packages across projects). Default choice if no opinion.

**pnpm.** Content-addressable global store with hard-linked `node_modules`; fastest install of the established three, smallest disk footprint, strict peer-dependency resolution that surfaces dependency issues npm would silently hoist over. De-facto modern Next.js choice in 2025–2026. Tradeoff: occasional friction with packages that have malformed peer deps; symlinked layout can confuse legacy tools that assume flat hoisting.

**yarn (Berry / v4).** Modern, PnP option for zero-install setups. Mature. Tradeoff: ecosystem mindshare has shifted to pnpm; less Vercel/Next.js documentation traction.

**bun.** Fastest install and bundled JS runtime. Tradeoff: younger, still surfacing edge cases in production Next.js + Vercel deploys; not worth being on the bleeding edge for a client production site.

### Node version

**Node 24 LTS (Krypton).** Active LTS line, security-patched through the LTS window (~30 months from initial release). Standard production pick. Conservative-correct for a client-handoff project.

**Node 26 (current).** Newest features, won't enter LTS until ~October 2026. No specific feature in this project requires it. Adds upgrade risk to a stability-first engagement.

**Node 22 (previous LTS, in maintenance).** Only justified if a specific compatibility concern with 24 surfaces — none has.

## Decision

- **Package manager: pnpm** (latest stable `11.1.3`).
- **Node runtime: Node 24 LTS** (latest `24.15.0`).

Version enforcement mechanics (lockfile, `packageManager` field, `.nvmrc`, `engines`) are dev-guide-level conventions and will be documented there, not pinned by this ADR.

## Rationale

- **pnpm** is the modern default for Next.js work, gives meaningful install-speed and disk-footprint wins on a Vercel pipeline that runs install on every preview deploy, and its strict peer-dep resolution catches dependency issues early rather than letting npm's hoisting hide them until production.
- **Node 24 LTS** is the conservative-correct pick for a production client site. The LTS window provides predictable security-patch coverage, Vercel supports it as a first-class target, and there is no project requirement that demands features only available in Node 25/26.

## Tradeoffs accepted

- **pnpm's strict resolution** will occasionally require explicit overrides or `.npmrc` config for packages with malformed peer dependencies. Acceptable cost; early surfacing is the feature.
- **pnpm's symlinked `node_modules` layout** can confuse legacy tooling that assumes flat hoisting. Unlikely to bite on a greenfield Next.js project but worth noting.
- **Node 24 LTS will enter maintenance** roughly April 2027 and reach end-of-life in April 2028. A planned upgrade to the next LTS (Node 26, once it enters LTS in October 2026) will be required within that window. Acceptable; the upgrade cadence is predictable.
- **Choosing LTS over current** means missing some newer Node APIs and performance work landing in 25/26. Acceptable because no current project requirement depends on them.

## Related decisions

- Depends on: [ADR-0001](./0001-frontend-framework.md) (Next.js 16 requires Node 18.18+; both 22 LTS and 24 LTS satisfy this).
- Influences: CI configuration, dev-environment setup conventions (dev guide), any future ADR that pins a dependency requiring a specific Node minimum.
