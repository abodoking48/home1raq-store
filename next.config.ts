import type { NextConfig } from "next";

/**
 * `.next-dev` is only for local `next dev` (Windows EPERM on `.next/trace`).
 * Do not use `NODE_ENV` alone: `next.config` can load before the CLI sets it, so Vercel
 * would keep emitting to `.next-dev` while the platform expects `.next`.
 */
function resolveDistDir(): string {
  const fromEnv = process.env.NEXT_DIST_DIR?.trim();
  if (fromEnv) return fromEnv;
  if (process.env.VERCEL) return ".next";
  if (process.env.npm_lifecycle_event === "dev") return ".next-dev";
  const argv = process.argv;
  const isNextDevCli =
    argv.includes("dev") && !argv.includes("build") && !argv.includes("start");
  if (isNextDevCli) return ".next-dev";
  return ".next";
}

const nextConfig: NextConfig = {
  /** Hide the floating Next.js dev indicator (N badge) — it overlaps mobile CTAs e.g. WhatsApp */
  devIndicators: false,
  distDir: resolveDistDir(),
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
