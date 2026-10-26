import type { NextConfig } from "next";
import { localizedSegments, siteUrl } from "./lib/routes";

// The production build answers on its *.vercel.app alias too; send those visits (and crawlers)
// to the real domain so search engines see a single site. Preview deployments are left alone.
const vercelAliasRedirect =
  process.env.VERCEL_ENV === "production" && !new URL(siteUrl).hostname.endsWith(".vercel.app")
    ? [{ source: "/:path*", has: [{ type: "host" as const, value: "(?<alias>.+)\\.vercel\\.app" }], destination: `${siteUrl}/:path*`, permanent: true }]
    : [];

const supabaseHost = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://example.supabase.co").hostname;

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [70, 80, 90],
    remotePatterns: [{ protocol: "https", hostname: supabaseHost, pathname: "/storage/v1/object/public/**" }],
  },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      { source: "/admin/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] },
    ];
  },
  // French pages use French URLs (/fr/equipe) that map onto the shared route
  // folders (/fr/team). The English-named French URLs redirect to the French ones.
  async rewrites() {
    return {
      beforeFiles: localizedSegments.flatMap(({ en, fr }) => [
        { source: `/fr/${fr}`, destination: `/fr/${en}` },
        { source: `/fr/${fr}/:path*`, destination: `/fr/${en}/:path*` },
      ]),
      afterFiles: [],
      fallback: [],
    };
  },
  async redirects() {
    return [
      ...vercelAliasRedirect,
      ...localizedSegments.flatMap(({ en, fr }) => [
        { source: `/fr/${en}`, destination: `/fr/${fr}`, permanent: true },
        { source: `/fr/${en}/:path*`, destination: `/fr/${fr}/:path*`, permanent: true },
        // French segment under /en (old links, hand-typed URLs) → the English page.
        { source: `/en/${fr}`, destination: `/en/${en}`, permanent: true },
        { source: `/en/${fr}/:path*`, destination: `/en/${en}/:path*`, permanent: true },
      ]),
    ];
  },
};

export default nextConfig;
