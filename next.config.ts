import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /** Hide the floating Next.js dev indicator (N badge) — it overlaps mobile CTAs e.g. WhatsApp */
  devIndicators: false,
  /**
   * Always default to `.next` so Vercel (and any host) always finds the build output.
   * For Windows `EPERM` on `.next/trace` during **local dev only**, create `.env.development.local`
   * (not `.env.local` — that file is also loaded by `next build`) with:
   * `NEXT_DIST_DIR=.next-dev`
   * Never set `NEXT_DIST_DIR=.next-dev` in Vercel project env.
   */
  distDir: process.env.NEXT_DIST_DIR?.trim() || ".next",
  /** LAN access to dev server (phone / other PC) — add your IP if the warning shows another host. */
  allowedDevOrigins: ["192.168.68.114", "192.168.68.110"],
  images: {
    minimumCacheTTL: 3600,
    /** Allow `quality={80}` on `<Image>`; default whitelist is [75]. */
    qualities: [75, 80],
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
    formats: ["image/avif", "image/webp"],
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
