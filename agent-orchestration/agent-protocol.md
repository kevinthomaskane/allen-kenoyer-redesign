# Agent protocol

The procedural document for working a task. Read this when you've been assigned a task; everything that follows is the contract you're expected to operate under.

This protocol is paired with the orchestrator-assigned model: Kevin assigns each task to a specific session ("do task `01-admin-auth`"). Agents don't auto-claim from a queue. If you weren't assigned a task explicitly, you're not running this protocol — fall back to whatever the user actually asked for.

---

## When you're assigned a task

Your task file lives at:

```
agent-orchestration/phase-<N>/tasks/<task-id>.md
```

The id matches the filename without extension (`01-admin-auth`).

### 1. Verify dependencies are met

Open your task file. Read its `depends_on` frontmatter array. For each dependency, open that task file and confirm `status: done`. If any aren't, stop and surface to Kevin — you've likely been assigned a task whose prereqs haven't shipped, and proceeding means working on shaky ground.

### 2. Read the cited references

In order:

1. **The full task file.** Goal, Context, Scope (in/out), Test specs, Exit criteria — all of it.
2. **Every ADR listed in `adrs_realized`** at `agent-orchestration/decisions/NNNN-*.md`. Read each in full, including any post-acceptance amendments at the bottom of the file.
3. **The dev-guide.** `agent-orchestration/dev-guide.md` is eager-loaded — read it once at session start. All rules apply to every code-touching task.

The depth-of-context chain that brought you here (CLAUDE.md → `project-overview.md` → phase `README.md` → task file) doesn't need re-reading per task once internalized. Re-reach for `project-overview.md` or the phase `README.md` only if you need orientation outside the task's scope.

### 3. Set status to in-progress

Edit the task file frontmatter: `status: todo` → `status: in-progress`. Commit this as a small first commit on the task branch — it makes "who's working what" visible in git history without requiring out-of-band coordination.

### 4. Work the task

Stay strictly within the task's Scope (in). Don't touch anything in Scope (out) — those land in other tasks. If you discover the scope is wrong (missing something obvious, accidentally including something it shouldn't), stop and surface to Kevin rather than expanding or contracting scope unilaterally.

### 5. Add the tests specified in Test specs

The Test specs section is the agent's contract for test coverage. Add the specified Vitest unit tests and/or Playwright E2E tests. They must pass before completion. If you find Test specs missed a case that should obviously be covered, add it and note the addition in the Resolution.

### 6. Verify Exit criteria

Every Exit criterion must be demonstrably met. `pnpm check` and `pnpm test:e2e` should pass locally before opening the PR — that's the same gate CI applies.

---

## Completion protocol

When the task is done:

1. **Append the `Resolution` section to the task file.** One short paragraph: what shipped, any in-flight decisions or scope clarifications, the PR link. Mirror the texture of Phase 1's existing resolution paragraphs in `implementation-plan.md` (they're the model — concise, fact-heavy, sourced from what actually landed).
2. **Flip status:** `status: in-progress` → `status: done` in the task file frontmatter.
3. **Regenerate the phase tracker:** run `pnpm gen:tracker`. This walks `phase-<N>/tasks/*.md` and rewrites the `<!-- generated -->` block in `phase-<N>/README.md`. **Required.** The tracker is otherwise stale and the phase README misleads anyone reading it.
4. **Commit and open the PR.** Standard branch + PR flow per repo conventions. Include the PR URL back in the Resolution section after it's opened.

---

## Escalation rule

**Default: stop work and ask Kevin** when you hit a decision not covered by the task, the cited ADRs, or the dev-guide. Under the orchestrator-assigned model Kevin is available — use the channel rather than inventing.

Stop-and-ask cases:

- Ambiguous scope ("is this in or out?")
- Missing convention with codebase-shape implications ("no dev-guide entry for date formatting — what do we use?")
- Conflicting guidance ("task says X, ADR-0007 says Y")
- Unexpected codebase state — files, branches, or configuration you didn't expect

**Single carved-out exception:** small dev-guide-shaped calls (a utility name, an icon choice, a one-line convention) — add a section to `dev-guide.md` in the same PR, per the dev-guide's own authoring rule ("a section here gets written the first time a convention lands in code, in the same PR"). This is the documented path for filling in small unanswered conventions on the fly.

Don't invent for the load-bearing class. Don't pick "for now" on schema, auth, image storage, URL strategy, or anything else that's expensive to reverse — those are ADR territory, and ADRs are Kevin-authored.

---

## Status transitions

- `todo` → `in-progress` — when starting work (step 3 above).
- `in-progress` → `done` — when the completion protocol runs (above).
- `in-progress` → `blocked` — when you hit something you can't resolve and surface to Kevin. Add a `## Blocker` section to the task file explaining what's stuck and what would unblock.
- `blocked` → `in-progress` — when the blocker is resolved.

Run `pnpm gen:tracker` after any status transition; the phase README's tracker derives from these.

---

## Parallel sessions

If you're working in a parallel worktree (per `docs/parallel-claude-sessions.md`), this protocol applies unchanged — just verify at session start that you're in the right worktree and on the right branch. Cross-session file collisions are handled ad-hoc when they happen; narrow task scope is the primary defense against them.
