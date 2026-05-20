# ADR-0013: Testing strategy

- **Status:** Accepted
- **Date:** 2026-05-19
- **Deciders:** Kevin Kane

## Context

This is a single-developer client project with two distinct surfaces:

- **Public marketing pages** — content-heavy, mostly static, low complexity per page. Visual regressions are caught by eye; logic regressions are rare.
- **Admin dashboard** — real data mutations via Server Actions writing to Supabase. The "if this breaks, the client notices" surface: a broken class form, an unsigned bulletin post, an auth bypass would all be visible problems.

The testing question is "what's worth automating" given a single-developer maintenance posture and a project where shipping fast matters more than coverage absolutism.

## Options considered

- **A — No automated tests, manual QA only.** Defensible for a small project; "no tests" is a recorded decision.
- **B — Vitest for server-side logic only.** Unit tests for Zod schemas, Server Action handlers, helpers. Fast, narrow coverage.
- **C — Vitest + targeted Playwright.** Unit tests plus E2E for critical user journeys (admin login, class CRUD, bulletin CRUD, public contact form). Real safety net against regressions.
- **D — Comprehensive: Vitest + Playwright + component tests + coverage targets.** Overkill for this scope.

## Decision

Five bundled calls:

1. **Approach:** Option C — Vitest for server-side logic + targeted Playwright for critical E2E flows.
2. **Unit/integration test runner:** Vitest (latest: `vitest@4.1.6`).
3. **E2E test runner:** Playwright (`@playwright/test@1.60.0`).
4. **CI:** Tests run in GitHub Actions on PR and on push to `main`. PRs are blocked on failing tests.
5. **No formal coverage target.** Tests focus on the surfaces where regressions matter (Server Actions, Zod schemas, critical user flows) rather than a coverage percentage.

**Critical Playwright flows** (initial list; refined during implementation):
- Admin login (valid creds, invalid creds, password reset trigger)
- Admin creates a class → publishes → appears on public classes page
- Admin creates a bulletin → publishes → appears on homepage; expires by display date
- Public contact form submission → validates → triggers email (mocked or hits Resend test mode)

**Test colocation conventions** (dev-guide level):
- Vitest tests live next to the code they test (e.g., `lib/auth/session.ts` + `lib/auth/session.test.ts`).
- Playwright E2E tests live in a top-level `e2e/` directory.

**Test environment for Playwright E2E:** runs against a dedicated Supabase environment, *not* production. Specific approach (local `supabase start` in CI, Supabase branching, or a separate "test" project) is dev-guide level — to be decided when implementing the GitHub Actions workflow.

**CI workflow scope:** the test-runner GitHub Action is a separate workflow file from the Supabase migration deployment Action defined in [ADR-0005](./0005-database-and-query-layer.md). Test workflow runs on PR; migration workflow runs on merge to `main`.

## Rationale

- **Option C matches the project's risk profile.** The admin dashboard's data-mutation surface is exactly where silent bugs would cause visible client-facing problems. Server Action unit tests + E2E for the critical user flows hit those failure modes directly without requiring comprehensive coverage of static marketing pages.
- **Vitest over Jest** because it's the modern default in TypeScript-first Next.js projects in 2026: faster, ESM-native, simpler config, no Babel/SWC setup.
- **Playwright over Cypress** because Playwright has become the standard for new projects: better TypeScript support, multi-browser by default, faster, cleaner trace viewer. Cypress would work too but has no advantage here.
- **CI gates the value of the tests.** Tests that only run when remembered are worse than no tests at all — they create a false sense of safety. PR-gating means tests actually run.
- **No coverage target** because chasing a number incentivizes the wrong tests. "Every Server Action has at least one test; every critical user flow has an E2E test" is the actual quality bar; coverage percentage is a lagging indicator at best and a Goodhart's-law trap at worst.

## Tradeoffs accepted

- **No component tests.** React component rendering, prop logic, and interaction details are not unit-tested. Acceptable; shadcn primitives are already battle-tested upstream, and our compositions are simple enough that visual / E2E coverage catches the meaningful issues.
- **No visual regression tests.** A pixel-level CSS change that breaks a marketing page layout would not be caught automatically. Acceptable for a project of this scope; revisit if the design system grows in complexity.
- **E2E tests are slower and more brittle** than unit tests. Flaky tests waste CI time and erode trust in the suite. Mitigation: keep the Playwright suite small (focused on critical flows only) and invest in stability rather than coverage.
- **CI adds a process gate** on every PR. Slightly slower velocity than no-CI. Acceptable for the regression-prevention value.
- **Test infrastructure (Supabase test environment) is dev-guide work to be done.** The ADR locks the intent but defers the implementation choice. Acceptable; the implementation has multiple viable options that don't need pre-deciding.

## Related decisions

- Depends on: [ADR-0001](./0001-frontend-framework.md) (testing patterns are App Router-shaped), [ADR-0005](./0005-database-and-query-layer.md) (test environment uses a Supabase setup), [ADR-0009](./0009-forms-and-validation.md) (Zod schemas are unit-test targets), [ADR-0010](./0010-form-submission-and-transactional-email.md) (contact form E2E touches Resend test mode).
- Influences: GitHub Actions configuration (test workflow + the migration workflow from [ADR-0005](./0005-database-and-query-layer.md) coexist), dev-guide conventions for test colocation and Playwright environment.
