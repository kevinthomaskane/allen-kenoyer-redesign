# Dev guide

Project-level conventions that aren't ADR-worthy. ADRs are for decisions where reversing the call would touch many files; this file is for the smaller calls — library choices, file-layout rules, naming patterns — that benefit from being written down once. See [decisions/README.md](./decisions/README.md#what-is-not-an-adr) for the delineation.

**Authoring rule.** A section here gets written the first time a convention lands in code, in the same PR. Speculative entries are OK only when an accepted ADR already anchors the rule.

---

## Design tokens & styling

**Never use hex/rgb literals or inline color styles in JSX, CSS, or anywhere in `src/`.** All colors flow through Tailwind tokens defined in `src/app/globals.css`. Non-negotiable.

Use Tailwind utility classes that reference tokens (`bg-primary`, `text-muted-foreground`, `border-accent-gold`). Arbitrary-value syntax (`bg-[#6b3fa0]`) and inline `style={{ color: "#abc" }}` are both forbidden.

**Adding a new color.** Add the token to `globals.css` first, then use the utility. No one-off hexes "in the meantime."

**How tokens are wired.** Brand tokens come from `demo/css/styles.css`, bridged into Tailwind v4 via `@theme inline`. shadcn semantic tokens (`--background`, `--primary`, etc.) reference brand tokens via `var()` — brand is single source of truth. Don't apply shadcn's neutral/slate/etc. baseline themes.

ADR anchor: [ADR-0008](./decisions/0008-styling-and-ui-layer.md).

---

## Animations

**Library:** `motion` (the Framer Motion rebrand), via `motion/react`.

**Convention:** Use the `<Reveal>` primitive (`src/components/motion/reveal.tsx`) for scroll-triggered enter animations. Don't write ad-hoc `motion.*` components in page files.

`<Reveal>` honors `prefers-reduced-motion` via `useReducedMotion()` — when on, children render in final state with no transform. The 50+ primary audience makes this non-negotiable; route-level motion that bypasses the primitive silently violates the contract.

```tsx
<Reveal>...</Reveal>                  // default fade-up
<Reveal direction="left">...</Reveal>
<Reveal delay={0.1}>...</Reveal>
```

Animation surfaces that don't fit the reveal-on-scroll shape (hover, dropdown open/close) can use `motion.*` directly — but the reduced-motion check is still your responsibility.

ADR anchor: [ADR-0008](./decisions/0008-styling-and-ui-layer.md) carves animations out as dev-guide-level.

---

## Icons

**Library:** `lucide-react`.

**Caveat — social icons:** `lucide-react@1.x` dropped Facebook, Instagram, and several other brand icons. Brand-icon needs (footer social links) ship as **text links**, not icons.

Import per-icon (named) — don't barrel-import:

```tsx
import { MapPin, Phone } from "lucide-react";
```

ADR anchor: [ADR-0008](./decisions/0008-styling-and-ui-layer.md).

---

## Fonts

**Pairing:** Montserrat (sans) + Playfair Display (serif), both via `next/font/google` in `src/app/layout.tsx`.

**Wiring:** `next/font` exposes each as `--font-montserrat` / `--font-playfair` on `<html>`. `globals.css` maps Tailwind tokens to those variables:

```css
--font-sans: var(--font-montserrat), sans-serif;
--font-serif: var(--font-playfair), serif;
```

Use `font-sans` / `font-serif` Tailwind utilities. Never hardcode font family names. `display: "swap"` is default; don't change without considering CLS.

---

## shadcn/ui setup

**Config:** [`components.json`](../components.json) — `style: "new-york"`, `baseColor: "stone"`, `cssVariables: true`, `iconLibrary: "lucide"`.

**Add a primitive:**

```bash
pnpm dlx shadcn@latest add <name>
```

Components land in `src/components/ui/`.

**Radix entry point:** shadcn-generated components import from the unified `radix-ui` umbrella package (`import { Dialog as SheetPrimitive } from "radix-ui"`), not individual `@radix-ui/*` packages. Keeps the dependency surface flat.

Brand tokens drive shadcn's semantic tokens (see [ADR-0008](./decisions/0008-styling-and-ui-layer.md)); don't layer shadcn's neutral/slate/etc. themes on top.

---

## Site config

**Location:** [`src/lib/site-config.ts`](../src/lib/site-config.ts).

Nav structure (header + footer sitemap), contact info (phone, address, map link), and social links live here. Header, footer, info bar, and any future contact-bearing component import from here. Don't redeclare the phone number or a nav link inline.

When nav structure changes, edit `headerNav` and `footerSections` together — they're intentionally symmetric per the website outline ([`../docs/website-outline.md`](../docs/website-outline.md) is source of truth for what's *in* the nav; this file represents it in code).

---

## Migration scripts

`scripts/` is its own package with isolated deps. Two patterns coexist:

- **Single script for a flat tree.** `migrate-images.mjs` walks `content/<slug>/images/` and uploads to `site-images/<slug>/<filename>`.
- **Parallel script for a differently-shaped tree.** `migrate-pattern-images.mjs` walks `content/supplies/patterns/<category>/images/` and uploads to `site-images/patterns/<category>/<filename>`.

**Rule:** When a new migration target has a meaningfully different source-tree shape, write a parallel script rather than extending the existing one with a flag. Surface each as its own `pnpm migrate:*` task in [`package.json`](../package.json). **Idempotency required** — new migration scripts must re-run safely.

ADR anchor: [ADR-0007](./decisions/0007-image-pipeline-and-storage.md).

---

## Import boundaries — what `src/` may import from

**`src/` code may not import from `content/`, `scripts/`, `docs/`, `agent-orchestration/`, `demo/`, `.agents/`, or `supabase/`.** All are listed in [`.vercelignore`](../.vercelignore) — imports resolve locally but fail the production build with "Module not found." (`supabase/` holds SQL migrations only; the app consumes the DB through generated types in `src/types/` and the clients in `src/lib/supabase/`, never by importing migration files.)

This trips even read-only data imports. `import manifest from "../../content/manifest.json"` looks harmless locally but breaks the Vercel build because the file never reaches the build environment.

**If `src/` needs data from one of those directories:**

- Hand-port into a typed module in `src/lib/` (what `src/lib/classes-content.ts` does for legacy classes content). Best when data is small and stable.
- Or write a build-time generation script in `scripts/` that writes a generated `.ts` into `src/lib/`. Worth the indirection only when source data churns.

Don't loosen `.vercelignore` to ship one of these directories; relocate to `src/` or `public/` instead.

---

## App structure — route groups & admin

Two route groups keep the public site and the admin shell visually separate while sharing one Next.js app ([ADR-0004](./decisions/0004-admin-dashboard-architecture.md)):

- **`src/app/(public)/`** — the marketing site. Its `layout.tsx` carries the public chrome (`InfoBar` + `SiteNav` + footer). Route groups don't change URLs, so these stay at `/`, `/classes`, etc.
- **`src/app/admin/`** — the admin surface. `admin/(protected)/layout.tsx` carries the admin chrome (header + sign-out) and guards auth; authenticated pages (dashboard, and the future classes/bulletins screens) live inside `(protected)/`. `admin/login/` and `admin/reset-password/` sit *outside* the group so unauthenticated visitors can reach them.
- The **root `layout.tsx`** is a bare html/body/fonts shell — no chrome. A new top-level surface picks its own.

**Middleware is `proxy.ts` (Next.js 16).** The session-refresh + `/admin` gate lives in [`src/proxy.ts`](../src/proxy.ts) (export `proxy`, **not** `middleware` — Next 16 renamed the convention) and delegates to `src/lib/supabase/middleware.ts`. Don't create a `middleware.ts`; Next 16 ignores it with a deprecation warning.

**Server-side auth checks use `getClaims()`** — it verifies the JWT and is the current Supabase SSR guidance (not `getSession`, and preferred over `getUser` for SSR). Always go through the typed clients in `src/lib/supabase/` ([ADR-0006](./decisions/0006-authentication.md)).

ADR anchors: [ADR-0004](./decisions/0004-admin-dashboard-architecture.md), [ADR-0006](./decisions/0006-authentication.md).

---

## Container component

**Location:** [`src/components/container.tsx`](../src/components/container.tsx).

Use `<Container>` as the horizontal-padding wrapper for header, footer, and page content. Don't reimplement `mx-auto w-full max-w-7xl px-4 sm:px-6` inline.

For wider/narrower max-width than the default, pass `className` (`<Container className="max-w-5xl">`) rather than skipping the component.

---

## Patterns catalog

**Location:** [`src/lib/patterns.ts`](../src/lib/patterns.ts).

The patterns catalog is dev-managed per [ADR-0017](./decisions/0017-content-modeling-patterns-catalog.md). All records in a single typed array; adding/editing is a code change. No admin UI, no database backing.

**Source order is preserved.** Records are kept in `content/supplies/patterns/<category>/content.md` order. Don't sort the source array — consumers call `getPatternsByCategory(category)`, which sorts at consumption time via `Intl.Collator` with `numeric: true` so `#9 < #10 < #102 < #102C`.

**Uniqueness is `(category, number)`, not bare `number`.** Per [ADR-0017](./decisions/0017-content-modeling-patterns-catalog.md), five numbers (`#105`, `#109`, `#111`, `#789`, `#805`) appear in more than one category. Invariants asserted by `src/lib/patterns.test.ts`; consumers must key off the pair.

**Image URLs go through `patternImageUrl(pattern)`.** Don't hand-compose Supabase Storage URLs inline. The helper centralizes the `${NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/site-images/patterns/<category>/<image>` shape.

**Alt text uses `patternAlt(pattern)`.** Default: `"{Category label} pattern #{number}"`; an optional `alt` field overrides. Don't write per-pattern alt unless the default misleads.

**Image-filename convention:** preserved from source CMS — `<category>-<number>.<ext>` (.gif or .jpg). Source occasionally appended `02` to disambiguate (`intermediate-78902.gif` is `#789`); keep on-disk filename as `image` literal; displayed `number` is the bare one.

ADR anchor: [ADR-0017](./decisions/0017-content-modeling-patterns-catalog.md).

---

## Type discipline

**Database row types are generated, never hand-written.** Regenerate via the Supabase MCP connector after any schema change and commit the result to [`src/types/database.ts`](../src/types/database.ts) (see [`../supabase/README.md`](../supabase/README.md)). The file is an artifact — don't edit it by hand.

- **Consume the generated helpers:** `Tables<"classes">` for a row, `TablesInsert<"classes">` / `TablesUpdate<"classes">` for writes, `Enums<"class_category">` for an enum union. Don't redeclare row shapes.
- **Supabase clients are typed with `Database`:** `createClient()` from [`src/lib/supabase/client.ts`](../src/lib/supabase/client.ts) (browser / Client Components) and [`src/lib/supabase/server.ts`](../src/lib/supabase/server.ts) (Server Components, Server Actions, Route Handlers). Both thread the schema types through to query results — prefer them over a bare `@supabase/supabase-js` client.
- **Form types derive from Zod schemas** via `z.infer<>` ([ADR-0009](./decisions/0009-forms-and-validation.md)) — the write-side counterpart to generated row types.

ADR anchor: [ADR-0005](./decisions/0005-database-and-query-layer.md).

---

## Date/time handling

Cohort sessions, bulletin display windows, and GCal sync all touch timestamps. The rules:

- **Storage is UTC.** All datetime columns are `timestamptz` ([ADR-0005](./decisions/0005-database-and-query-layer.md), [ADR-0015](./decisions/0015-content-modeling-classes.md)); rows hold UTC instants. Visibility comparisons (`ends_at > now()`, bulletin display windows) run in Postgres, never in JS.
- **Convert only at the boundaries.** Kristin's wall-clock input → UTC on write; UTC → studio-local on display and on the GCal push.
- **Studio zone is a hardcoded constant.** `STUDIO_TZ = "America/Los_Angeles"` lives in [`src/lib/site-config.ts`](../src/lib/site-config.ts) alongside the other studio facts. Every conversion references it; there is no per-record or admin-editable zone.
- **Library split:**
  - **Display → native `Intl.DateTimeFormat`** with `{ timeZone: STUDIO_TZ }`. No library — it is the correct, DST-aware tool for formatting.
  - **Wall-time→UTC conversion and DST-safe recurrence stepping → Luxon.** `DateTime.fromObject({ … }, { zone: STUDIO_TZ }).toUTC()` for storage; `.plus({ weeks: 1 })` for the recurrence builder's row expansion ([ADR-0021](./decisions/0021-admin-class-workflow-ux.md) decision D). Luxon is used *only* for these in-zone operations, not as a general formatting layer.

Display conventions (exact format strings, range rendering like "6:00–8:30 PM") are settled as they land in the first scheduling-UI PR. ADR anchors: [ADR-0015](./decisions/0015-content-modeling-classes.md), [ADR-0020](./decisions/0020-google-calendar-integration.md), [ADR-0021](./decisions/0021-admin-class-workflow-ux.md).

---

## Markdown rendering

Bulletin messages are stored as markdown ([ADR-0016](./decisions/0016-content-modeling-bulletin-board.md)) and rendered on the public homepage with **`react-markdown`**.

- **Renders to React elements** — no `dangerouslySetInnerHTML`, no HTML-string pipeline.
- **No raw HTML passthrough.** `rehype-raw` is deliberately *not* added; markdown is the only authoring surface.
- **Allowlist the toolbar's vocabulary.** Restrict rendered elements to what the admin toolbar emits — bold, italic, links, lists, paragraphs ([ADR-0016](./decisions/0016-content-modeling-bulletin-board.md)) — via react-markdown's `allowedElements`. Add `remark-gfm` only if a real need for tables/strikethrough appears.
- **Trust model:** the sole author is the invite-only admin ([ADR-0006](./decisions/0006-authentication.md)), so this is defense-in-depth on trusted content, not untrusted-input XSS handling. Rendered links still get `rel="noopener noreferrer"`.

The exact `allowedElements` list and the link-component override are filled in when the bulletin display component ships. ADR anchor: [ADR-0016](./decisions/0016-content-modeling-bulletin-board.md).

---

## Admin image upload *(stub — Phase 2)*

Browser-side upload via `supabase-js` writing to the `site-images` bucket, per [ADR-0007](./decisions/0007-image-pipeline-and-storage.md) and [ADR-0021](./decisions/0021-admin-class-workflow-ux.md) (decision K). Fill in once the first admin upload form ships.

---

## Public-form spam protection *(stub — Phase 3)*

Public-form Server Actions are protected by two layers per [ADR-0010](./decisions/0010-form-submission-and-transactional-email.md), which records that the layer exists and leaves the implementation here:

- **Honeypot** — a hidden field every public form renders; a non-empty value means a bot, and the action returns success-shaped output **without sending email**. No store, no dependency.
- **Per-IP rate limit — backed by Supabase Postgres** (Kevin's call, Phase 3 authoring). Reuse the DB we already run rather than adding a vendor (Upstash) or platform feature (Vercel Firewall): a small counter object (table or function) checked from each public-form Server Action, keyed by client IP within a time window. No new dependency or env var. Tradeoff accepted: the otherwise email-only public form now reads/writes the DB on submit.

Exact shape (table vs. SQL function, window length and request ceiling, how the client IP is read from request headers in a Server Action, and the success-shaped rejection so a tripped limit never reveals the rule to a bot) is filled in when the first public-form pipeline ships (Phase 3 task `01-submission-pipeline`). ADR anchor: [ADR-0010](./decisions/0010-form-submission-and-transactional-email.md).
