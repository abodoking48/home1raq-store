import { compressImage } from "@/lib/images/compress";
import { ensureProductOg } from "@/lib/og-image";
import { prisma } from "@/lib/prisma";
import { refreshProductPages } from "@/lib/products/refresh";
import { storeImage } from "@/lib/products/upload";

/**
 * One-off, admin-triggered recompression of images uploaded before `compressImage` existed.
 * Works in small batches (one HTTP call each) so no request runs into the function timeout.
 * New files get new names and the old ones stay in storage, so nothing is lost.
 */

export type RecompressKind = "product" | "category" | "landing" | "og";
/** "og" runs last, so link previews are rendered from the already-compressed photos. */
const KINDS: RecompressKind[] = ["product", "category", "landing", "og"];
const BATCH = 4;
const OG_WHERE = (after: string) => ({ id: { gt: after }, active: true, NOT: { images: { isEmpty: true } } });

export type RecompressCursor = { kind: RecompressKind; after: string };

export type ImageResult = {
  kind: RecompressKind;
  label: string;
  url: string;
  before: number;
  after: number | null;
  /** Set when the new file was stored (not in a dry run). */
  newUrl?: string;
  skipped?: "not-ours" | "already-webp" | "not-smaller" | "unreadable" | "download-failed" | "og-exists";
};

export type RecompressBatch = { results: ImageResult[]; next: RecompressCursor | null };

/** Only files in our own Supabase bucket are touched. */
function isOurs(url: string) {
  return url.includes("/storage/v1/object/public/products/");
}

async function recompressOne(
  kind: RecompressKind,
  label: string,
  url: string,
  dryRun: boolean,
): Promise<ImageResult> {
  const base = { kind, label, url, before: 0, after: null };
  if (!isOurs(url)) return { ...base, skipped: "not-ours" };
  if (/\.webp(\?|$)/i.test(url)) return { ...base, skipped: "already-webp" };

  let original: Buffer;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
    if (!res.ok) return { ...base, skipped: "download-failed" };
    original = Buffer.from(await res.arrayBuffer());
  } catch {
    return { ...base, skipped: "download-failed" };
  }

  const compressed = await compressImage(original);
  if (!compressed) return { ...base, before: original.length, skipped: "unreadable" };
  const result = { ...base, before: original.length, after: compressed.buffer.length };
  if (compressed.buffer.length >= original.length) return { ...result, skipped: "not-smaller" };
  if (dryRun) return result;

  const newUrl = await storeImage(compressed.buffer, compressed.ext, compressed.contentType);
  return { ...result, newUrl };
}

/** Recompresses a list of URLs in order, returning the replacement list and per-image results. */
async function recompressList(kind: RecompressKind, label: string, urls: string[], dryRun: boolean) {
  const results: ImageResult[] = [];
  const replaced: string[] = [];
  for (const url of urls) {
    const r = await recompressOne(kind, label, url, dryRun);
    results.push(r);
    replaced.push(r.newUrl ?? url);
  }
  return { results, replaced, changed: results.some((r) => r.newUrl) };
}

export async function recompressBatch(
  cursor: RecompressCursor | null,
  dryRun: boolean,
): Promise<RecompressBatch> {
  const kind = cursor?.kind ?? KINDS[0];
  const after = cursor?.after ?? "";
  const results: ImageResult[] = [];
  let lastId: string | null = null;
  let productsChanged = false;

  if (kind === "product") {
    const rows = await prisma.product.findMany({
      where: { id: { gt: after } },
      orderBy: { id: "asc" },
      take: BATCH,
      select: { id: true, name: true, images: true },
    });
    for (const row of rows) {
      const r = await recompressList(kind, row.name, row.images, dryRun);
      results.push(...r.results);
      if (r.changed) {
        await prisma.product.update({ where: { id: row.id }, data: { images: r.replaced } });
        productsChanged = true;
      }
      lastId = row.id;
    }
  } else if (kind === "category") {
    const rows = await prisma.category.findMany({
      where: { id: { gt: after }, iconUrl: { not: null } },
      orderBy: { id: "asc" },
      take: BATCH,
      select: { id: true, name: true, iconUrl: true },
    });
    for (const row of rows) {
      const r = await recompressList(kind, row.name, row.iconUrl ? [row.iconUrl] : [], dryRun);
      results.push(...r.results);
      if (r.changed) await prisma.category.update({ where: { id: row.id }, data: { iconUrl: r.replaced[0] } });
      lastId = row.id;
    }
  } else if (kind === "og") {
    const rows = await prisma.product.findMany({
      where: OG_WHERE(after),
      orderBy: { id: "asc" },
      take: BATCH,
      select: { id: true, name: true, images: true },
    });
    for (const row of rows) {
      const og = await ensureProductOg(row, { dryRun });
      const base = { kind, label: `${row.name} (معاينة)`, before: 0 };
      if (!og) results.push({ ...base, url: row.images[0], after: null, skipped: "download-failed" });
      else if (!og.created) results.push({ ...base, url: og.url, after: og.bytes, skipped: "og-exists" });
      else results.push({ ...base, url: og.url, after: og.bytes, ...(dryRun ? {} : { newUrl: og.url }) });
      lastId = row.id;
    }
  } else {
    const rows = await prisma.landingPageProduct.findMany({
      where: { id: { gt: after }, NOT: { imagesOverride: { isEmpty: true } } },
      orderBy: { id: "asc" },
      take: BATCH,
      select: { id: true, imagesOverride: true, product: { select: { name: true } } },
    });
    for (const row of rows) {
      const r = await recompressList(kind, `${row.product.name} (landing)`, row.imagesOverride, dryRun);
      results.push(...r.results);
      if (r.changed) {
        await prisma.landingPageProduct.update({ where: { id: row.id }, data: { imagesOverride: r.replaced } });
      }
      lastId = row.id;
    }
  }

  if (productsChanged && !dryRun) await refreshProductPages();

  // Nothing left of this kind: move on to the next one.
  if (lastId && (await hasMore(kind, lastId))) {
    return { results, next: { kind, after: lastId } };
  }
  const nextKind = KINDS[KINDS.indexOf(kind) + 1];
  return { results, next: nextKind ? { kind: nextKind, after: "" } : null };
}

async function hasMore(kind: RecompressKind, after: string) {
  if (kind === "product") return (await prisma.product.count({ where: { id: { gt: after } } })) > 0;
  if (kind === "og") return (await prisma.product.count({ where: OG_WHERE(after) })) > 0;
  if (kind === "category") {
    return (await prisma.category.count({ where: { id: { gt: after }, iconUrl: { not: null } } })) > 0;
  }
  return (
    (await prisma.landingPageProduct.count({
      where: { id: { gt: after }, NOT: { imagesOverride: { isEmpty: true } } },
    })) > 0
  );
}
