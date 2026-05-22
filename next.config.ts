import type { NextConfig } from "next";

const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : undefined;

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Preserves WordPress's canonical URL form during migration (ADR-0018).
  trailingSlash: true,
  // Lets next/image fetch and optimize images from the Supabase Storage
  // public-read bucket (ADR-0007). The hostname is derived from
  // NEXT_PUBLIC_SUPABASE_URL so it matches whichever project is configured.
  images: supabaseHost
    ? {
        remotePatterns: [
          {
            protocol: "https",
            hostname: supabaseHost,
            pathname: "/storage/v1/object/public/site-images/**",
          },
        ],
      }
    : undefined,
};

export default nextConfig;
