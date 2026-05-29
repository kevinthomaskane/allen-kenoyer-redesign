# ADR-0008: Styling & UI layer

- **Status:** Accepted
- **Date:** 2026-05-19
- **Deciders:** Kevin Kane

## Context

The project needs a coherent styling and UI primitives strategy that works for both surfaces:

- **Public marketing pages** — content-heavy, image-rich, typographically polished, bespoke layouts (homepage, services, custom design, classes listing, portfolio, pattern catalog, etc.).
- **Admin dashboard** — functional UI primitives (forms, tables, dialogs, toasts, validation feedback) for [ADR-0004](./0004-admin-dashboard-architecture.md)'s custom admin.

[ADR-0004](./0004-admin-dashboard-architecture.md) explicitly chose to share UI primitives between the admin and public site rather than maintaining two separate component vocabularies. That means a single decision here covers both.

## Options considered

### CSS approach
- **Tailwind CSS** — utility-first, atomic, the de-facto modern Next.js pairing. v4 launched in 2025 with a faster engine and CSS-first config.
- **CSS Modules** — framework-native to Next.js, traditional scoped CSS files. More boilerplate per component.
- **Vanilla Extract** — type-safe zero-runtime CSS-in-TS. Smaller ecosystem.
- **styled-components / Emotion (runtime CSS-in-JS)** — out for App Router; they force client-component boundaries and defeat RSC benefits.
- **Plain CSS** — minimum dependency, maximum maintenance burden.

### Component primitives
- **shadcn/ui** — components copied directly into your repo, built on Radix UI primitives, Tailwind-styled. You own all the code, no runtime dependency on a UI library.
- **Radix UI primitives alone (unstyled)** — accessible behavior primitives, you style everything yourself.
- **Full opinionated library (MUI, Mantine, Chakra)** — themed components included, fast scaffold. Heavy runtime, opinionated visual language, harder to escape for bespoke design.
- **Fully hand-built** — every primitive from scratch. Significant effort, accessibility risk.

### Tailwind version
- **v4 (`4.3.0`)** — current stable, CSS-first config, faster build engine, shadcn CLI default.
- **v3 LTS (`3.4.19`)** — still maintained, familiar JS-based config.

### Dark mode
- **Light-only** — single palette, faster build, no theme toggle.
- **Light + dark from day one** — shadcn supports it out of the box; cost is mostly design discipline.
- **Light now, dark later** — retrofit dark mode is more work than building both up front.

## Decision

Four bundled calls:

1. **CSS approach:** Tailwind CSS, pinned to the v4 family (current latest: `4.3.0`).
2. **Component primitives:** shadcn/ui — components scaffolded into the repo via the CLI, customized in place. Used for both admin and public-site primitives.
3. **Tailwind version:** v4 (CSS-first config in `app/globals.css` via `@import "tailwindcss"`).
4. **Color/theme scope:** Light mode only. No dark-mode CSS variables, no theme toggle, no `dark:` Tailwind variant usage in components.

**Tokens & theme baseline:** shadcn's CSS-variable token system (`--background`, `--foreground`, `--primary`, etc.) is the canonical color contract. The specific shadcn theme baseline (`neutral`, `slate`, `zinc`, `stone`, or `gray`) is swappable via the shadcn CLI and is a dev-guide-level concern, not an ADR call. Custom tokens (brand colors specific to the stained-glass aesthetic) extend the baseline as needed.

**Typography, font choices, and the specific design system (spacing scale, type scale, radius, breakpoints)** are dev-guide-level — they sit on top of this architectural decision and don't reshape it.

## Rationale

- **Tailwind + shadcn/ui is the dominant modern Next.js pairing** for a reason: utility-first styling for fast iteration on bespoke marketing layouts, plus pre-built accessible primitives (built on Radix) for the admin's forms/tables/dialogs without giving up code ownership. Both surfaces share the same vocabulary.
- **Tailwind v4** is the conventional new-project choice in 2026. CSS-first config is simpler, the build engine is meaningfully faster, and shadcn's CLI defaults align with v4. There's no specific reason to pick v3 here.
- **Components-in-repo (shadcn's model) over a runtime library** keeps us free of UI-vendor maintenance cycles. We own the component code; we can rewrite, restyle, or delete any piece without coordinating with a third party.
- **Light-only** matches the studio's aesthetic (color-rich imagery on light backgrounds) and the audience profile (non-technical local residents who won't expect a dark toggle). Building dark mode would add real design and review burden for no audience benefit.
- **Shared vocabulary between admin and public site** ([ADR-0004](./0004-admin-dashboard-architecture.md)) is reinforced by this decision: one Tailwind config, one shadcn token system, one set of primitives across both surfaces.

## Tradeoffs accepted

- **Tailwind's class-name density in JSX.** Utility classes in component markup are visually noisy compared to scoped CSS. Acceptable; modern Tailwind tooling (Prettier plugin, IDE extensions) mitigates the visual cost, and the iteration-speed gain dominates.
- **shadcn's "you own the code" model means we own the maintenance.** No upstream component updates magically apply; if a Radix primitive evolves or an accessibility issue is patched in shadcn's reference repo, we may need to manually re-sync. Acceptable; the upside (full control) outweighs the maintenance trickle.
- **Tailwind v4's CSS-first config is newer.** Some plugin or community examples are still v3-shaped; occasional migration friction is possible. Acceptable; v4 has been stable since early 2025.
- **No dark mode means no future-proofing for a possible toggle.** If we ever want dark mode later, retrofitting all components is real work. Accepted as a deliberate scope decision; if the studio's branding ever shifts, revisit this ADR rather than retrofit ad hoc.
- **shadcn lock-in to Radix + Tailwind.** Switching primitives later means rewriting components. Acceptable; Radix and Tailwind are both mature and well-supported in the React ecosystem.

## Related decisions

- Depends on: [ADR-0001](./0001-frontend-framework.md) (Next.js + React + App Router), [ADR-0004](./0004-admin-dashboard-architecture.md) (shared UI vocabulary between admin and public site).
- Influences: All UI work in subsequent phases. Forms & validation ([ADR-0009](./0009-forms-and-validation.md)) uses shadcn's `<Form>` + `<Input>` + `<Button>` primitives. The login UI ([ADR-0006](./0006-authentication.md)) and admin CRUD forms ([ADR-0004](./0004-admin-dashboard-architecture.md)) both build on shadcn components.
