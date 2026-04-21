import { NextResponse } from "next/server";
import { getLandingPagePayload } from "@/lib/landing-pages";

export const dynamic = "force-dynamic";

type RouteParams = { params: Promise<{ slug: string }> };

export async function GET(_req: Request, { params }: RouteParams) {
  const { slug } = await params;
  const payload = await getLandingPagePayload(slug);
  if (!payload) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const product = payload.products[0] ?? null;
  return NextResponse.json({ ...payload, product });
}
