// Pure sort/filter/search for the /admin/classes rich list (ADR-0021 decision
// J). The page derives a `ClassListRow[]` from the classes + cohorts + sessions
// query (status via resolveClassStatus, nextSessionAt via the visibility rule),
// then this module orders and narrows them. Kept pure so the ordering and the
// AND-combined filters are unit-testable over fixtures.
import type { Enums } from "@/types/database";

import type { ClassStatusState } from "./class-status";

export interface ClassListRow {
  id: string;
  name: string;
  slug: string;
  category: Enums<"class_category">;
  skillLevel: Enums<"skill_level">;
  status: ClassStatusState;
  /** ISO timestamp of the earliest upcoming *visible* session, or null. */
  nextSessionAt: string | null;
  /** Studio-tz display of `nextSessionAt`, or an em dash. Formatted server-side. */
  nextSessionLabel: string;
  /** ISO timestamp; tiebreaker for the default sort. */
  updatedAt: string;
  /** Studio-tz display of `updatedAt`. Formatted server-side. */
  updatedLabel: string;
}

export interface ClassListFilters {
  status?: ClassStatusState | "all";
  category?: Enums<"class_category"> | "all";
  skillLevel?: Enums<"skill_level"> | "all";
  /** Free-text, matched case-insensitively as a substring of the name. */
  search?: string;
}

/**
 * Default sort (ADR-0021 J): Next session ascending; rows with no upcoming
 * session sink to the bottom; ties broken by Last updated descending.
 */
export function compareClassRows(a: ClassListRow, b: ClassListRow): number {
  const aHas = a.nextSessionAt !== null;
  const bHas = b.nextSessionAt !== null;

  if (aHas && bHas) {
    const delta =
      new Date(a.nextSessionAt!).getTime() -
      new Date(b.nextSessionAt!).getTime();
    if (delta !== 0) return delta;
  } else if (aHas !== bHas) {
    return aHas ? -1 : 1; // a row with an upcoming session sorts first
  }

  // Both have the same next session, or both have none: most-recently-updated first.
  return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
}

function matches(row: ClassListRow, filters: ClassListFilters): boolean {
  if (
    filters.status &&
    filters.status !== "all" &&
    row.status !== filters.status
  ) {
    return false;
  }
  if (
    filters.category &&
    filters.category !== "all" &&
    row.category !== filters.category
  ) {
    return false;
  }
  if (
    filters.skillLevel &&
    filters.skillLevel !== "all" &&
    row.skillLevel !== filters.skillLevel
  ) {
    return false;
  }
  const query = filters.search?.trim().toLowerCase();
  if (query && !row.name.toLowerCase().includes(query)) {
    return false;
  }
  return true;
}

/**
 * Apply the AND-combined filters + name search, then the default sort. Does not
 * mutate the input array.
 */
export function selectClassRows(
  rows: readonly ClassListRow[],
  filters: ClassListFilters = {},
): ClassListRow[] {
  return rows.filter((row) => matches(row, filters)).sort(compareClassRows);
}
