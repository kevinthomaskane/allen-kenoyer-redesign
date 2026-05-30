# Agent orchestration framework — decision log

Working artifact for designing the framework that lets Claude agents systematically execute Phase 2+ work, in parallel where possible. Every decision surfaced during design and tracked to a resolution.

**Status:** all 17 decisions resolved (2026-05-28). Implementation pending: rename `docs-v2/` → `agent-orchestration/`, write `agent-protocol.md`, populate `project-overview.md`, retrofit Phase 1 task files, compact `dev-guide.md`. Per **D-4.3**, this log archives once the framework lands in code; its content graduates into `dev-guide.md` / `agent-protocol.md` sections.

---

## Status overview

| ID    | Question                                              | Status   | Resolution                                            |
| ----- | ----------------------------------------------------- | -------- | ----------------------------------------------------- |
| D-1.1 | Phase directory layout                                | Decided  | Numbered prefix (`01-admin-auth.md`)                  |
| D-1.2 | Task file template fields                             | Decided  | Drafted at `docs-v2/task-template.md`                 |
| D-1.3 | Phase README structure                                | Decided  | `README.md`; drafted at `docs-v2/phase-template.md`   |
| D-1.4 | Completion protocol home                              | Decided  | Folded into `agent-protocol.md`                       |
| D-2.1 | Status home (single source of truth)                  | Decided  | Task frontmatter canonical; tracker script-generated  |
| D-2.2 | Resolution home                                       | Decided  | `Resolution` section appended to task file            |
| D-2.3 | Dependency model                                      | Decided  | Hard only; `depends_on` in frontmatter, blocking      |
| D-2.4 | Granularity rule                                      | Decided  | One agent session, one PR                             |
| D-2.5 | Orchestrator-assigned vs. autonomous-claim            | Decided  | Orchestrator-assigned (Kevin) for v1                  |
| D-2.6 | Parallel-session handoff doc — keep, retire, absorb?  | Decided  | Retire                                                |
| D-3.1 | CLAUDE.md changes vs. separate agent-protocol doc     | Decided  | Both — thin CLAUDE.md points at `agent-protocol.md`   |
| D-3.2 | Dev-guide loading strategy                            | Decided  | A-compact (eager-load lean dev-guide)                 |
| D-3.3 | Execution path vs. navigation path — documented?      | Decided  | Moot (structural separation suffices)                 |
| D-3.4 | Escalation rule for ambiguity                         | Decided  | Folded into `agent-protocol.md`                       |
| D-4.1 | implementation-plan.md changes                        | Decided  | Retire; absorbed by `project-overview.md` + phase docs|
| D-4.2 | docs/README.md changes                                | Decided  | Drop `docs/README.md`                                 |
| D-4.3 | Does the framework become ADR-0022?                   | Decided  | No ADR; lives in dev-guide / agent-protocol           |

---

## Structural decisions (resolved in conversation, not originally enumerated)

A few structural calls landed during the design conversation that weren't in the original 17. Capturing here for completeness:

- **`docs-v2/` → `agent-orchestration/`.** The new tree is named for purpose, not for transition. Houses everything agents read for execution.
- **`docs/` retains stakeholder/one-off content only** (`for-kristin/`, `notes/`, `website-outline.md`, `parallel-claude-sessions.md`). No longer an agent-context entry point.
- **`dev-guide.md` and `decisions/` move into `agent-orchestration/`.** Cross-cutting agent references live in the agent tree, not in `docs/`.

---

## 1. Directory and file structure

### D-1.1: Phase directory layout
**Status:** Decided
**Why it matters:** locks the path shape every task file lives at; cited from CLAUDE.md, the protocol doc, and PR titles. Hard to change later without breaking links.
**Resolution:** **A** — numbered prefix. Task files live at `agent-orchestration/phase-N/tasks/NN-slug.md` (e.g., `phase-2/tasks/01-admin-auth.md`). The `id` field matches the filename without extension (`01-admin-auth`); `depends_on` references the same id format. Numbered prefix gives default IDE sort + stable task IDs; the hard-dep graph (D-2.3) defines logical order regardless of filename.

### D-1.2: Task file template fields
**Status:** Decided
**Why it matters:** the template is the agent's contract.
**Resolution:** template drafted at `docs-v2/task-template.md` (relocates to `agent-orchestration/task-template.md` on rename). Frontmatter: `id`, `title`, `phase`, `status`, `depends_on`, `adrs_realized`. Body sections: **Goal**, **Context**, **Scope (in)**, **Scope (out)**, **Test specs**, **Exit criteria**, **Resolution** (empty until completion). `estimated_size` omitted — adds authoring overhead and drifts. `dev_guide_sections` omitted — D-3.2 → A-compact (eager dev-guide load) makes the field unnecessary.

### D-1.3: Phase README structure
**Status:** Decided
**Why it matters:** phase doc is the agent's entry point when orienting within a phase.
**Resolution:** named **`README.md`** (not `phase-N.md`) inside `agent-orchestration/phase-N/`. Auto-renders in GitHub/IDE on directory navigation. Structure drafted at `docs-v2/phase-template.md`: phase title + intent sentence, **Goals**, **ADRs realized**, **Scope (in)**, **Scope (out)**, **Exit criteria**, generated **Tasks** tracker (between HTML markers, regen via `pnpm gen:tracker`), **Phase resolution** (appended at phase completion).

### D-1.4: Completion protocol home
**Status:** Decided
**Why it matters:** "how to mark a task done" needs one canonical location every agent reads.
**Resolution:** centralized into `agent-protocol.md` per D-3.1. Together with the execution flow and escalation rule (D-3.4), `agent-protocol.md` owns all procedural knowledge for working a task.

---

## 2. Task lifecycle and tracking

### D-2.1: Status home — single source of truth
**Status:** Decided
**Why it matters:** drift between task-file status and phase-tracker status is exactly the failure mode we ruled out.
**Resolution:** **A with script-derived tracker.** Task-file frontmatter is the canonical `status` source. The phase README's `Tasks` table is *generated* by `pnpm gen:tracker` (walks `phase-N/tasks/*.md`, rebuilds the table between HTML markers). Agent runs the script as part of the completion protocol in `agent-protocol.md`; optional pre-commit hook backstop. Eliminates the manual two-write drift risk that doomed naive A.

### D-2.2: Resolution home
**Status:** Decided
**Why it matters:** Phase 1's resolution blocks in `implementation-plan.md` are exactly the bloat that prompted this work.
**Resolution:** **A** — `Resolution` section appended to the task file on completion, paired with the `status` flip and `pnpm gen:tracker` run. Definition + resolution co-located on the task; `implementation-plan.md` retires entirely per D-4.1.

### D-2.3: Dependency model
**Status:** Decided
**Why it matters:** dependencies define which tasks can parallelize. Squishy semantics → squishy parallelism.
**Resolution:** **A** — hard deps only. `depends_on: [task-ids]` in frontmatter, blocking interpretation: a task cannot start until every dependency is `done`. No soft/`informed_by` field; nuance lives in the task's `Context` section if needed.

### D-2.4: Granularity rule
**Status:** Decided
**Why it matters:** too big = no parallelism. Too small = orchestration overhead dwarfs value.
**Resolution:** **A** — one agent session, one PR. Anything bigger gets split into sub-tasks with hard deps (D-2.3). Forces hygiene and makes parallelism crisp. Combined with D-2.6 (handoff retired), narrow task scope is the primary defense against cross-session file collisions.

### D-2.5: Orchestrator-assigned vs. autonomous-claim
**Status:** Decided
**Why it matters:** the framework's claim/lock story. Filesystem can't atomically claim.
**Resolution:** **A** — orchestrator-assigned for v1. Kevin assigns each task to a specific session ("Session A, do task `02-classes-schema`"). Agents never auto-claim. v1 ships with no lock infra. Autonomous claim is a v2 problem if/when needed.

### D-2.6: Parallel-session handoff doc — keep, retire, absorb?
**Status:** Decided
**Why it matters:** `parallel-claude-sessions.md` describes a per-session handoff doc; task files may make it redundant.
**Resolution:** **A** — retire the handoff doc. Task files own the "point at the task" job. Cross-session coordination notes ("don't touch `src/components/`") are hard to specify in advance and best handled ad-hoc when collisions actually arise; narrow task scope (D-2.4) makes collisions rare. `parallel-claude-sessions.md` keeps the worktree setup mechanics; the handoff-doc subsection is removed.

---

## 3. Context flow

### D-3.1: CLAUDE.md changes vs. separate agent-protocol doc
**Status:** Decided
**Why it matters:** the execution path has to live somewhere the agent will reliably see it.
**Resolution:** **both, layered.** CLAUDE.md shrinks to a thin bootstrap (high-level orientation, project structure, commands, tech stack, hard rules, interface preferences) with a pointer line: "When assigned a task, read `agent-orchestration/agent-protocol.md`." The protocol doc holds the execution flow + completion (D-1.4) + escalation (D-3.4). Depth-of-context increases as the agent descends the chain: CLAUDE.md → project-overview.md → phase README → task file.

### D-3.2: Dev-guide loading strategy
**Status:** Decided
**Why it matters:** eager-loading a bloated dev-guide burns context; JIT-loading requires structural changes.
**Resolution:** **A-compact** — eager-load the entire dev-guide every session via CLAUDE.md pointer; keep the dev-guide lean as the path of least resistance. Path of least resistance; no per-task `dev_guide_sections` field, no tagging, no preamble/body split. Risk: dev-guide bloat (Phase 2 will add ~6 stub sections). Mitigation: revisit B/C if/when bloat becomes painful — nothing else in the framework blocks the migration.

### D-3.3: Execution path vs. navigation path — documented explicitly?
**Status:** Decided
**Why it matters:** prevent agents from over-reading by mixing navigation/reference docs into the execution flow.
**Resolution:** **moot.** The structural separation (`agent-orchestration/` for execution; `docs/` for stakeholder/one-off) does the work. The agent only ever reads `agent-orchestration/`; `docs/` never appears in the execution path. No explicit doc needed.

### D-3.4: Escalation rule for ambiguity
**Status:** Decided
**Why it matters:** behavior must be defined when an agent hits an unspecified decision.
**Resolution:** folded into `agent-protocol.md` per D-1.4 / D-3.1. Specific rule content (Stop & ask Kevin? Best-effort with documentation? Category-dependent?) is TBD until `agent-protocol.md` is written.

---

## 4. Existing-doc reshaping

### D-4.1: implementation-plan.md changes
**Status:** Decided
**Why it matters:** the plan-of-record currently mixes forward roadmap + execution history (resolution blocks).
**Resolution:** retire `implementation-plan.md` entirely. `project-overview.md` absorbs the high-level roadmap + phase status table. Per-phase `README.md` files absorb phase-specific goals, ADRs realized, scope, and exit criteria. Phase 0/1 historical resolution paragraphs either move into retrofitted task `Resolution` sections (if Phase 1 is retrofitted to validate the framework) or archive.

### D-4.2: docs/README.md changes
**Status:** Decided
**Why it matters:** docs/ has a new, narrower purpose; the README must reflect that or be retired.
**Resolution:** **drop `docs/README.md` entirely.** With `agent-orchestration/` as the agent-context entry point, `docs/` is no longer an entry point for any persona. The remaining subdirectories (`notes/`, `for-kristin/`, plus top-level `website-outline.md` and `parallel-claude-sessions.md`) are self-evident from their names. No index needed.

### D-4.3: Does the framework become ADR-0022?
**Status:** Decided
**Why it matters:** the design touches many files; per the project's "what is not an ADR" rule, that's ADR-shaped territory.
**Resolution:** **B** — no ADR. Framework lives as section(s) in `dev-guide.md` (the always-applied conventions tier) and `agent-protocol.md` (the procedural tier). This working log archives once the framework is in code. Rationale: ADR-shape was triggered by file-touch count, but the actual content is procedural/conventional, not a load-bearing architectural decision in the same sense as ADRs 0001–0021. Lighter homes serve it better.
