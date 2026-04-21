import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /** Hide the floating Next.js dev indicator (N badge) — it overlaps mobile CTAs e.g. WhatsApp */
  devIndicators: false,
  /**
   * Dev: `.next-dev` avoids Windows `EPERM` on a locked `/.next/trace` (zombie node, AV).
   * Production / `next build` (incl. Vercel): must be `.next` — deploy hosts look for that path.
   * Override anytime with `NEXT_DIST_DIR` in env.
   */
  distDir:
    process.env.NEXT_DIST_DIR?.trim() ||
    (process.env.NODE_ENV === "production" ? ".next" : ".next-dev"),
  /** LAN access to dev server (phone / other PC) — add your IP if the warning shows another host. */
  allowedDevOrigins: ["192.168.68.114", "192.168.68.110"],
  images: {
    remotePatterns: [
      /** Supabase Storage public URLs (`*.supabase.co`) — does not depend on env at build. */
      {
        protocol: "https" as const,
        hostname: "**.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/l/:slug",
        destination: "/landing/:slug",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
