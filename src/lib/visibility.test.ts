import { describe, expect, it } from "vitest";

import { isBulletinVisible, isClassVisible } from "./visibility";

const NOW = new Date("2026-06-01T12:00:00Z");
const PAST = "2026-05-01T12:00:00Z";
const FUTURE = "2026-07-01T12:00:00Z";

describe("isBulletinVisible", () => {
  it("hides a draft bulletin even when in window", () => {
    expect(
      isBulletinVisible(
        { published: false, display_start: PAST, display_end: FUTURE },
        NOW,
      ),
    ).toBe(false);
  });

  it("shows a published bulletin within its window", () => {
    expect(
      isBulletinVisible(
        { published: true, display_start: PAST, display_end: FUTURE },
        NOW,
      ),
    ).toBe(true);
  });

  it("hides a published bulletin whose start is in the future (queued)", () => {
    expect(
      isBulletinVisible(
        { published: true, display_start: FUTURE, display_end: null },
        NOW,
      ),
    ).toBe(false);
  });

  it("hides a published bulletin whose end has passed (expired)", () => {
    expect(
      isBulletinVisible(
        { published: true, display_start: PAST, display_end: PAST },
        NOW,
      ),
    ).toBe(false);
  });

  it("shows an open-ended bulletin (null display_end) once started", () => {
    expect(
      isBulletinVisible(
        { published: true, display_start: PAST, display_end: null },
        NOW,
      ),
    ).toBe(true);
  });
});

describe("isClassVisible", () => {
  const cohorts = [
    { id: "c1", published: true },
    { id: "c2", published: false },
  ];

  it("hides a draft class", () => {
    expect(
      isClassVisible(
        { published: false },
        cohorts,
        [{ cohort_id: "c1", ends_at: FUTURE }],
        NOW,
      ),
    ).toBe(false);
  });

  it("hides a published class with no published cohort", () => {
    expect(
      isClassVisible(
        { published: true },
        [{ id: "c2", published: false }],
        [{ cohort_id: "c2", ends_at: FUTURE }],
        NOW,
      ),
    ).toBe(false);
  });

  it("hides a published class whose published cohort has only past sessions", () => {
    expect(
      isClassVisible(
        { published: true },
        cohorts,
        [{ cohort_id: "c1", ends_at: PAST }],
        NOW,
      ),
    ).toBe(false);
  });

  it("ignores future sessions that belong to a draft cohort", () => {
    expect(
      isClassVisible(
        { published: true },
        cohorts,
        [{ cohort_id: "c2", ends_at: FUTURE }],
        NOW,
      ),
    ).toBe(false);
  });

  it("shows a published class with a published cohort and a future session", () => {
    expect(
      isClassVisible(
        { published: true },
        cohorts,
        [
          { cohort_id: "c1", ends_at: PAST },
          { cohort_id: "c1", ends_at: FUTURE },
        ],
        NOW,
      ),
    ).toBe(true);
  });
});
