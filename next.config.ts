import type { NextConfig } from "next";
import { localizedSegments } from "./lib/routes";

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
    return localizedSegments.flatMap(({ en, fr }) => [
      { source: `/fr/${en}`, destination: `/fr/${fr}`, permanent: true },
      { source: `/fr/${en}/:path*`, destination: `/fr/${fr}/:path*`, permanent: true },
    ]);
  },
};

export default nextConfig;
