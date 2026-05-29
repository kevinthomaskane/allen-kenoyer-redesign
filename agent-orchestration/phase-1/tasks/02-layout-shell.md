---
id: 02-layout-shell
title: Layout shell + navigation
phase: 1
status: done
depends_on: [01-supabase-storage]
adrs_realized: [0008]
---

# Layout shell + navigation

## Goal

Provide the sticky header (InfoBar + SiteNav), footer, mobile navigation, and shared layout primitives that every Phase 1 route inherits, so subsequent content tasks can ship pages without re-implementing chrome.

## Scope (in)

1. Root layout chrome: header (logo, primary nav, contact CTA), footer (contact info, copyright, social if applicable). All using brand tokens defined in `globals.css`; no hex literals per the dev-guide rule.
2. Mobile nav (hamburger trigger opening a shadcn `Sheet` with a nested accordion for grouped routes).
3. Responsive breakpoints baseline (Tailwind defaults: `sm`, `md`, `lg`, `xl`). Layout chrome works cleanly across mobile / tablet / desktop.
4. Shared layout primitives in `src/components/`: `Container`, `InfoBar`, `SiteNav`, `SiteFooter`.
5. shadcn primitives via `pnpm dlx shadcn@latest add <name>`: `Button`, `Sheet` (mobile nav), `Dialog` (reused later by patterns lightbox).
6. Install Motion (`motion`, the rebrand of Framer Motion); add `<Reveal>` primitive at `src/components/motion/reveal.tsx` wrapping `whileInView` with `once: true` for scroll-triggered enter reveals.

## Scope (out)

- Page content — task `03-content-routes`.
- Per-page metadata, sitemap, JSON-LD — Phase 4.
- Dark mode / theme toggle — light-mode-only enforced per [ADR-0008](../../decisions/0008-styling-and-ui-layer.md).

## Test specs

- No new unit tests; layout chrome is exercised by E2E smoke in `03-content-routes`.
- Manual verification: header + footer render on every route; mobile menu opens; brand tokens (no hex literals); reduced-motion preference honored via `<Reveal>`.

## Exit criteria

- Sticky header + footer render on every route.
- Mobile menu (Sheet + accordion) functional at 375px width.
- All chrome consumes brand tokens; no hex literals in JSX or CSS files under `src/`.
- `pnpm check` passes.

## Resolution

Shipped 2026-05-26. Layout chrome shipped in `src/app/layout.tsx`: sticky `<header>` containing `InfoBar` (contact strip) + `SiteNav` (logo, primary nav, menubar role, hamburger trigger on mobile), `<main>`, and `SiteFooter`. Mobile nav pattern is **hamburger → shadcn `Sheet` with a nested accordion** for grouped routes — chosen over a plain dropdown because it gives the patterns sub-tree a usable depth on small screens. shadcn primitives added via the CLI: `Button`, `Sheet` (mobile nav), `Dialog` (reused by task `04-patterns-catalog`'s lightbox). Shared layout primitives in `src/components/`: `Container`, `InfoBar`, `SiteNav`, `SiteFooter` (`PageHeader` and `Reveal` followed in task `03-content-routes`). All chrome consumes brand tokens from `globals.css` — no hex literals — and light-mode-only is enforced (no `dark:` variants). `motion@^12.40.0` installed per plan (the rebrand of `framer-motion`); `Reveal` (`src/components/motion/reveal.tsx`) wraps `whileInView` with `once: true` for scroll-triggered enter reveals, matching the demo's animation vocabulary. Logo aspect ratio + desktop info bar layout iterated post-initial-build (commit `33e75a0`).
