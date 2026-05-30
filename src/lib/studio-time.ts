// Studio-timezone date/time helpers (dev-guide § Date/time handling).
//
// Storage is UTC; the studio works in a single hardcoded wall-clock zone
// (STUDIO_TZ). Conversion happens only at the boundaries — Kristin's wall-clock
// input → UTC on write, UTC → studio-local on display.
//
// Library split (dev-guide): Luxon does the DST-aware wall-time↔UTC conversion;
// native Intl.DateTimeFormat does human display. Luxon is *not* used as a general
// formatting layer.
//
// This module was first landed by task 05 (bulletins display windows); task 04
// (cohorts & sessions) extends it with recurrence stepping per ADR-0021 D.
import { DateTime } from "luxon";

import { STUDIO_TZ } from "@/lib/site-config";

// The `value` shape of an <input type="datetime-local"> — wall-clock, no zone.
const INPUT_FORMAT = "yyyy-MM-dd'T'HH:mm";

/**
 * Interpret a `datetime-local` value (e.g. "2026-06-01T18:00") as a wall-clock
 * time in STUDIO_TZ and return the corresponding UTC instant as an ISO string,
 * suitable for storage in a `timestamptz` column. Throws on an unparseable value.
 */
export function wallTimeToUtc(wallTime: string): string {
  const dt = DateTime.fromISO(wallTime, { zone: STUDIO_TZ });
  if (!dt.isValid) {
    throw new Error(`Invalid studio wall time: ${wallTime}`);
  }
  // toISO() is non-null once the DateTime is valid.
  return dt.toUTC().toISO()!;
}

/**
 * Convert a stored UTC ISO timestamp to a `datetime-local` value in STUDIO_TZ,
 * for prefilling an <input type="datetime-local"> on edit.
 */
export function utcToWallTimeInput(utcIso: string): string {
  return DateTime.fromISO(utcIso, { zone: "utc" })
    .setZone(STUDIO_TZ)
    .toFormat(INPUT_FORMAT);
}

/**
 * The current time as a `datetime-local` value in STUDIO_TZ — used to default
 * the bulletin `display_start` control to "now" (ADR-0016).
 */
export function nowWallTimeInput(now: Date = new Date()): string {
  return DateTime.fromJSDate(now).setZone(STUDIO_TZ).toFormat(INPUT_FORMAT);
}

/**
 * Human-readable studio-local rendering of a stored UTC timestamp, via native
 * Intl (DST-aware). E.g. "Jun 1, 2026, 6:00 PM".
 */
export function formatStudioDateTime(utcIso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: STUDIO_TZ,
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(utcIso));
}

/**
 * Studio-local date only, via native Intl. E.g. "Jun 1, 2026". Used by the
 * class list's Last-updated column (task 03).
 */
export function formatStudioDate(utcIso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: STUDIO_TZ,
    dateStyle: "medium",
  }).format(new Date(utcIso));
}
