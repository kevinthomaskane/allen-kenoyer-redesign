# Parallel Claude sessions

Workflow for running two or more Claude Code sessions simultaneously on this repo. **Read this before starting work if you've been told another Claude session is active.** If only one session is active, skip this doc — work directly on `main` as usual.

## Why this guide exists

A previous parallel session ran two Claudes in the same working tree on `main`. Both were editing files; both staged and committed independently. A commit from one session unexpectedly swept in the other session's uncommitted work — `git status` showed only the four expected staged files immediately before commit, but the resulting commit contained 18 files (2996 insertions). Root cause was not identified. The structural fix is to give each parallel session its own working tree so that `git status`, the index, and the working directory are physically isolated. That is what this guide describes.

Don't try to skip the worktree by being "extra careful with `git add`" — the same approach failed once already, silently, in a way we couldn't reproduce.

## When this applies

- **Yes:** any time two Claude sessions are working on this repo at the same time, including doc-only changes, even if "file scopes don't overlap."
- **No:** sequential work (only one Claude session active at a time, even across days).

The presence of another session is the trigger, not the size or shape of the work.

## Setup (one-time per parallel session)

From the primary working tree (the original checkout at `/Users/kevinkane/Code/allen-kenoyer-redesign`):

```bash
git worktree add ../ak-<short-task-name> -b parallel/<task-name>
ln -s "$(pwd)/.env.local" ../ak-<short-task-name>/.env.local
cd ../ak-<short-task-name>
pnpm install
```

- `<task-name>` — short kebab-case identifier for the parallel work (e.g., `adr-0021-acceptance`, `pattern-migration-script`).
- Branch: prefix `parallel/` so parallel-session branches are visually distinct from feature branches.
- Worktree path: sibling of the primary tree, prefixed `ak-` to keep parallel checkouts visually grouped.
- `.env.local`: **symlink, not copy.** Either tree's edits update both; no syncing, no staleness. If the symlink is missing, scripts that read env vars (e.g., `pnpm migrate:images`) will fail in the worktree.
- `pnpm install`: required per-worktree. Pnpm's content-addressed store keeps disk cost low (mostly directory metadata).

Launch a Claude session from inside the new worktree:

```bash
cd ../ak-<short-task-name>
claude
```

## Sanity check before working

Run these two commands at session start. If either is wrong, stop and fix the worktree before doing any work.

```bash
git rev-parse --show-toplevel   # MUST print .../ak-<short-task-name>, not the primary tree path
git branch --show-current       # MUST print parallel/<task-name>
```

## While working

- **Dev server port:** primary tree uses `:3000`. Parallel worktree uses `:3001`: `pnpm dev -- -p 3001`.
- **Branch:** stay on `parallel/<task-name>` for the duration of the session. To move between trees, `cd` to a different worktree — don't `git checkout` inside one.
- **File scope:** with the worktree boundary, edit any file relevant to the task. Cross-tree contamination is structurally impossible.
- **Commits:** stage and commit as usual. Each commit lands on `parallel/<task-name>`.
- **Pushes:** first push: `git push -u origin parallel/<task-name>`. Thereafter: `git push`.
- **`pnpm check`:** the hard rule still applies — run it before pushing. It runs against the worktree's own files only.

## Convergence and cleanup

When the parallel work is done and pushed:

```bash
# From the primary tree:
cd /Users/kevinkane/Code/allen-kenoyer-redesign
git fetch
git merge --ff-only origin/parallel/<task-name>     # or open a PR and merge via GitHub
git push origin main
```

Once merged into `main`:

```bash
git worktree remove ../ak-<short-task-name>
git branch -d parallel/<task-name>
git push origin --delete parallel/<task-name>
```

Worktrees are first-class — `git worktree list` shows all active worktrees, `git worktree remove` cleans up a specific one.

## Per-session handoff doc

Kevin writes a per-session handoff doc when delegating parallel work. The handoff opens with these lines, filled in:

> Read `docs/parallel-claude-sessions.md` first.
>
> - **Branch:** `parallel/<task-name>`
> - **Worktree:** `../ak-<short-task-name>`
> - **Setup:** follow the setup commands in the guide.

After the header, the handoff describes the work items, scope, and any session-specific context (e.g., "the other Claude is working on Chunk B, don't touch `src/components/`"). The handoff doc is deleted as part of the final commit on the parallel branch.

## Gotchas

- **Vercel preview deploys:** both branches will get preview URLs from Vercel after their first push. That's fine; just be aware when reviewing.
- **`.agents/` skills:** committed to the repo, so both worktrees get the same skills. No per-worktree install needed.
- **Memory directory:** `~/.claude/projects/<encoded-path>/` is keyed by filesystem path, so the parallel session has its own memory directory (e.g., `-Users-kevinkane-Code-ak-<short-task-name>`). Usually desirable — independent context. If shared memory is wanted, symlink the parallel session's `memory/` to the primary's.
- **`.env.local` updates:** the symlink means a key added in one tree appears in the other automatically. Don't edit `.env.local` from the parallel session expecting it to be private to that session — it isn't.
- **CI runs on the parallel branch's push.** If `pnpm check` passes locally and CI fails on `parallel/<task-name>`, the failure is the parallel session's to fix on its branch before merge.
