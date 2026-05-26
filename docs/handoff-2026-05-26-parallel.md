# Parallel work handoff — 2026-05-26

**For:** another Claude Code instance
**Concurrent with:** primary Claude executing Phase 1 Chunk B (Layout shell + navigation)
**Estimated duration:** one focused session

## Read these first, in this order

1. **[`CLAUDE.md`](../CLAUDE.md)** — project conventions, source-of-truth doc layout, ADR-first methodology, hard rules (no hex literals, `pnpm check` before push, etc.).
2. **[`docs/decisions/README.md`](./decisions/README.md)** — ADR index. Note the status column.
3. **[`docs/implementation-plan.md`](./implementation-plan.md)** — phase/chunk status. Phase 1 Chunk A is complete; the primary Claude is working on Chunk B.

You do **not** need to read all 21 ADRs end-to-end. Read each one as the work items below intersect it.

## What you'll work on

Two pieces of scope that don't depend on Chunk B and can land in parallel:

### Work item 1 — Drive ADR-0021 to Accepted

[ADR-0021](./decisions/0021-admin-class-workflow-ux.md) is currently **In Discussion** with 5 decisions already locked and 7 open questions listed at the bottom of "Open questions." The methodology rule from Kevin's global CLAUDE.md is critical here:

> "Drive each ADR to Accepted by asking questions, not by drafting. For every Pending or In-Discussion ADR, surface open questions explicitly, then ask them one at a time, then fill Rationale and Tradeoffs from Kevin's actual answers (not drafts marked for review)."

The 7 open questions are sequential — pick them in order, ask one at a time, wait for Kevin's answer, then move on. When all 7 resolve:

- Replace the "Open questions" section with a "Decisions" sub-section per question (matching the format of A–E in the existing "Decisions to date").
- Expand the Rationale and Tradeoffs sections to reflect the new decisions.
- Flip Status from `In Discussion` to `Accepted`, fill in the date.
- Update [`docs/decisions/README.md`](./decisions/README.md) to set ADR-0021's status to Accepted.

Operating rules for this work item:

- **Honor "no architecture assumptions."** Present each question with honest tradeoffs across 2–3 options. Don't pre-fill a recommended answer unless Kevin explicitly asks. Use `AskUserQuestion` so options render cleanly.
- **One question at a time.** Don't bundle "form chrome + image upload + publish UX" into one ask.
- **Cite ADR-0021's existing decisions** when relevant so Kevin sees you've read it.

### Work item 2 — Pre-resolve Chunk D's pattern migration approach

The [ADR-0017 Amendment 2026-05-22](./decisions/0017-content-modeling-patterns-catalog.md) reversed pattern image storage from `/public/` to Supabase Storage at `site-images/patterns/<category>/`. The [implementation plan's Chunk D item 2](./implementation-plan.md) flags this as a TODO: *"extend `scripts/migrate-images.mjs` to also walk the nested `content/supplies/patterns/<category>/images/` tree, or invoke a parallel script."*

Decide and implement before Chunk D starts. Concrete sub-steps:

1. Read `scripts/migrate-images.mjs` to understand its shape (idempotent upload, walks `content/<slug>/images/`, uploads to `site-images/<slug>/<file>`).
2. Surface options to Kevin (one question):
   - **Extend** `migrate-images.mjs` with a `--patterns` flag or a constant array switch.
   - **Parallel script** `scripts/migrate-pattern-images.mjs` mirroring the original.
   - **Refactor** into a shared core (`scripts/lib/upload-images.mjs` or similar) that both scripts call with different source/destination configs.
3. Implement the chosen approach. Add a `migrate:patterns` pnpm script to `package.json`. Do **not** run the migration — Chunk D will do that once `lib/patterns.ts` records exist and the script can be cross-checked against the catalog.
4. Verify with `pnpm check` locally (rule from project memory).

## What NOT to touch

The primary Claude is working in:

- `src/app/`, `src/components/`, `src/lib/`
- `src/app/globals.css` (token additions for layout chrome)
- `next.config.ts` (potentially, if mobile/responsive config changes)
- `package.json` (Motion / framer-motion install + any shadcn primitives)
- `pnpm-lock.yaml`

Stay out of those files entirely. Your scope is `docs/decisions/0021-*.md`, `docs/decisions/README.md`, `docs/implementation-plan.md` (only the Chunk D open-question line — don't touch Chunk B's section), and `scripts/`.

If a question of yours genuinely needs a Chunk B–scoped file changed, surface that to Kevin instead of editing.

## Operating rules (recap)

- **Read CLAUDE.md first.** It encodes the project-specific conventions.
- **Verify versions before any `pnpm add`.** Hard rule from Kevin's global CLAUDE.md.
- **Run `pnpm check` before every `git push`.** Hard rule from project memory.
- **`git pull --rebase origin main` before pushing** to catch the primary Claude's commits and avoid conflicts. File scope is partitioned but pulling first is cheap insurance.
- **Don't bundle commits.** Work item 1 (ADR-0021 acceptance) and work item 2 (pattern migration script) are separate logical changes — separate commits.
- **Use the Supabase MCP `apply_migration` / `execute_sql` only if necessary** — work item 2 doesn't need DB schema changes (the `site-images` bucket already exists), so no DDL should be needed. If you find yourself reaching for `apply_migration`, stop and re-check whether the change is in scope.

## When you're done

Both items committed and pushed. Status updates:

- ADR-0021 → Accepted (status table in `docs/decisions/README.md` updated).
- A working `pnpm migrate:patterns` (or equivalent name) ready for Chunk D execution.

Delete this handoff doc as part of your final commit (or leave it; primary Claude will clean it up later).
