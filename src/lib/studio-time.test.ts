import { describe, expect, it } from "vitest";

import {
  formatStudioDateTime,
  nowWallTimeInput,
  utcToWallTimeInput,
  wallTimeToUtc,
} from "./studio-time";

// STUDIO_TZ is America/Los_Angeles: PDT (UTC-7) in summer, PST (UTC-8) in winter.
// These assertions prove the conversion is DST-aware rather than a fixed offset.
describe("wallTimeToUtc", () => {
  it("applies the summer (PDT, UTC-7) offset", () => {
    expect(wallTimeToUtc("2026-07-01T12:00")).toBe("2026-07-01T19:00:00.000Z");
  });

  it("applies the winter (PST, UTC-8) offset", () => {
    expect(wallTimeToUtc("2026-01-01T12:00")).toBe("2026-01-01T20:00:00.000Z");
  });

  it("throws on an unparseable wall time", () => {
    expect(() => wallTimeToUtc("not-a-date")).toThrow();
  });
});

describe("utcToWallTimeInput", () => {
  it("renders a stored UTC instant as a studio-local datetime-local value", () => {
    expect(utcToWallTimeInput("2026-07-01T19:00:00.000Z")).toBe(
      "2026-07-01T12:00",
    );
  });

  it("round-trips with wallTimeToUtc across a DST boundary", () => {
    for (const wall of ["2026-07-01T12:00", "2026-01-01T12:00"]) {
      expect(utcToWallTimeInput(wallTimeToUtc(wall))).toBe(wall);
    }
  });
});

describe("nowWallTimeInput", () => {
  it("formats an injected instant in STUDIO_TZ as a datetime-local value", () => {
    // 2026-07-01T19:00Z is noon PDT.
    expect(nowWallTimeInput(new Date("2026-07-01T19:00:00.000Z"))).toBe(
      "2026-07-01T12:00",
    );
  });
});

describe("formatStudioDateTime", () => {
  it("renders a UTC instant in studio-local time", () => {
    // Asserts the studio-local hour (noon), not the locale-specific punctuation.
    expect(formatStudioDateTime("2026-07-01T19:00:00.000Z")).toContain("12:00");
    expect(formatStudioDateTime("2026-07-01T19:00:00.000Z")).toContain("PM");
  });
});
