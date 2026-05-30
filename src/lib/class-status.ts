// The four publication states a class can be in (ADR-0021 decision I). The
// status pill (list + detail) and the detail-page banner BOTH derive from
// `resolveClassStatus` so they can never drift — this is the "one shared
// visibility query result" the ADR requires. Mirrors the three-condition
// visibility rule in src/lib/visibility.ts, but resolves *which* condition
// fails rather than a bare boolean.
import type { Tables } from "@/types/database";

type ClassRow = Tables<"classes">;
type Cohort = Tables<"cohorts">;
type Session = Tables<"cohort_sessions">;

export type ClassStatusState =
  | "live"
  | "draft"
  | "hidden_no_cohort"
  | "hidden_no_sessions";

export interface ClassStatusInfo {
  state: ClassStatusState;
  /** Pill text. */
  label: string;
  /** True for the two `hidden_*` states — the detail banner shows only then. */
  isHidden: boolean;
}

const LABELS: Record<ClassStatusState, string> = {
  live: "Live",
  draft: "Draft",
  hidden_no_cohort: "Hidden — no published cohort",
  hidden_no_sessions: "Hidden — no upcoming sessions",
};

/** Pill text + hidden flag for a state. Shared by the resolver and the pill. */
export function classStatusInfo(state: ClassStatusState): ClassStatusInfo {
  return {
    state,
    label: LABELS[state],
    isHidden: state === "hidden_no_cohort" || state === "hidden_no_sessions",
  };
}

/**
 * Resolve a class's publication state from the class row plus its cohorts and
 * sessions. Order matters: a class is `draft` before we ask about cohorts, and
 * we only ask about sessions once a published cohort exists.
 */
export function resolveClassStatus(
  cls: Pick<ClassRow, "published">,
  cohorts: ReadonlyArray<Pick<Cohort, "id" | "published">>,
  sessions: ReadonlyArray<Pick<Session, "cohort_id" | "ends_at">>,
  now: Date = new Date(),
): ClassStatusInfo {
  if (!cls.published) return classStatusInfo("draft");

  const publishedCohortIds = new Set(
    cohorts.filter((c) => c.published).map((c) => c.id),
  );
  if (publishedCohortIds.size === 0) return classStatusInfo("hidden_no_cohort");

  const hasUpcoming = sessions.some(
    (s) => publishedCohortIds.has(s.cohort_id) && new Date(s.ends_at) > now,
  );
  if (!hasUpcoming) return classStatusInfo("hidden_no_sessions");

  return classStatusInfo("live");
}
