import { revalidatePath, revalidateTag } from "next/cache";
import { ensureProductOg } from "@/lib/og-image";
import { PRODUCTS_TAG } from "@/lib/products/detail-data";

/**
 * After a product is created, edited, hidden or deleted: render its link-preview JPEG first (so
 * the page's next render already points at it), then drop the cached (ISR) pages that show it.
 */
export async function refreshProductPages(product?: { id: string; images: string[]; active: boolean }) {
  if (product?.active) await ensureProductOg(product);
  try {
    // Cached product-page data (see detail-data.ts); expire now so the next view is fresh.
    revalidateTag(PRODUCTS_TAG, { expire: 0 });
    // Every cached page: product pages, their /p/ short links, home and listings. The
    // "/products/[slug]" pattern alone misses pages inside the (store) route group, and
    // product saves are rare enough that refreshing the whole store is cheap.
    revalidatePath("/", "layout");
  } catch (e) {
    console.error("[products] revalidate failed:", e);
  }
}
