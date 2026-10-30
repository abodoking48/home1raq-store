import { createHash } from "crypto";
import http, { type IncomingHttpHeaders } from "node:http";
import https from "node:https";
import sharp from "sharp";
import { OG_IMAGE } from "@/lib/og";
import { STORAGE_BUCKET, uploadErrorMessage } from "@/lib/products/upload";
import { createServiceRoleClient } from "@/lib/supabase/admin";

/**
 * Product link-preview images, pre-rendered into Supabase Storage so WhatsApp/Facebook fetch a
 * plain static JPEG (no compute on their request — a cold render took ~4 s, long enough for
 * WhatsApp to give up). The file name hashes the first photo, so a new photo means a new file
 * and no stale preview. Bump OG_VERSION when `renderProductOg` changes.
 */
const OG_VERSION = "1";
/** WhatsApp drops large preview images; stay well under its limit. */
const MAX_BYTES = 150 * 1024;
const BRAND_BG = "#020403";
const BRAND_NEON = "#00FF88";
const ACCENT_HEIGHT = 10;

type OgProduct = { id: string; images: string[] };

function ogPath(id: string, image: string) {
  const hash = createHash("sha1").update(`${OG_VERSION}:${image}`).digest("hex").slice(0, 10);
  return `og/${id}-${hash}.jpg`;
}

/** Public URL the stored preview has (or will have) for this product; null without a photo. */
export function storedProductOgUrl(product: OgProduct) {
  const image = product.images[0];
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim().replace(/\/+$/, "");
  if (!image || !base) return null;
  return `${base}/storage/v1/object/public/${STORAGE_BUCKET}/${ogPath(product.id, image)}`;
}

export type EnsureOgResult = { url: string; created: boolean; bytes: number | null } | null;

/**
 * Makes sure the stored preview exists and returns its URL; renders and uploads it when missing.
 * With `dryRun`, only reports what would be created. Never throws: null means "no preview".
 */
export async function ensureProductOg(product: OgProduct, { dryRun = false } = {}): Promise<EnsureOgResult> {
  const url = storedProductOgUrl(product);
  if (!url) return null;
  try {
    const head = await rawRequest(url, "HEAD", 4000);
    if (head.status === 200) return { url, created: false, bytes: Number(head.headers["content-length"]) || null };

    const res = await rawRequest(product.images[0], "GET", 10000);
    if (res.status !== 200) return null;
    const jpeg = await renderProductOg(res.body);
    if (dryRun) return { url, created: true, bytes: jpeg.length };

    const { error } = await createServiceRoleClient()
      .storage.from(STORAGE_BUCKET)
      .upload(ogPath(product.id, product.images[0]), jpeg, {
        contentType: OG_IMAGE.type,
        cacheControl: "31536000",
        upsert: true,
      });
    if (error) {
      console.error("[og] upload failed:", uploadErrorMessage(error));
      return null;
    }
    return { url, created: true, bytes: jpeg.length };
  } catch (e) {
    console.error("[og] ensure failed for", product.id, e);
    return null;
  }
}

/**
 * Plain Node request, outside Next's patched `fetch`: this runs while ISR pages render, where a
 * `no-store` fetch turns the page dynamic (a runtime error) and a cached one would remember
 * "missing" after the file is uploaded.
 */
function rawRequest(url: string, method: "GET" | "HEAD", timeoutMs: number) {
  return new Promise<{ status: number; headers: IncomingHttpHeaders; body: Buffer }>((resolve, reject) => {
    const req = (url.startsWith("https:") ? https : http).request(url, { method, timeout: timeoutMs }, (res) => {
      const chunks: Buffer[] = [];
      res.on("data", (c: Buffer) => chunks.push(c));
      res.on("end", () => resolve({ status: res.statusCode ?? 0, headers: res.headers, body: Buffer.concat(chunks) }));
      res.on("error", reject);
    });
    req.on("timeout", () => req.destroy(new Error(`timeout ${url}`)));
    req.on("error", reject);
    req.end();
  });
}

/** The product's first photo, letterboxed on a blurred copy of itself, as a small 1200×630 JPEG. */
export async function renderProductOg(original: Buffer) {
  const { width, height } = OG_IMAGE;
  const photoHeight = height - ACCENT_HEIGHT;
  const input = sharp(original, { failOn: "none" }).rotate();

  // A 40px thumbnail scaled back up blurs for a fraction of a full-size blur's cost.
  const tiny = await input
    .clone()
    .resize(40, Math.round((40 * photoHeight) / width), { fit: "cover" })
    .modulate({ brightness: 0.45 })
    .toBuffer();
  const [backdrop, photo] = await Promise.all([
    sharp(tiny).resize(width, photoHeight, { kernel: "cubic" }).blur(4).toBuffer(),
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
  const flat = await canvas.raw().toBuffer({ resolveWithObject: true });

  let out: Buffer = Buffer.alloc(0);
  for (const quality of [80, 70, 60, 50]) {
    out = await sharp(flat.data, { raw: flat.info })
      .jpeg({ quality, mozjpeg: true, chromaSubsampling: "4:2:0" })
      .toBuffer();
    if (out.length <= MAX_BYTES) break;
  }
  return out;
}
