// Pure visibility predicates for the public site, derived from the row shapes
// in src/types/database.ts. RLS (ADR-0006) provides the published-row baseline
// at the database; these encode the full content-visibility rules
// (ADR-0015 three-condition class rule, ADR-0016 bulletin display window) for
// the application query + admin status display. Consumed by task 03 (status
// pill) and task 07 (public reads). Kept pure and `now`-injectable for testing.
import type { Tables } from "@/types/database";

type Bulletin = Tables<"bulletins">;
type ClassRow = Tables<"classes">;
type Cohort = Tables<"cohorts">;
type Session = Tables<"cohort_sessions">;

/**
 * The four admin-facing bulletin states (ADR-0016 + its "published but not
 * visible yet" tradeoff note). `published` intent and the display window combine
 * into one of these; the admin UI must make each unambiguous.
 *
 * - `draft`    — not published (window irrelevant).
 * - `queued`   — published, but `display_start` is still in the future.
 * - `expired`  — published, but `display_end` has passed.
 * - `visible`  — published and currently within its display window.
 */
export type BulletinStatus = "draft" | "queued" | "visible" | "expired";

export function bulletinStatus(
  bulletin: Pick<Bulletin, "published" | "display_start" | "display_end">,
  now: Date = new Date(),
): BulletinStatus {
  if (!bulletin.published) return "draft";
  if (new Date(bulletin.display_start) > now) return "queued";
  if (bulletin.display_end !== null && new Date(bulletin.display_end) <= now) {
    return "expired";
  }
  return "visible";
}

/**
 * ADR-0016: a bulletin is visible iff published, started, and not yet ended.
 * A null `display_end` means open-ended. Delegates to `bulletinStatus` so the
 * boolean and the four-state classifier can never disagree.
 */
export function isBulletinVisible(
  bulletin: Pick<Bulletin, "published" | "display_start" | "display_end">,
  now: Date = new Date(),
): boolean {
  return bulletinStatus(bulletin, now) === "visible";
}

/** A session counts as upcoming while it has not yet ended. */
export function isSessionUpcoming(
  session: Pick<Session, "ends_at">,
  now: Date = new Date(),
): boolean {
  return new Date(session.ends_at) > now;
}

/**
 * ADR-0015 three-condition rule: a class is publicly visible iff the class is
 * published AND it has at least one published cohort AND that cohort has at
 * least one session that has not yet ended.
 */
export function isClassVisible(
  cls: Pick<ClassRow, "published">,
  cohorts: ReadonlyArray<Pick<Cohort, "id" | "published">>,
  sessions: ReadonlyArray<Pick<Session, "cohort_id" | "ends_at">>,
  now: Date = new Date(),
): boolean {
  if (!cls.published) return false;
  const publishedCohortIds = new Set(
    cohorts.filter((c) => c.published).map((c) => c.id),
  );
  if (publishedCohortIds.size === 0) return false;
  return sessions.some(
    (s) => publishedCohortIds.has(s.cohort_id) && new Date(s.ends_at) > now,
  );
}
