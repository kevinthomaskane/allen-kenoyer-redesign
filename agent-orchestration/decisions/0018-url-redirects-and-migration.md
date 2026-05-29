# ADR-0018: URL redirect & WordPress migration strategy

- **Status:** Accepted
- **Date:** 2026-05-20
- **Deciders:** Kevin Kane

## Context

The existing site runs on WordPress at `allenkenoyerglass.com` with roughly 20 publicly-indexed URLs. The rebuild moves to a Next.js app on Vercel ([ADR-0001](./0001-frontend-framework.md), [ADR-0002](./0002-hosting-platform.md)) at the same domain. The migration must preserve SEO equity by routing existing URLs to their closest equivalents on the new site, while cleanly handling pages that are being eliminated and URLs that have no equivalent at all (WP internals, query-string post URLs, image paths).

The specific URL mapping is already locked in [`docs/notes/redirects.md`](../notes/redirects.md). This ADR captures the *mechanism*, *policy*, and *cutover plan* — not the destination table itself, which is treated as living content and may evolve up to launch without invalidating this ADR.

Constraints that apply:

- **Same domain post-launch.** No subdomain migration; `allenkenoyerglass.com` continues to serve the site, just from a different origin.
- **All current WP URLs use trailing slashes** (e.g., `/portfolio/`, `/patterns/beginner/`). Google has indexed them in that form, and external inbound links use that form.
- **Content extraction is already complete.** The `/content/` directory captures all page text and images from the old site, so even after WP is shut down the source content is preserved.
- **Studio traffic is low.** A wrong cutover affects few visitors; this informs the rollback-risk posture.

## Options considered

### Redirect mechanism

- **`next.config.ts` `redirects()` function.** In-code, version-controlled, framework-native. Programmatic — patterns can be generated rather than enumerated.
- **`vercel.json` `redirects` array.** Vercel-specific JSON; same version-control story; no programmatic generation.
- **Middleware (`middleware.ts`).** Runtime function; most flexible (can branch on headers, cookies); runs on every matched request.
- **Hosting UI entry.** Manual entry in Vercel dashboard; not version-controlled.

### Trailing-slash policy

- **`trailingSlash: false` (Next.js default).** `/portfolio` canonical; `/portfolio/` auto-308 to `/portfolio`. Existing WP URLs (all with trailing slashes) hit the auto-redirect first, then the explicit migration redirect — **two hops** for any migrated URL.
- **`trailingSlash: true` (preserve WordPress).** `/portfolio/` canonical. Existing URLs hit the canonical form directly with no redirect for the slash. **One hop** for migrated paths, **zero hops** for paths that don't change.

### WordPress-specific URL coverage

- **404 everything not explicitly mapped.** WP admin paths, `/feed/`, `/?p=NNN`, `/category/*`, `/tag/*`, date archives, and `/wp-content/uploads/*` image paths all 404. Honest response; lets stale URLs fall out of Google's index naturally.
- **Catch-all unmapped → `/`.** Bad SEO (soft-404 signal) and bad UX (user expects a specific page, gets the home page).
- **Selective `/wp-content/uploads/*` redirects.** Map known indexed image URLs to new image locations. Requires building the image URL mapping; preserves image-search equity if it matters.

### Status code

- **301 (permanent)** for all migration redirects. Tells Google the move is permanent and to transfer link equity.
- **302 (temporary)** would defer SEO transfer; not appropriate for a permanent migration.

### Rollback / WordPress retention

- **Fallback subdomain for 30 days.** Old WP at `old.allenkenoyerglass.com` (or similar) for one month; DNS-flip-back if needed.
- **Snapshot + immediate shutdown.** Backup taken, WP host turned off on cutover; recovery requires rebuild.
- **Hard cutover, no formal rollback.** Trust pre-launch preview testing; fix forward on the new site.
- **Open-ended retention.** Fallback subdomain stays up until we're confident.

## Decision

### Mechanism

**`next.config.ts` `redirects()` function.** All migration redirects are defined as entries in the array returned by `redirects()`. The function form (rather than the static `vercel.json`) lets us generate redirect entries programmatically where it's natural — e.g., mapping all four `/patterns/[category]/` URLs to `/supplies/patterns/[category]/` in one loop rather than four manual entries.

### Trailing-slash policy

**`trailingSlash: true`.** Preserves WordPress's canonical URL form. Existing indexed URLs and external inbound links land on the canonical form directly. Source patterns in `redirects()` are written with trailing slashes to match the canonical form and produce a single 301 hop per migrated URL.

### Status code

**All migration redirects are 301 (permanent).** No 302s in the migration set. This is the only signal that transfers SEO equity to the new URL.

### Coverage

**Two categories of URLs handled explicitly:**

1. **Mapped URLs** — every old URL listed in [`docs/notes/redirects.md`](../notes/redirects.md) gets a 301 to its new home. The current list:
   - `/services/` → `/`
   - `/parties/` → `/classes/`
   - `/tool-kits/` → `/supplies/`
   - `/custom-design/more-custom-photos/` → `/portfolio/`
   - `/newsletter/` → `/contact/`
   - `/helpful-links/` → `/contact/`
   - `/patterns/` → `/supplies/patterns/`
   - `/patterns/beginner/` → `/supplies/patterns/beginner/`
   - `/patterns/intermediate/` → `/supplies/patterns/intermediate/`
   - `/patterns/advanced/` → `/supplies/patterns/advanced/`
   - `/patterns/mirrors-and-frames/` → `/supplies/patterns/mirrors-and-frames/`

2. **Unmapped paths** — everything else 404s. This includes:
   - WP admin paths (`/wp-admin/*`, `/wp-login.php`)
   - WP feed / archive URLs (`/feed/`, `/category/*`, `/tag/*`, `/YYYY/MM/*` date archives)
   - WP query-string URLs (`/?p=NNN`, `/?page_id=NNN`)
   - WP image paths (`/wp-content/uploads/*`)
   - Any other URL that isn't a known new-site route or an explicitly mapped redirect

No catch-all "redirect everything else to `/`" — Google treats catch-all-to-home as soft-404 and the UX is misleading.

### Cutover plan

**Hard cutover, no formal rollback.** When DNS flips to Vercel, the existing WordPress site goes offline. We accept that any post-launch issue must be fixed forward on the new site. This is appropriate because:

- Studio traffic is low; a misstep affects few visitors.
- Pre-launch testing on Vercel public preview URLs ([ADR-0002](./0002-hosting-platform.md)) can validate the full redirect set and every page before DNS flips.
- The `/content/` directory preserves all extracted text and images, so the WP database/files are not the only copy of the content.

**Pre-launch validation** happens on the standard Vercel preview URL for the production branch. Concrete checks before flipping DNS:

- Every entry in `docs/notes/redirects.md` returns a 301 with the correct `Location` header.
- Every new-site route renders without error in the preview environment.
- `sitemap.xml` and `robots.txt` are present and reflect the new URL inventory.
- Admin auth works against the production Supabase project ([ADR-0006](./0006-authentication.md)).

**Cutover itself:**

- 24–48 hours ahead: lower the DNS TTL on the apex `A` / `ALIAS` and `www` `CNAME` to 5 minutes (or 300s).
- At cutover: switch the DNS records to Vercel's targets. Vercel's automatic certificate issuance handles TLS.
- After propagation: verify the production domain serves the new site, redirects fire correctly, and the WP origin is no longer reachable. Resubmit `sitemap.xml` in Google Search Console.

## Rationale

- **`next.config.ts` over `vercel.json` or middleware** because the redirect set is small enough to read at a glance, structured enough to benefit from typing, and patterned enough (the four patterns subpages, especially) to benefit from a function rather than hand-typed JSON. Middleware would be overkill — we need declarative path mapping, not request-time logic.
- **`trailingSlash: true` is the right call for this migration.** With `false`, every existing WP URL would take two 301/308 hops to reach the new canonical form: one for the slash, one for the path. With `true`, paths that don't change require zero redirects and paths that do change require one. The "Next.js default" argument for `false` is genuine but minor; the one-hop guarantee on every migrated URL is a material SEO win.
- **301 across the board** because every redirect in the migration represents a permanent move. There's no scenario in the locked scope where a redirect destination might temporarily change.
- **No catch-all to home.** Catch-all-to-home looks defensive but signals soft-404 to Google and confuses users. The honest response for an unknown URL is 404, and search engines drop those URLs from the index on their own schedule.
- **No `/wp-content/uploads/*` redirects.** Building the image URL mapping is real work, and image-search equity for a small studio is marginal. Letting those URLs 404 (and naturally drop from Google's image index) is the right ROI call. If a specific image URL is known to be heavily linked externally, it can be added to `redirects.md` as a one-off later.
- **Hard cutover is appropriate given the risk profile.** Low traffic + extracted content + thorough preview testing means the marginal benefit of a 30-day fallback subdomain doesn't justify the operational overhead of running two origins. The risk being accepted is "we discover a bug in production and have to fix it in production" — which is the same risk every Vercel deploy carries anyway.

## Tradeoffs accepted

- **`trailingSlash: true` is the less common Next.js convention.** Some third-party Next.js examples and documentation assume `false`. Acceptable — the convention is fully supported, and any future developer can read this ADR to understand why.
- **No fallback to WordPress.** A serious post-launch issue (e.g., a routing bug that breaks the admin) means fixing it in real time on the new site. Acceptable because (a) the pre-launch checklist mitigates most issues, (b) Vercel rollback-to-previous-deploy is one click for code regressions, and (c) the content is preserved in `/content/` regardless of WP's availability.
- **Unmapped paths return 404.** Some inbound links to retired WP URLs that aren't in `docs/notes/redirects.md` will break. Acceptable; the redirects table covers every known top-level page, and the long tail of "what if someone linked to a tag archive page" is genuinely marginal.
- **No formal SEO recovery plan if rankings drop post-cutover.** The expectation is that proper 301s + a clean sitemap + Search Console resubmission keep equity intact. If rankings do regress, recovery is a `fix-forward` exercise (audit redirects, check `robots.txt`, verify canonical tags). Acceptable scope for a small-business site.
- **`redirects.md` and `next.config.ts` must stay in sync.** The mapping table is the human-readable source of truth; the function is the runtime enforcement. Drift between them is a real risk. Mitigation: a comment in `next.config.ts` referencing the table, and any redirect changes go to both files in the same commit. Considered (and rejected for now) generating `next.config.ts` entries directly from the markdown table at build time — premature given the small number of redirects.

## Related decisions

- Depends on: [ADR-0001](./0001-frontend-framework.md) (Next.js `redirects()` and `trailingSlash` config), [ADR-0002](./0002-hosting-platform.md) (Vercel as the new origin; public preview URLs for pre-launch validation), [ADR-0015](./0015-content-modeling-classes.md), [ADR-0016](./0016-content-modeling-bulletin-board.md), [ADR-0017](./0017-content-modeling-patterns-catalog.md) (the new URL inventory the redirects target).
- Influences: SEO & schema markup (next ADR; sitemap generation source, canonical URL strategy, robots.txt posture all depend on this ADR's URL scheme and trailing-slash policy).
- Document of record: [`docs/notes/redirects.md`](../notes/redirects.md) (mapping table); kept in sync with `next.config.ts`.
