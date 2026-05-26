Read `docs/parallel-claude-sessions.md` first.

- **Branch:** `parallel/chunk-c-content`
- **Worktree:** `../ak-chunk-c-content`
- **Setup:** follow the setup commands in the guide.

---

# Parallel work handoff — Phase 1 Chunk C (Content routes)

**For:** another Claude Code instance
**Concurrent with:** primary Claude executing Phase 1 Chunk D (Patterns catalog)
**Estimated duration:** one focused session

## Read these first, in this order

1. **[`CLAUDE.md`](../CLAUDE.md)** — project conventions, source-of-truth doc layout, ADR-first methodology, hard rules (no hex literals, `pnpm check` before push, etc.).
2. **[`docs/dev-guide.md`](./dev-guide.md)** — code conventions for `src/`. Non-negotiable. If you make a call not covered there, add a section in the same PR.
3. **[`docs/website-outline.md`](./website-outline.md)** — source of truth for the public-site page inventory and header nav. Locked with Kristin.
4. **[`docs/implementation-plan.md`](./implementation-plan.md) §Phase 1 Chunk C** — your scope-of-work, exit criteria. Chunk B's resolution (in commit `9c47a99`) means layout chrome, nav, footer, `Reveal` primitive, and Motion are already in place.
5. **[ADR-0007](./decisions/0007-image-pipeline-and-storage.md)** — image pipeline. All images served from Supabase Storage at `site-images/<slug>/<filename>` via `next/image` with explicit `width`/`height` props.
6. **[ADR-0008](./decisions/0008-styling-and-ui-layer.md)** — Tailwind v4 + shadcn, light-mode-only, brand tokens in `globals.css`.

You do **not** need to read all 21 ADRs end-to-end. Read each as your work intersects it.

## What you'll build

**Phase 1 Chunk C — Content routes (9 conventional pages):**

| Route | Source | Notes |
|---|---|---|
| `/` | `content/home/content.md` | Home page — hero + main content per `demo/` design |
| `/cabinet-doors` | `content/cabinet-doors/content.md` | |
| `/classes` | `content/classes/content.md` | Class info; dynamic data lands in Phase 2 |
| `/classes/calendar` | `content/classes/calendar/` | **Static placeholder** — CMS wires it up in Phase 2. Shape TBD this chunk (open question in impl-plan). |
| `/contact` | `content/contact/content.md` | Page only; form submission is Phase 3 |
| `/custom-design` | `content/custom-design/content.md` | |
| `/portfolio` | `content/portfolio/content.md` | |
| `/repairs` | `content/repairs/content.md` | |
| `/supplies` | `content/supplies/content.md` | Note: `/supplies/patterns` is Chunk D scope — don't author the patterns landing page |

For each route:

1. Convert `content/<slug>/content.md` to JSX manually (no `react-markdown` / MDX — see [impl-plan Phase 1 Scope (out)](./implementation-plan.md)). Clean up extraction artifacts (stray `9` tokens, etc.) at conversion time.
2. Resolve image references to Supabase Storage URLs. Images are already migrated (Chunk A); they live at `site-images/<slug>/<filename>`. Use `next/image` with explicit `width` and `height` props (remote sources don't auto-detect). `alt` text comes from `content/manifest.json` — each image entry has an `alt` field; preserve it.
3. Inherit the layout chrome from Chunk B (already wraps all routes via `src/app/layout.tsx`). Each route should be mobile-responsive at `375px` / `768px` / `1280px` with no horizontal scroll.
4. Use the `Reveal` primitive (`src/components/motion/reveal.tsx`) for scroll-triggered enter animations where the demo calls for them. Don't write ad-hoc `motion.*` components — Chunk B established this pattern.
5. Use the `Container` primitive (`src/components/container.tsx`) for page-width layout.

**Also in scope:**

- Cosmetic favicon.ico added at `src/app/favicon.ico` (resolves the existing 404). Source: the studio's logo at `public/logo-allen-kenoyer-glass.png` is the obvious starting point.

**`/classes/calendar` placeholder shape** — open question in impl-plan. Decide what the static placeholder says while waiting for Phase 2's CMS wiring. Surface options to Kevin one at a time per his "one question at a time" rule. Likely shapes: a "see current schedule below" rendering of the current `content/classes/calendar/` snapshot, or a "schedule coming soon — call/email to inquire" placeholder. Don't pre-pick.

## Image references — concrete pattern

```tsx
import Image from "next/image";

const SUPABASE_PUBLIC = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/site-images`;

<Image
  src={`${SUPABASE_PUBLIC}/portfolio/akbevels2.jpg`}
  alt="etched glass bevels" // pulled from content/manifest.json
  width={800}
  height={600}
  className="..."
/>
```

`next.config.ts` already has `images.remotePatterns` configured for the Supabase host (Chunk A). If you find yourself adding `unoptimized` or hardcoding the URL, stop and re-check.

## What NOT to touch

The primary Claude is working on Chunk D in parallel. **Don't touch any of these files** — they're partitioned scope:

- `src/lib/patterns.ts` (Chunk D creates this; ~165 records authored from `content/supplies/patterns/<category>/content.md`)
- `src/app/supplies/patterns/**` (Chunk D — landing page + 4 category routes)
- `scripts/migrate-pattern-images.mjs` (Chunk D runs this; the script itself is done)
- `package.json` `migrate:patterns` script (already there)

If you need a Container or layout primitive change that would help both chunks, surface it to Kevin — don't unilaterally refactor shared code while a parallel session is editing it.

**Other no-touch fences (general):**

- `src/app/layout.tsx`, `src/components/site-nav.tsx`, `src/components/site-footer.tsx`, `src/components/info-bar.tsx` — Chunk B locked these. Editing them likely means you're working around a layout bug; surface it to Kevin instead of patching.
- `next.config.ts` — should not need changes for Chunk C.
- `src/app/globals.css` — brand tokens already complete. Add new utility classes/tokens only if a Chunk C surface genuinely needs one not yet defined (rare).

## Operating rules

- **Read CLAUDE.md and docs/dev-guide.md first.** They encode the project-specific conventions you'll otherwise re-derive (wrong).
- **No hex literals.** Use brand tokens from `globals.css` (`--color-primary`, `--color-accent-gold`, etc.). The `cn` helper from `src/lib/utils.ts` is the className composition idiom.
- **Verify versions before any `pnpm add`.** Hard rule from Kevin's global CLAUDE.md. (You likely shouldn't need any new deps for Chunk C — flag it if you think you do.)
- **Run `pnpm check` before every `git push`.** Hard rule from project memory.
- **`git pull --rebase origin main` before pushing** to catch any commits to `main` that landed during your session. File scope is partitioned, but pulling first is cheap insurance.
- **Don't bundle commits.** Each route or coherent unit of work can be its own commit. Don't ship all 9 routes in one blob.
- **Use Supabase MCP `execute_sql` only if necessary** — Chunk C should not need DB schema changes. If you reach for `apply_migration`, stop and re-check scope.
- **Use the Supabase MCP `read_file_content` / list tools only if you need to verify what's in the bucket** — the manifest at `content/manifest.json` is the canonical list of migrated images.
- **One question at a time** if you need to clarify anything with Kevin. Don't batch.

## Exit criteria (from impl-plan §Phase 1 Chunk C, with mobile-responsive checks)

- All 9 routes render with their migrated content and reach `200` on the Vercel preview URL.
- All images load from Supabase Storage.
- Each route reachable from header/footer nav on every other route.
- Each route renders cleanly at `375px` / `768px` / `1280px` with no horizontal scroll.
- `pnpm check` and `pnpm test:e2e` pass locally and in CI. The E2E smoke is expanded from "home renders" to a navigation walk through each top-level route — add the smoke spec.
- No console errors in production build.

## When you're done

- All 9 routes committed and pushed on `parallel/chunk-c-content`.
- E2E smoke spec extended.
- Delete this handoff doc as part of your final commit per the parallel-sessions guide.
- Open a PR or merge `parallel/chunk-c-content` into `main` via fast-forward (Kevin's call).
