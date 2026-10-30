import { NextResponse } from "next/server";
import { ensureProductOg } from "@/lib/og-image";
import { prisma } from "@/lib/prisma";
import { SITE_URL } from "@/lib/site";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

/**
 * Fallback only: pages point og:image at the stored JPEG in Supabase Storage (see `ensureProductOg`).
 * Old shares and pages rendered before the file existed land here; make sure the file exists and
 * redirect to it.
 */
export async function GET(_req: Request, ctx: RouteContext) {
  const { id } = await ctx.params;
  const product = await prisma.product.findFirst({
    where: { id, active: true },
    select: { id: true, images: true },
  });
  const og = product ? await ensureProductOg(product) : null;
  const res = NextResponse.redirect(og?.url ?? `${SITE_URL}/opengraph-image`, 302);
  res.headers.set("Cache-Control", "public, max-age=3600, s-maxage=86400");
  return res;
}
