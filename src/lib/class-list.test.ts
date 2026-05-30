import { describe, expect, it } from "vitest";

import {
  selectClassRows,
  type ClassListRow,
  type ClassListFilters,
} from "./class-list";

function row(overrides: Partial<ClassListRow>): ClassListRow {
  return {
    id: overrides.id ?? "id",
    name: overrides.name ?? "Class",
    slug: overrides.slug ?? "class",
    category: overrides.category ?? "stained_glass",
    skillLevel: overrides.skillLevel ?? "beginner",
    status: overrides.status ?? "live",
    nextSessionAt: overrides.nextSessionAt ?? null,
    updatedAt: overrides.updatedAt ?? "2026-01-01T00:00:00Z",
  };
}

const ids = (rows: ClassListRow[]) => rows.map((r) => r.id);

describe("selectClassRows default sort", () => {
  it("orders by next session ascending", () => {
    const rows = [
      row({ id: "late", nextSessionAt: "2026-07-01T00:00:00Z" }),
      row({ id: "soon", nextSessionAt: "2026-06-01T00:00:00Z" }),
    ];
    expect(ids(selectClassRows(rows))).toEqual(["soon", "late"]);
  });

  it("sinks rows with no upcoming session to the bottom", () => {
    const rows = [
      row({ id: "none", nextSessionAt: null }),
      row({ id: "upcoming", nextSessionAt: "2026-06-01T00:00:00Z" }),
    ];
    expect(ids(selectClassRows(rows))).toEqual(["upcoming", "none"]);
  });

  it("breaks ties (both no upcoming) by last-updated descending", () => {
    const rows = [
      row({
        id: "older",
        nextSessionAt: null,
        updatedAt: "2026-01-01T00:00:00Z",
      }),
      row({
        id: "newer",
        nextSessionAt: null,
        updatedAt: "2026-03-01T00:00:00Z",
      }),
    ];
    expect(ids(selectClassRows(rows))).toEqual(["newer", "older"]);
  });

  it("breaks an equal next-session tie by last-updated descending", () => {
    const when = "2026-06-01T00:00:00Z";
    const rows = [
      row({
        id: "older",
        nextSessionAt: when,
        updatedAt: "2026-01-01T00:00:00Z",
      }),
      row({
        id: "newer",
        nextSessionAt: when,
        updatedAt: "2026-02-01T00:00:00Z",
      }),
    ];
    expect(ids(selectClassRows(rows))).toEqual(["newer", "older"]);
  });
});

describe("selectClassRows filters (AND-combined)", () => {
  const rows = [
    row({
      id: "a",
      status: "live",
      category: "stained_glass",
      skillLevel: "beginner",
      name: "Copper Foil",
    }),
    row({
      id: "b",
      status: "draft",
      category: "mosaic",
      skillLevel: "advanced",
      name: "Mosaic Basics",
    }),
    row({
      id: "c",
      status: "live",
      category: "mosaic",
      skillLevel: "beginner",
      name: "Beveled Star",
    }),
  ];

  const select = (filters: ClassListFilters) =>
    ids(selectClassRows(rows, filters));

  it("treats 'all' / undefined as no constraint", () => {
    expect(select({}).sort()).toEqual(["a", "b", "c"]);
    expect(
      select({ status: "all", category: "all", skillLevel: "all" }).sort(),
    ).toEqual(["a", "b", "c"]);
  });

  it("filters by a single facet", () => {
    expect(select({ status: "live" }).sort()).toEqual(["a", "c"]);
    expect(select({ category: "mosaic" }).sort()).toEqual(["b", "c"]);
    expect(select({ skillLevel: "beginner" }).sort()).toEqual(["a", "c"]);
  });

  it("ANDs multiple facets together", () => {
    expect(select({ status: "live", category: "mosaic" })).toEqual(["c"]);
    expect(select({ category: "mosaic", skillLevel: "advanced" })).toEqual([
      "b",
    ]);
  });

  it("matches the name search case-insensitively as a substring", () => {
    expect(select({ search: "foil" })).toEqual(["a"]);
    expect(select({ search: "  STAR " })).toEqual(["c"]);
    expect(select({ search: "nope" })).toEqual([]);
  });

  it("combines search with facet filters", () => {
    // "co" matches only "Copper Foil"; narrowing to live keeps it.
    expect(select({ status: "live", search: "co" })).toEqual(["a"]);
    // "mosaic" matches "Mosaic Basics" (draft) — the live filter would exclude it.
    expect(select({ status: "draft", search: "mosaic" })).toEqual(["b"]);
    expect(select({ status: "live", search: "mosaic" })).toEqual([]);
  });
});
