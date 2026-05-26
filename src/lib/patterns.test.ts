import { describe, expect, it } from "vitest";
import {
  PATTERN_CATEGORIES,
  getPatternsByCategory,
  patternAlt,
  patterns,
  type PatternCategory,
} from "./patterns";

const EXPECTED_COUNTS: Record<PatternCategory, number> = {
  beginner: 58,
  intermediate: 50,
  advanced: 38,
  "mirrors-and-frames": 19,
};

describe("patterns catalog", () => {
  it("contains 165 records", () => {
    expect(patterns).toHaveLength(165);
  });

  it.each(PATTERN_CATEGORIES)(
    "has the expected count for $slug",
    ({ slug }) => {
      const count = patterns.filter((p) => p.category === slug).length;
      expect(count).toBe(EXPECTED_COUNTS[slug]);
    },
  );

  // ADR-0017 Amendment 2026-05-26: uniqueness is per-category, not catalog-wide.
  it("enforces (category, number) uniqueness", () => {
    const keys = patterns.map((p) => `${p.category}/${p.number}`);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("uses .gif or .jpg image extensions", () => {
    for (const p of patterns) {
      expect(p.image).toMatch(/\.(gif|jpg)$/);
    }
  });

  it("uses positive prices in USD", () => {
    for (const p of patterns) {
      expect(p.price).toBeGreaterThan(0);
    }
  });
});

describe("getPatternsByCategory", () => {
  it("sorts natural-numeric ascending per ADR-0017", () => {
    const beginner = getPatternsByCategory("beginner");
    const numbers = beginner.map((p) => p.number);
    // "9" < "10" < "102" < "102C" — Intl.Collator with numeric: true.
    const sorted = [...numbers].sort(
      new Intl.Collator(undefined, { numeric: true, sensitivity: "base" })
        .compare,
    );
    expect(numbers).toEqual(sorted);
  });

  it("returns only the requested category", () => {
    const advanced = getPatternsByCategory("advanced");
    for (const p of advanced) expect(p.category).toBe("advanced");
  });
});

describe("patternAlt", () => {
  it("derives a default alt from category label and number", () => {
    const p = patterns.find(
      (q) => q.number === "102C" && q.category === "beginner",
    )!;
    expect(patternAlt(p)).toBe("Beginner pattern #102C");
  });

  it("respects an explicit alt override", () => {
    expect(patternAlt({ ...patterns[0], alt: "custom" })).toBe("custom");
  });
});
