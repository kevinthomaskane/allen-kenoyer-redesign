import { describe, expect, it } from "vitest";

import { slugify, uniqueSlug } from "./slug";

describe("slugify", () => {
  it("lowercases and hyphenates spaces", () => {
    expect(slugify("Beginning Copper Foil")).toBe("beginning-copper-foil");
  });

  it("strips punctuation and collapses separator runs", () => {
    expect(slugify("3-D Beveled Star!")).toBe("3-d-beveled-star");
    expect(slugify("Intermediate / Advanced Foil")).toBe(
      "intermediate-advanced-foil",
    );
    expect(slugify("Glass   &   Grout")).toBe("glass-grout");
  });

  it("trims leading and trailing separators", () => {
    expect(slugify("  Cutting Class  ")).toBe("cutting-class");
    expect(slugify("!!!Mosaics!!!")).toBe("mosaics");
  });

  it("strips diacritics to ASCII", () => {
    expect(slugify("Café Étude")).toBe("cafe-etude");
  });

  it("falls back when a name has no alphanumerics", () => {
    expect(slugify("???")).toBe("class");
    expect(slugify("")).toBe("class");
  });
});

describe("uniqueSlug", () => {
  it("returns the base slug when nothing collides", () => {
    expect(uniqueSlug("Fused Glass", [])).toBe("fused-glass");
    expect(uniqueSlug("Fused Glass", ["copper-foil"])).toBe("fused-glass");
  });

  it("appends an incrementing suffix on collision", () => {
    expect(uniqueSlug("Copper Foil", ["copper-foil"])).toBe("copper-foil-2");
    expect(uniqueSlug("Copper Foil", ["copper-foil", "copper-foil-2"])).toBe(
      "copper-foil-3",
    );
  });

  it("skips gaps in the taken set deterministically", () => {
    // -2 is free even though -3 is taken: first free wins.
    expect(uniqueSlug("Copper Foil", ["copper-foil", "copper-foil-3"])).toBe(
      "copper-foil-2",
    );
  });
});
