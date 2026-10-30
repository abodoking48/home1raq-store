import { NextResponse } from "next/server";
import sharp from "sharp";
import { OG_IMAGE } from "@/lib/og";
import { prisma } from "@/lib/prisma";
import { SITE_URL } from "@/lib/site";

export const runtime = "nodejs";

/** WhatsApp drops previews whose image is much over ~300 KB. */
const MAX_BYTES = 250 * 1024;
const BRAND_BG = "#020403";
const BRAND_NEON = "#00FF88";
const ACCENT_HEIGHT = 10;

type RouteContext = { params: Promise<{ id: string }> };

/**
 * Link-preview image for a product: its first photo, letterboxed on a blurred copy of itself,
 * as a 1200×630 JPEG small enough for WhatsApp. The Supabase originals can be multi-MB PNGs.
 * The URL carries `?v=<updatedAt>` (see `productOgImageUrl`), so it can be cached for a long time.
 */
export async function GET(_req: Request, ctx: RouteContext) {
  const { id } = await ctx.params;
  const product = await prisma.product.findFirst({
    where: { id, active: true },
    select: { images: true },
  });
  const source = product?.images[0];
  if (!source) return fallback();

  let original: Buffer;
  try {
    const res = await fetch(source, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return fallback();
    original = Buffer.from(await res.arrayBuffer());
  } catch {
    return fallback();
  }

  try {
    const jpeg = await render(original);
    return new NextResponse(new Uint8Array(jpeg), {
      headers: {
        "Content-Type": OG_IMAGE.type,
        "Content-Length": String(jpeg.length),
        "Cache-Control": "public, max-age=86400, s-maxage=31536000, immutable",
      },
    });
  } catch (e) {
    console.error("[og/product]", id, e);
    return fallback();
  }
}

async function render(original: Buffer) {
  const { width, height } = OG_IMAGE;
  const photoHeight = height - ACCENT_HEIGHT;
  const input = sharp(original, { failOn: "none" }).rotate();

  const [backdrop, photo] = await Promise.all([
    input
      .clone()
      .resize(width, photoHeight, { fit: "cover" })
      .blur(28)
      .modulate({ brightness: 0.45 })
      .toBuffer(),
    input
      .clone()
      .resize(width - 80, photoHeight - 40, { fit: "inside", withoutEnlargement: false })
      .toBuffer(),
  ]);

  const canvas = sharp({
    create: { width, height, channels: 3, background: BRAND_BG },
  }).composite([
    { input: backdrop, top: 0, left: 0 },
    { input: photo, gravity: "center" },
    {
      input: { create: { width, height: ACCENT_HEIGHT, channels: 3, background: BRAND_NEON } },
      top: photoHeight,
      left: 0,
    },
  ]);
  // Flatten the composite first so quality retries don't redo it.
  const flat = await canvas.png().toBuffer();

  let out: Buffer = Buffer.alloc(0);
  for (const quality of [82, 72, 62, 50]) {
    out = await sharp(flat).jpeg({ quality, mozjpeg: true, chromaSubsampling: "4:2:0" }).toBuffer();
    if (out.length <= MAX_BYTES) break;
  }
  return out;
}

/** No photo or it can't be fetched: the site-wide preview image. */
function fallback() {
  return NextResponse.redirect(`${SITE_URL}/opengraph-image`, 302);
}
