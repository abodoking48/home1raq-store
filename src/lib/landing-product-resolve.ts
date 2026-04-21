import type { LandingPageProduct, Product } from "@prisma/client";
import type { LandingProductPayload } from "@/lib/landing-settings";

export function resolvedLandingProduct(
  product: Product,
  line: LandingPageProduct | null,
): LandingProductPayload {
  const images =
    line && line.imagesOverride.length > 0 ? line.imagesOverride : product.images;
  const name = line?.titleOverride?.trim() || product.name;
  const description = line?.customDescription?.trim() || product.description;
  const price =
    line?.customPrice != null ? Number(line.customPrice) : Number(product.price);
  let compareAtPrice: number | null =
    product.compareAtPrice != null ? Number(product.compareAtPrice) : null;
  if (line?.customCompareAt != null) {
    compareAtPrice = Number(line.customCompareAt);
  }
  const onPromo =
    line?.onPromoOverride != null ? line.onPromoOverride : product.onPromo;
  const videoUrl = line?.videoUrl?.trim() || null;
  let displayRating: number | null = null;
  if (line?.displayRating != null) {
    const r = line.displayRating;
    displayRating = Math.min(5, Math.max(1, r));
  }

  return {
    id: product.id,
    landingPageProductId: line?.id ?? null,
    name,
    slug: product.slug,
    description,
    price,
    compareAtPrice,
    onPromo,
    images,
    videoUrl,
    displayRating,
  };
}
