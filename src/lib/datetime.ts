// Display-only datetime formatting in the studio's timezone (dev-guide §
// Date/time handling). Storage is UTC `timestamptz`; these helpers convert to
// `America/Los_Angeles` for display via native `Intl.DateTimeFormat` — the
// DST-aware, dependency-free tool for formatting. Luxon is reserved for
// write-side wall-time→UTC conversion (task 04), never for display.
import { STUDIO_TZ } from "./site-config";

// Newer ICU (Node 24) inserts a narrow no-break space (U+202F) before AM/PM,
// and other locales use U+00A0. Normalize every Unicode space separator to a
// regular space so rendered output and tests stay predictable.
function normalize(formatted: string): string {
  return formatted.replace(/\p{Zs}/gu, " ");
}

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: STUDIO_TZ,
  month: "short",
  day: "numeric",
  year: "numeric",
});

const dateTimeFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: STUDIO_TZ,
  month: "short",
  day: "numeric",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

/** "Jun 1, 2026" in the studio timezone. */
export function formatStudioDate(iso: string): string {
  return normalize(dateFormatter.format(new Date(iso)));
}

/** "Jun 1, 2026, 6:00 PM" in the studio timezone. */
export function formatStudioDateTime(iso: string): string {
  return normalize(dateTimeFormatter.format(new Date(iso)));
}

/** Next-session column: the formatted datetime, or an em dash when null. */
export function formatNextSession(iso: string | null): string {
  return iso ? formatStudioDateTime(iso) : "—";
}
