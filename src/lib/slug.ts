// Class slugs are auto-derived from `name` on every save and are not
// admin-editable (ADR-0015). Kebab-case, stripped of non-alphanumerics.
// `slugify` is the pure derivation; `uniqueSlug` resolves collisions against
// the slugs already taken by *other* classes so a duplicate name doesn't
// violate the `classes.slug` unique constraint.

const FALLBACK_SLUG = "class";

/** Kebab-case a name: lowercase, diacritics stripped, non-alphanumerics → `-`. */
export function slugify(name: string): string {
  const slug = name
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "") // strip combining diacritics
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-") // runs of non-alphanumerics → single hyphen
    .replace(/^-+|-+$/g, ""); // trim leading/trailing hyphens
  return slug || FALLBACK_SLUG;
}

/**
 * Derive a slug from `name` that does not collide with `takenSlugs` (the slugs
 * of all *other* classes). On collision, append `-2`, `-3`, … until free.
 */
export function uniqueSlug(name: string, takenSlugs: Iterable<string>): string {
  const base = slugify(name);
  const taken = new Set(takenSlugs);
  if (!taken.has(base)) return base;
  let n = 2;
  while (taken.has(`${base}-${n}`)) n += 1;
  return `${base}-${n}`;
}
