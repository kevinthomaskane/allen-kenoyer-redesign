// Site-images live in a single Supabase Storage bucket, mirrored from
// content/<slug>/images/<filename> to site-images/<slug>/<filename> by
// scripts/migrate-images.mjs per ADR-0007. This helper centralizes URL
// construction so every route uses the same pattern.

const PUBLIC_BASE = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/site-images`;

export function siteImageUrl(slug: string, filename: string): string {
  return `${PUBLIC_BASE}/${slug}/${filename}`;
}
