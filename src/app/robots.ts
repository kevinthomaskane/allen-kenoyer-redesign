import type { MetadataRoute } from "next";

// Implements ADR-0019. Admin disallow is a hint to crawlers; real access
// control is the Supabase Auth gate (ADR-0006). Sitemap URL is fixed per
// ADR-0019; the sitemap route itself is added in Phase 1.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: "/admin/",
    },
    sitemap: "https://allenkenoyerglass.com/sitemap.xml",
  };
}
