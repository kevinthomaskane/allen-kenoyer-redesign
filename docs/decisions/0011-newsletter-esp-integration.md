# ADR-0011: Newsletter ESP integration

- **Status:** Accepted
- **Date:** 2026-05-19
- **Deciders:** Kevin Kane

## Context

The studio has an existing newsletter on **Constant Contact** with an established subscriber list. The current WordPress site exposes two newsletter touchpoints:

- A **signup** link to a Constant Contact hosted opt-in page (`visitor.r20.constantcontact.com/manage/optin?v=...`).
- A **"view latest newsletter"** link to a Constant Contact-hosted email archive page (currently the Summer Classes newsletter).

[ADR-0004](./0004-admin-dashboard-architecture.md) locks the admin dashboard scope to two managed content types (classes + bulletin board). Newsletter content management lives outside that scope; Kristin manages campaigns and the subscriber list in Constant Contact's own UI.

## Options considered

### Stay vs migrate
- **A — Stay on Constant Contact, link/embed their hosted form.** No list migration, no API integration on our side, no Kristin learning curve.
- **B — Stay on Constant Contact, build a custom signup form posting to their API v3.** Native shadcn-styled signup form on our site, but requires OAuth setup and Constant Contact API integration.
- **C — Migrate to a modern ESP (MailerLite, Loops, Buttondown, etc.).** Better DX, often cheaper, but introduces list migration overhead, potential CCPA re-consent friction, and forces Kristin to learn a new tool.

### "View latest newsletter" link
- **Hardcoded URL** managed by the developer, updated manually when Kristin sends a new newsletter.
- **Drop the feature** — just have a "Subscribe" CTA without a "view latest" link.
- **Constant Contact Newsletter Archive page** — a stable URL Constant Contact hosts that always reflects Kristin's latest sends (requires confirming she has the feature enabled on her plan).

## Decision

Three bundled calls:

1. **ESP:** Constant Contact (existing). No migration.
2. **Signup integration:** Option A — link or embed Constant Contact's hosted opt-in page. No custom signup form, no API integration. The "Subscribe" CTA on the redesigned site points to Constant Contact's existing opt-in URL. Whether we use a plain link, an iframe embed, or a modal that loads the hosted page is a dev-guide-level styling choice.
3. **"View latest newsletter" link strategy:** Preferred path is Constant Contact's **Newsletter Archive page** (stable URL, zero ongoing maintenance), **if Kristin has it enabled.** Fallback if she doesn't: a developer-managed constant in the codebase that Kevin updates on request from Kristin. Either way, the URL is centralized in one config location (e.g., `lib/site-config.ts`), not duplicated throughout the codebase. This is a question to confirm with Kristin before launch.

**Important exception to [ADR-0010](./0010-form-submission-and-transactional-email.md):** The newsletter signup does *not* flow through our Server Actions + Resend pipeline. It bypasses our backend entirely and lands on Constant Contact. This is the only public form on the site that doesn't follow the standard submission pattern.

## Rationale

- **Keeping the existing ESP is the right move for a small-business client.** The list is already built, the workflow is established, and Kristin knows the tool. Migration would create real friction (export/import, possible CCPA re-consent, learning curve) for marginal DX gains that benefit *us*, not her.
- **Option A over B** because the additional engineering for a custom signup form posting to Constant Contact's API is real work (OAuth, error handling, list selection) for a small UX win. Newsletter signup is a low-conversion surface; the visual disconnect from a hosted opt-in page is acceptable.
- **Newsletter content management belongs outside the admin scope.** Building a "newsletter tools" surface in our admin would duplicate what Constant Contact already provides. The admin stays focused on classes and bulletins per [ADR-0004](./0004-admin-dashboard-architecture.md).
- **The "view latest" link is a low-stakes feature.** If the archive page works, use it; if not, a hardcoded URL with infrequent updates is acceptable; if Kristin doesn't care, drop it.

## Tradeoffs accepted

- **Signup UX disconnect.** Visitors clicking "Subscribe" leave the new site for a Constant Contact-styled page that looks dated next to the redesigned site. Acceptable; conversion impact on a low-traffic signup surface is minimal.
- **No subscriber data on our side.** We can't show "you're subscribed" state on the site, can't tell the database "this user is on the list," can't trigger any custom flows based on subscription status. Acceptable; we don't need any of those features.
- **"View latest newsletter" requires either Kristin's cooperation (Newsletter Archive feature) or developer-managed updates.** Acceptable; updates are rare (newsletters sent monthly at most).
- **Continued Constant Contact cost.** Constant Contact is more expensive than modern alternatives for similar list sizes. Acceptable as part of the existing studio cost structure; not our project's budget to optimize.
- **One public form does not follow the [ADR-0010](./0010-form-submission-and-transactional-email.md) pattern.** Documented exception; consistent enough.

## Open client questions

- **Does Kristin have Constant Contact's Newsletter Archive feature enabled?** If yes, we use the stable archive URL. If no, we use a hardcoded constant. Confirm before launch.

## Related decisions

- Depends on: [ADR-0004](./0004-admin-dashboard-architecture.md) (newsletter content management is out of admin scope).
- Influences: [ADR-0010](./0010-form-submission-and-transactional-email.md) is overridden for this one form. URL redirect strategy (existing newsletter page URLs may need redirects post-launch).
