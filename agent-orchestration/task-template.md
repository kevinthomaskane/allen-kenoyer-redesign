---
id: <slug-matching-filename-without-extension>
title: <human-readable task title>
phase: <phase number, e.g., 2>
status: todo  # todo | in-progress | done | blocked
depends_on: []  # [task-ids]; empty if none
adrs_realized: []  # [adr-numbers, e.g., 0006, 0015]
---

# <Title>

## Goal

<1–2 sentences describing what this task accomplishes and why.>

## Context

<Anything the agent needs to know that isn't covered by cited ADRs, dev-guide
sections, or prior task resolutions. Skip this section if the goal + ADR refs
are self-sufficient.>

## Scope (in)

- <item 1>
- <item 2>

## Scope (out)

- <explicit non-goals; reference the task or phase where they land>

## Test specs

- <Vitest: `path/to/file.test.ts` covering cases X, Y, Z>
- <Playwright: `e2e/route.spec.ts` covering …>

## Exit criteria

- <demonstrable condition 1, e.g., `pnpm check` passes>
- <demonstrable condition 2>

## Resolution

_Appended on completion. Document what shipped, any in-flight decisions or
deviations, and the PR link._
