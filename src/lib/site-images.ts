import manifest from "../../content/manifest.json";

// Site-images live in a single Supabase Storage bucket, mirrored from
// content/<slug>/images/<filename> to site-images/<slug>/<filename> by
// scripts/migrate-images.mjs per ADR-0007. This helper centralizes URL
// construction and alt-text lookup so every route uses the same pattern.

const PUBLIC_BASE = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/site-images`;

type ManifestEntry = {
  file: string;
  alt: string | null;
};

const altLookup = buildAltLookup(manifest as ManifestEntry[]);

function buildAltLookup(entries: ManifestEntry[]): Map<string, string> {
  const map = new Map<string, string>();
  for (const entry of entries) {
    if (!entry.alt) continue;
    const parts = entry.file.split("/");
    // content/<slug>/.../images/<filename> → key "<slug>/<filename>"
    const filename = parts[parts.length - 1];
    const slug = parts[1];
    map.set(`${slug}/${filename}`, entry.alt);
  }
  return map;
}

export function siteImageUrl(slug: string, filename: string): string {
  return `${PUBLIC_BASE}/${slug}/${filename}`;
}

// Looks up alt text from the migration manifest. Returns undefined when the
// manifest's alt is null — callers should provide a fallback (use "" for
// purely decorative images, otherwise a descriptive string).
export function manifestAlt(
  slug: string,
  filename: string,
): string | undefined {
  return altLookup.get(`${slug}/${filename}`);
}
