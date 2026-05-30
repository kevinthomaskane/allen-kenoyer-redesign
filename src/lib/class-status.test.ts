import { describe, expect, it } from "vitest";

import { resolveClassStatus } from "./class-status";

const NOW = new Date("2026-06-01T00:00:00Z");
const FUTURE = "2026-07-01T19:00:00Z";
const PAST = "2026-05-01T19:00:00Z";

describe("resolveClassStatus", () => {
  it("is draft when the class is unpublished, regardless of cohorts", () => {
    const status = resolveClassStatus(
      { published: false },
      [{ id: "c1", published: true }],
      [{ cohort_id: "c1", ends_at: FUTURE }],
      NOW,
    );
    expect(status.state).toBe("draft");
    expect(status.label).toBe("Draft");
    expect(status.isHidden).toBe(false);
  });

  it("is hidden_no_cohort when published but no published cohort exists", () => {
    const status = resolveClassStatus(
      { published: true },
      [{ id: "c1", published: false }],
      [{ cohort_id: "c1", ends_at: FUTURE }],
      NOW,
    );
    expect(status.state).toBe("hidden_no_cohort");
    expect(status.isHidden).toBe(true);
  });

  it("is hidden_no_sessions when a published cohort has no upcoming session", () => {
    const status = resolveClassStatus(
      { published: true },
      [{ id: "c1", published: true }],
      [{ cohort_id: "c1", ends_at: PAST }],
      NOW,
    );
    expect(status.state).toBe("hidden_no_sessions");
    expect(status.isHidden).toBe(true);
  });

  it("ignores upcoming sessions that belong to an unpublished cohort", () => {
    const status = resolveClassStatus(
      { published: true },
      [
        { id: "c1", published: true },
        { id: "c2", published: false },
      ],
      [{ cohort_id: "c2", ends_at: FUTURE }],
      NOW,
    );
    expect(status.state).toBe("hidden_no_sessions");
  });

  it("is live when published, with a published cohort and an upcoming session", () => {
    const status = resolveClassStatus(
      { published: true },
      [{ id: "c1", published: true }],
      [
        { cohort_id: "c1", ends_at: PAST },
        { cohort_id: "c1", ends_at: FUTURE },
      ],
      NOW,
    );
    expect(status.state).toBe("live");
    expect(status.label).toBe("Live");
    expect(status.isHidden).toBe(false);
  });
});
