import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * Default `.next-dev` avoids Windows `EPERM` on a locked `/.next/trace` (zombie node, AV).
   * Override with `NEXT_DIST_DIR=.next` in `.env.local` if you need the default folder name.
   */
  distDir: process.env.NEXT_DIST_DIR?.trim() || ".next-dev",
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
