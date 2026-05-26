# Dev guide

Project-level conventions that aren't ADR-worthy. ADRs are for decisions where reversing the call would touch many files and rewrite other decisions; this file is for the smaller calls — library choices, file-layout rules, naming patterns — that still benefit from being written down once instead of re-derived per PR. See [decisions/README.md](./decisions/README.md#what-is-not-an-adr) for the full delineation.

**Authoring rule.** A section here gets written the first time a convention lands in code, in the same PR. Speculative entries are OK only when an accepted ADR already anchors the rule (the section can stub the rule and defer the specifics to the phase where the surface exists).

---

## Design tokens & styling

**Never use hex/rgb literals or inline color styles in JSX, CSS, or anywhere in `src/`.** All colors flow through Tailwind tokens defined in `src/app/globals.css`. This is non-negotiable.

Use Tailwind utility classes that reference tokens: `bg-primary`, `text-muted-foreground`, `border-accent-gold`, etc. Arbitrary-value syntax (`bg-[#6b3fa0]`) and inline `style={{ color: "#abc" }}` are both forbidden — the rule covers any path that bypasses the token system.

**Adding a new color.** If a color is needed that isn't tokenized yet, add the token to `globals.css` first, then use the utility. Don't introduce a one-off hex in the meantime; the token system is the single source of truth and a stray hex defeats it.

**How the tokens are wired.** Brand tokens (the purple/gold/cream palette) are defined from `demo/css/styles.css` and bridged into Tailwind v4 utilities via `@theme inline`. shadcn semantic tokens (`--background`, `--foreground`, `--primary`, etc.) reference brand tokens via `var()`, so brand is the single source of truth — change a brand value once and every shadcn primitive picks it up. shadcn's stock baseline themes (neutral/slate/etc.) are intentionally not used.

**Why this rule exists.** The demo design defined a coherent palette as CSS variables, and the rebuild needs single-source-of-truth color tokens so brand changes flow everywhere. The rule was set explicitly at the start of styling work — design consistency depends on no one (human or Claude) being able to "just use a hex here."

ADR anchor: [ADR-0008](./decisions/0008-styling-and-ui-layer.md).

---

## Animations

**Library:** `motion` (the Framer Motion rebrand), via `motion/react`.

**Convention:** Use the project's `<Reveal>` primitive (`src/components/motion/reveal.tsx`) for scroll-triggered enter animations. Don't write ad-hoc `motion.*` components in page files.

The `<Reveal>` wrapper honors `prefers-reduced-motion` via `useReducedMotion()` — when "Reduce motion" is on at the OS level, children render in their final state with no transform or animation. The 50+ primary audience makes this non-negotiable; route-level motion that bypasses the primitive will silently violate that contract.

```tsx
<Reveal>...</Reveal>                  // default fade-up
<Reveal direction="left">...</Reveal>
<Reveal delay={0.1}>...</Reveal>
```

For animation surfaces that don't fit the reveal-on-scroll shape (e.g., interactive hover states, dropdown open/close), `motion.*` directly is fine — but the reduced-motion check is still your responsibility.

ADR anchor: [ADR-0008](./decisions/0008-styling-and-ui-layer.md) explicitly carves animations out as dev-guide-level.

---

## Icons

**Library:** `lucide-react`.

**Caveat — social icons:** `lucide-react@1.x` dropped Facebook, Instagram, and several other brand icons from the core export. Brand-icon needs (footer social links, etc.) ship as **text links**, not icons. Rationale: text labels are clearer for the 50+ audience anyway, and avoids pulling in a second icon library just for three glyphs.

Import per-icon (named) — don't barrel-import the whole module:

```tsx
import { MapPin, Phone } from "lucide-react";
```

ADR anchor: [ADR-0008](./decisions/0008-styling-and-ui-layer.md) carves icon library out as dev-guide-level.

---

## Fonts

**Pairing:** Montserrat (sans) + Playfair Display (serif), both via `next/font/google` in `src/app/layout.tsx`.

**Wiring:** `next/font` exposes each as a CSS variable (`--font-montserrat`, `--font-playfair`) on `<html>`. `globals.css` maps the Tailwind tokens to those variables:

```css
--font-sans: var(--font-montserrat), sans-serif;
--font-serif: var(--font-playfair), serif;
```

In code: use `font-sans` / `font-serif` Tailwind utilities. Never hardcode font family names — the indirection lets the font choice be swapped in one place.

`display: "swap"` is on by default. Don't change it without considering CLS impact.

---

## shadcn/ui setup

**Config:** [`components.json`](../components.json) — `style: "new-york"`, `baseColor: "stone"`, `cssVariables: true`, `iconLibrary: "lucide"`.

**Add a primitive:**

```bash
pnpm dlx shadcn@latest add <name>
```

Components land in `src/components/ui/`. The aliases map to `@/components/ui`, `@/lib/utils`, etc. (see `components.json`).

**Radix entry point:** shadcn-generated components import from the unified `radix-ui` umbrella package (e.g., `import { Dialog as SheetPrimitive } from "radix-ui"`), not individual `@radix-ui/*` packages. Don't manually swap to per-component packages — keeps the dependency surface flat.

Brand tokens drive shadcn's semantic tokens (see [ADR-0008](./decisions/0008-styling-and-ui-layer.md) and `globals.css`); don't apply shadcn's neutral/slate/etc. baseline themes on top.

---

## Site config

**Location:** [`src/lib/site-config.ts`](../src/lib/site-config.ts).

**Rule:** Nav structure (header + footer sitemap), contact info (phone, address, map link), and social links live in this one file. Header, footer, info bar, and any future contact-bearing component import from here. Don't redeclare the phone number or a nav link inline.

When the nav structure changes (e.g., a new top-level section), edit `headerNav` and `footerSections` together — they're intentionally kept symmetric per the website outline.

ADR anchor: [website-outline.md](./website-outline.md) is the source of truth for what's *in* the nav; this file is the source of truth for how the code represents it.

---

## Migration scripts

`scripts/` is its own package with isolated deps. Two patterns coexist:

- **Single script for a flat tree.** `migrate-images.mjs` walks `content/<slug>/images/` (flat one level deep) and uploads to `site-images/<slug>/<filename>`.
- **Parallel script for a differently-shaped tree.** `migrate-pattern-images.mjs` walks `content/supplies/patterns/<category>/images/` (nested by category) and uploads to `site-images/patterns/<category>/<filename>`.

**Rule:** When a new migration target has a meaningfully different source-tree shape, write a parallel script rather than extending the existing one with a flag. The two scripts are easier to read in isolation than one branchy script trying to handle both layouts. Surface each as its own `pnpm migrate:*` task in [`package.json`](../package.json).

**Idempotency** is required — both existing scripts re-run safely. New migration scripts must too.

ADR anchor: [ADR-0007](./decisions/0007-image-pipeline-and-storage.md) commits to Supabase Storage; this section codifies how the actual upload scripts are organized.

---

## Container component

**Location:** [`src/components/container.tsx`](../src/components/container.tsx).

**Rule:** Use `<Container>` as the horizontal-padding wrapper for header, footer, and page content. Don't reimplement `mx-auto w-full max-w-7xl px-4 sm:px-6` inline — the whole point is that the gutter is consistent everywhere.

If a page needs a wider or narrower max-width than the default, pass a `className` override (`<Container className="max-w-5xl">`) rather than skipping the component.

---

## Patterns catalog

**Location:** [`src/lib/patterns.ts`](../src/lib/patterns.ts).

**Rule:** The patterns catalog is dev-managed per [ADR-0017](./decisions/0017-content-modeling-patterns-catalog.md). All records live as a single typed array; adding or editing patterns is a code change. There is no admin UI and no database backing.

**Source order is preserved.** Records are kept in the order they appear in `content/supplies/patterns/<category>/content.md`. Don't sort the source array — consumers call `getPatternsByCategory(category)` which sorts at consumption time using `Intl.Collator` with `numeric: true` so `#9 < #10 < #102 < #102C` orders correctly.

**Uniqueness is `(category, number)`, not bare `number`.** Per [ADR-0017 Amendment 2026-05-26](./decisions/0017-content-modeling-patterns-catalog.md), five numbers (`#105`, `#109`, `#111`, `#789`, `#805`) appear in more than one category as distinct designs with their own prices. Catalog-construction invariants are asserted by `src/lib/patterns.test.ts`; any consumer that needs to identify a pattern must key off the pair.

**Image URLs go through `patternImageUrl(pattern)`.** Don't hand-compose Supabase Storage URLs inline. The helper centralizes the `${NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/site-images/patterns/<category>/<image>` shape so a future bucket reorganization is one edit.

**Alt text uses `patternAlt(pattern)`.** Default is `"{Category label} pattern #{number}"`; an optional `alt` field on the record overrides it. Don't write per-pattern alt text unless the default actually misleads — there's no descriptive name field, so the number-based fallback is correct.

**Image-filename convention:** preserved from the source CMS — `<category>-<number>.<ext>` (extensions: `.gif` or `.jpg`). Note the source occasionally appended `02` to disambiguate (`intermediate-78902.gif` is `#789`). Keep the on-disk filename as the `image` field literal; the displayed `number` is the bare one.

ADR anchor: [ADR-0017](./decisions/0017-content-modeling-patterns-catalog.md).

---

## Type discipline *(stub — Phase 2 will fill in specifics)*

**Anchored rule (from [ADR-0005](./decisions/0005-database-and-query-layer.md)):** When Phase 2 lands the Supabase schema, types for table rows come from `supabase gen types typescript` (committed at `src/types/database.ts` or equivalent — exact path TBD). Application code consumes those generated types; don't redeclare row shapes by hand. Form types derive from Zod schemas via `z.infer<>` ([ADR-0009](./decisions/0009-forms-and-validation.md)).

**Open questions for Phase 2:**
- Where do shared application types (not table-row types) live? `src/lib/types/` vs. colocated with usage?
- How are derived/projection types named (e.g., `ClassWithCohorts` from joining `classes` + `cohorts`)?
- What's the rule when a route handler needs a subset of a row's columns — pick from the generated type, or define a domain-level type?

Fill in when the first Phase 2 PR that touches schema-generated types lands.

---

## Date/time handling *(stub — Phase 2)*

Cohort sessions, bulletin display windows, and Google Calendar sync all need consistent date/time handling. Open questions:
- Date library: native `Date` + `Intl.DateTimeFormat`, or `date-fns`, or `temporal-polyfill`?
- Timezone rule: store UTC and render in `America/Los_Angeles` (studio time)? Studio time everywhere with explicit annotation?
- Display format conventions (long vs. short, with/without year).

Decide during Phase 2 when the class scheduling UI lands. ADR anchors: [ADR-0015](./decisions/0015-content-modeling-classes.md), [ADR-0020](./decisions/0020-google-calendar-integration.md).

---

## ID generation *(stub — Phase 2)*

Schema row IDs for `classes`, `cohorts`, `cohort_sessions`, `bulletins`. Choice: Postgres `uuid` defaults vs. `cuid2` vs. ULIDs. Decide during Phase 2 schema-modeling chunk.

---

## Server Components vs. Client Components *(stub — Phase 2)*

A rule of thumb for when a page or component drops `"use client"`. Defer until enough surface exists to have a real rule (right now: layout + header + reveal are client, everything else is RSC by default — too small a sample).

---

## Markdown rendering *(stub — Phase 2)*

Bulletin board messages are stored as markdown ([ADR-0016](./decisions/0016-content-modeling-bulletin-board.md)). Pick a renderer (e.g., `react-markdown` with allowlisted node types) and a sanitization story when the bulletin display surface ships in Phase 2. Note: the implementation plan explicitly excludes a content-rendering pipeline for Phase 1 (no `react-markdown` / MDX / remark); Phase 1 content is hand-converted to JSX.

---

## Admin image upload *(stub — Phase 2)*

Browser-side upload via `supabase-js` writing to the `site-images` bucket, per [ADR-0007](./decisions/0007-image-pipeline-and-storage.md) and [ADR-0021](./decisions/0021-admin-class-workflow-ux.md) (decision K). Fill in once the first admin upload form ships: hooks, progress UX, file-size/type validation, naming convention for uploaded files.
