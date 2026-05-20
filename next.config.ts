import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Preserves WordPress's canonical URL form during migration (ADR-0018).
  trailingSlash: true,
};

export default nextConfig;
