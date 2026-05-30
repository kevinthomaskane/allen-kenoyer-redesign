import { describe, expect, it } from "vitest";

import {
  formatNextSession,
  formatStudioDate,
  formatStudioDateTime,
} from "./datetime";

describe("studio-timezone formatting", () => {
  // 2026-06-01T02:30:00Z is PDT (UTC-7) → 2026-05-31 19:30 local.
  const instant = "2026-06-01T02:30:00Z";

  it("formats a date in the studio zone", () => {
    expect(formatStudioDate(instant)).toBe("May 31, 2026");
  });

  it("formats a datetime in the studio zone with a plain ASCII space", () => {
    // The exact equality also pins the AM/PM separator to a normal space,
    // proving the ICU narrow-no-break-space normalization in `normalize`.
    expect(formatStudioDateTime(instant)).toBe("May 31, 2026, 7:30 PM");
  });
});

describe("formatNextSession", () => {
  it("renders an em dash for a null session", () => {
    expect(formatNextSession(null)).toBe("—");
  });

  it("formats a present session", () => {
    expect(formatNextSession("2026-06-01T02:30:00Z")).toBe(
      "May 31, 2026, 7:30 PM",
    );
  });
});
