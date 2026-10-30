import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminUser } from "@/lib/auth/admin";
import { recompressBatch } from "@/lib/images/recompress";

export const runtime = "nodejs";
/** One batch downloads, compresses and re-uploads a few products' images. */
export const maxDuration = 60;

const bodySchema = z.object({
  dryRun: z.boolean(),
  cursor: z.object({ kind: z.enum(["product", "category", "landing"]), after: z.string() }).nullable(),
});

export async function POST(req: Request) {
  if (!(await getAdminUser())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  try {
    return NextResponse.json(await recompressBatch(parsed.data.cursor, parsed.data.dryRun));
  } catch (e) {
    console.error("[admin/images/recompress]", e);
    return NextResponse.json({ error: e instanceof Error ? e.message : "Recompress failed" }, { status: 500 });
  }
}
