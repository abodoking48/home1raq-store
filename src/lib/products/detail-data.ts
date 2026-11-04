import { unstable_cache } from "next/cache";
import { cache } from "react";
import { ensureProductOg } from "@/lib/og-image";
import { buildSlugCandidates } from "@/lib/product-slug";
import { prisma } from "@/lib/prisma";

/**
 * Cached data for the product page (`/products/[slug]` and `/p/[id]`).
 *
 * The page itself stays dynamic: full-page ISR on the Arabic slug route returned Vercel's static
 * 500. Caching the data instead means a render does no DB or Storage round trip on a hit
 * (the Vercel data cache survives across function instances). Every product save calls
 * `revalidateTag(PRODUCTS_TAG)` (see `refreshProductPages`).
 */
export const PRODUCTS_TAG = "products";
/** Previews are keyed by product id + first photo, so a new photo is a new key; no need to purge. */
const OG_TAG = "product-og";

const detailSelect = {
  id: true,
  name: true,
  slug: true,
  description: true,
  price: true,
  compareAtPrice: true,
  onPromo: true,
  images: true,
  categoryId: true,
  updatedAt: true,
  category: { select: { name: true, slug: true } },
} as const;

const cardSelect = {
  id: true,
  name: true,
  slug: true,
  price: true,
  compareAtPrice: true,
  onPromo: true,
  images: true,
} as const;

/** Plain JSON (the data cache serializes): Decimal → number, Date → ISO string. */
export type DetailProduct = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  compareAtPrice: number | null;
  onPromo: boolean;
  images: string[];
  categoryId: string | null;
  updatedAt: string;
  category: { name: string; slug: string } | null;
};

export type RelatedProduct = Pick<DetailProduct, "id" | "name" | "slug" | "price" | "compareAtPrice" | "onPromo" | "images">;

type Row = { price: unknown; compareAtPrice: unknown };
function money<T extends Row>(row: T) {
  return {
    ...row,
    price: Number(row.price),
    compareAtPrice: row.compareAtPrice != null ? Number(row.compareAtPrice) : null,
  };
}

/** One cache key per product however the slug arrives (raw Arabic, percent-encoded, `+`, …). */
function normalizeSlug(slug: string) {
  let s = slug.trim();
  try {
    s = decodeURIComponent(s);
  } catch {
    // Malformed escapes: keep as-is.
  }
  return s.normalize("NFC");
}

const cachedBySlug = unstable_cache(
  async (slug: string): Promise<DetailProduct | null> => {
    const row = await prisma.product.findFirst({
      where: { active: true, OR: buildSlugCandidates(slug).map((s) => ({ slug: s })) },
      select: detailSelect,
    });
    return row ? { ...money(row), updatedAt: row.updatedAt.toISOString() } : null;
  },
  ["product-detail-by-slug-v1"],
  { tags: [PRODUCTS_TAG], revalidate: 3600 },
);

const cachedById = unstable_cache(
  async (id: string): Promise<DetailProduct | null> => {
    const row = await prisma.product.findFirst({ where: { id, active: true }, select: detailSelect });
    return row ? { ...money(row), updatedAt: row.updatedAt.toISOString() } : null;
  },
  ["product-detail-by-id-v1"],
  { tags: [PRODUCTS_TAG], revalidate: 3600 },
);

const cachedRelated = unstable_cache(
  async (categoryId: string | null, excludeId: string): Promise<RelatedProduct[]> => {
    const rows = await prisma.product.findMany({
      where: { active: true, categoryId: categoryId ?? undefined, NOT: { id: excludeId } },
      orderBy: { updatedAt: "desc" },
      take: 4,
      select: cardSelect,
    });
    return rows.map(money);
  },
  ["product-related-v1"],
  { tags: [PRODUCTS_TAG], revalidate: 3600 },
);

/**
 * Stored link-preview URL. Normally made at save time; this checks (and if needed makes) it once
 * per product photo, then answers from the cache instead of a Storage round trip per render.
 */
const cachedOgUrl = unstable_cache(
  async (id: string, image: string) => (await ensureProductOg({ id, images: [image] }))?.url ?? null,
  ["product-og-url-v1"],
  { tags: [OG_TAG], revalidate: 7 * 24 * 3600 },
);

// React `cache` dedupes the calls generateMetadata and the page make in the same request.
export const getProductBySlug = cache((slug: string) => cachedBySlug(normalizeSlug(slug)));
export const getProductById = cache((id: string) => cachedById(id));
export const getRelatedProducts = cache((categoryId: string | null, excludeId: string) =>
  cachedRelated(categoryId, excludeId),
);
export const getProductOgUrl = cache((id: string, image: string | undefined) =>
  image ? cachedOgUrl(id, image) : Promise.resolve(null),
);
