# docs/

Project documentation. Read this index before reaching for any file — it disambiguates "current authoritative" from "client-facing translation" from "earlier draft."

## Top-level files (canonical)

- **[`implementation-plan.md`](./implementation-plan.md)** — Plan of record for what's being built and in what order. Phase 0–4 with chunks, scope, exit criteria, and resolution blocks for completed work. Update as phases progress.
- **[`website-outline.md`](./website-outline.md)** — Pages and navigation as locked with Kristin (the client). Source of truth for the public-site page inventory and the header nav structure. If something here disagrees with an internal draft or earlier doc, this wins.
- **[`dev-guide.md`](./dev-guide.md)** — Project conventions that aren't ADR-worthy: animations, icons, fonts, shadcn setup, site-config, migration scripts, type discipline. New section gets written the first time a convention lands in code.
- **[`parallel-claude-sessions.md`](./parallel-claude-sessions.md)** — Workflow for running two Claude Code sessions on this repo simultaneously. Worktree setup, branch conventions, the failure mode that motivated structural isolation. Read only when parallel work is happening.

## Subdirectories

- **[`decisions/`](./decisions/)** — Architecture Decision Records (ADRs). One per significant call. Status legend in [`decisions/README.md`](./decisions/README.md). Read the bottom of each ADR for any post-acceptance amendments.
- **[`for-kristin/`](./for-kristin/)** — Plain-language design documents written for the client. They're the stakeholder-facing translation of the technical decisions:
  - `class-calendar-integration.md` — translates [ADR-0020](./decisions/0020-google-calendar-integration.md).
  - `class-dashboard.md` — translates [ADR-0021](./decisions/0021-admin-class-workflow-ux.md).
- **[`notes/`](./notes/)** — Internal working notes and research. **Not canonical.** Useful for context on how a decision was reached, but check the relevant ADR for the actual commitment.
  - `content-extraction-plan.md` — how legacy WordPress content was pulled into `content/`.
  - `redirects.md` — URL mapping table (the human-readable source of truth for the redirect data; runtime enforcement is `next.config.ts` per [ADR-0018](./decisions/0018-url-redirects-and-migration.md)).
  - `seo-research.md` — research enumerating SEO signals available; the implementation commitment is [ADR-0019](./decisions/0019-seo-and-schema-markup.md).
- **`archive/`** — Local-only (git-ignored) historical artifacts: superseded outlines and early client drafts. Kept for context, not for reference. Includes `current-pages-for-kristin.txt`, `site-outline-for-kristin.txt`, and the original `.docx` outline.

## What to read first when picking up the project

1. [`/CLAUDE.md`](../CLAUDE.md) — project-wide guidance.
2. `docs/implementation-plan.md` — current phase/chunk state.
3. `docs/website-outline.md` — what pages exist on the new site.
4. Relevant ADR(s) in `docs/decisions/` for the surface area you're touching.
