# Authoring protocol

The procedural document for **creating** a phase's tasks — the counterpart to
[`agent-protocol.md`](./agent-protocol.md), which covers **executing** an
assigned task. Read this when Kevin says "create tasks for Phase N."

Like the execution protocol, this is an orchestrator-driven flow: Kevin
initiates it, and the work proceeds through gated stages he approves. **Scoping
is Kevin's call throughout** — this protocol structures the conversation that
gets there; it does not authorize an agent to scope a phase or pick undecided
architecture on its own.

---

## The flow at a glance

1. **Synthesize the phase README** from already-decided sources → Kevin refines → _gate: README approved_.
2. **Propose the task breakdown** (slicing) → _gate: slicing approved_.
3. **Write the full task files** + regenerate the tracker → Kevin reviews.

Each gate is a hard stop. Don't start a stage until Kevin has approved the one
before it.

---

## Stage 1 — Synthesize the phase README

For an unstarted phase, `phase-N/README.md` doesn't exist yet. Create it from
[`phase-template.md`](./phase-template.md), populated from the
**already-decided sources**:

- [`project-overview.md`](./project-overview.md)'s summary for the phase — intent, data-model shape, cross-cutting concerns.
- Every **Accepted ADR** the phase realizes (the phase's entry in `project-overview.md` and the [decision index](./decisions/README.md) point to them). Read each in full.

This is **synthesize-and-refine**, not question-from-scratch: most of a phase
README is downstream of decisions already made, so draft it from those sources
and let Kevin correct. Drafting is appropriate _here_ because you're assembling
settled decisions, not inventing them.

**Flag gaps; don't fill them.** Where the decided sources leave something
unsettled, surface it — never default a value.

**Open decisions are blockers.** If the phase depends on a decision that hasn't
been made — an undecided ADR-territory call, or a dev-guide stub marked "decide
during Phase N" (e.g. Phase 2's date/time handling, markdown rendering, admin
image upload, type discipline) — **stop and surface it before scoping the
affected work.** Resolve it first with Kevin (a new or edited ADR, or a
dev-guide entry), then resume. Never write a task that smuggles an open
architecture decision into execution ("pick a markdown renderer and ship the
bulletin display"); never pick "for now." This is the authoring agent's core
escalation rule.

**Gate:** Kevin approves `phase-N/README.md` before any task file is written.

---

## Stage 2 — Propose the task breakdown

Before writing full task files, propose the **slicing** for Kevin's approval — a
compact list, not finished files:

- Each task: a title + a one-line scope.
- The `depends_on` graph between them.

**Slicing principle (the Phase 1 pattern).** Tasks derive from the phase
README's `Scope (in)` workstreams — workstream-grained, each roughly one PR.
Wire them into a dependency graph: sequential by default (A → B → C → …),
parallel only where two workstreams are genuinely independent. Expect ~4–6 tasks
for a phase the size of Phase 1; a larger phase has more, but still
workstream-sized — _not_ one task per route or file.

Approving the README's scope structure is most of approving the slicing; this
stage makes the task boundaries and dependencies explicit so a wrong cut is
caught as a six-line list, not after eight detailed files exist.

**Gate:** Kevin approves the slicing before full task files are written.

---

## Stage 3 — Write the task files

For each approved task, write `phase-N/tasks/<id>.md` from
[`task-template.md`](./task-template.md). `<id>` is the slug matching the
filename without extension (e.g. `01-admin-auth`).

Fill each field from the settled sources:

- **Frontmatter:** `id`, `title`, `phase`, `status: todo`, `depends_on` (from the approved graph), `adrs_realized` (the ADRs this task puts into effect).
- **Goal / Context:** Goal in 1–2 sentences. Add Context only for what the cited ADRs, dev-guide, and prior task resolutions don't already cover — skip it when the goal + ADR refs are self-sufficient.
- **Scope (in) / (out):** from the approved breakdown; for each out-of-scope item, name the task or phase where it lands.
- **Test specs:** the task's coverage contract per [ADR-0013](./decisions/0013-testing-strategy.md) — the Vitest and/or Playwright cases the executing agent must add. Derive them from the phase's exit criteria and the task's scope.
- **Exit criteria:** demonstrable conditions, including `pnpm check` (and `pnpm test:e2e` where the task carries E2E specs).

**Context-population checklist — surface-specific tooling pointers.** Some
guidance is task-specific rather than always-on, so it lives in a task's Context
to reach the executing agent exactly when it's relevant:

- **Supabase-touching task** → add to Context: invoke the `supabase` skill before first Supabase use (it carries RLS/security gotchas absent from training data), and the project's MCP workflow — `execute_sql` for iterative schema work, `apply_migration` to commit stable changes, `get_advisors` after DDL; no Storage MCP tools (buckets via SQL, uploads via local Node + `@supabase/supabase-js`).

Add new surface pointers to this checklist as they're identified.

**Regenerate the tracker.** Run `pnpm gen:tracker` — it walks `phase-N/tasks/*.md`
and rewrites the `<!-- generated -->` task table in `phase-N/README.md` from the
new files' frontmatter. **Required**, or the phase README's tracker stays empty
and misleads anyone reading it.

**Review.** Kevin reviews the finished task files. They land at `status: todo`,
ready to be assigned and executed per [`agent-protocol.md`](./agent-protocol.md).

---

## What this protocol does NOT do

- **Make decisions.** Scoping and architecture are Kevin's call (Stage 1's escalation rule, and [`agent-protocol.md`](./agent-protocol.md)'s). This protocol proposes and drafts _against settled decisions_; it does not settle them.
- **Execute tasks.** Once tasks are authored and assigned, [`agent-protocol.md`](./agent-protocol.md) takes over.
