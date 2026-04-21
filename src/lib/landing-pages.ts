import { LandingPageMode } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  type LandingPagePayload,
  parseBenefits,
  parseReviews,
} from "@/lib/landing-settings";
import { resolvedLandingProduct } from "@/lib/landing-product-resolve";
import {
  defaultLandingBenefits,
  defaultLandingReviews,
} from "@/lib/landing-defaults";

/** Public landing payload for `/landing/[slug]` (and API). */
export async function getLandingPagePayload(
  slug: string,
): Promise<LandingPagePayload | null> {
  const raw = slug.trim().toLowerCase();
  if (!raw) return null;

  const page = await prisma.landingPage.findFirst({
    where: { slug: raw, enabled: true },
    include: {
      products: {
        include: { product: true },
        orderBy: { displayOrder: "asc" },
      },
    },
  });

  if (!page) return null;

  const lines = page.products.filter((line) => line.product.active);
  const mapped = lines.map((line) => resolvedLandingProduct(line.product, line));
  const products =
    page.mode === "SINGLE" ? mapped.slice(0, 1) : mapped;

  let benefits = parseBenefits(page.benefitsJson);
  let reviews = parseReviews(page.reviewsJson);
  if (benefits.length === 0) benefits = parseBenefits(defaultLandingBenefits);
  if (reviews.length === 0) reviews = parseReviews(defaultLandingReviews);

  const n = products.length;
  const rawDefault = page.defaultProductIndex ?? 0;
  const defaultProductIndex =
    n === 0 ? 0 : Math.min(Math.max(0, rawDefault), n - 1);

  return {
    meta: {
      slug: page.slug,
      landingPageId: page.id,
      mode: page.mode === LandingPageMode.SINGLE ? "SINGLE" : "SLIDER",
    },
    settings: {
      offerBadge: page.offerBadge,
      offerTitle: page.offerTitle,
      offerTitleAccent: page.offerTitleAccent,
      offerSubtitle: page.offerSubtitle,
      countdownHours: page.countdownHours,
      benefits,
      reviews,
      whatsappOverride: page.whatsappOverride,
      defaultProductIndex,
      sliderAutoPlay: page.sliderAutoPlay,
      sliderAutoPlayIntervalSec: Math.min(
        10,
        Math.max(3, page.sliderAutoPlayIntervalSec ?? 5),
      ),
    },
    products,
  };
}

export function isValidLandingSlug(slug: string) {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug.trim().toLowerCase());
}
