import { notFound } from "next/navigation";
import { LandingPageEditor } from "@/components/admin/landing-page-editor";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ id: string }> };

export default async function EditLandingPage({ params }: PageProps) {
  const { id } = await params;

  const row = await prisma.landingPage.findUnique({
    where: { id },
    include: {
      products: {
        include: {
          product: { select: { id: true, name: true, slug: true, active: true, price: true } },
        },
        orderBy: { displayOrder: "asc" },
      },
    },
  });

  if (!row) notFound();

  const productOptions = await prisma.product.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  const initial = {
    id: row.id,
    slug: row.slug,
    title: row.title,
    enabled: row.enabled,
    mode: row.mode,
    defaultProductIndex: row.defaultProductIndex ?? 0,
    sliderAutoPlay: row.sliderAutoPlay ?? false,
    sliderAutoPlayIntervalSec: row.sliderAutoPlayIntervalSec ?? 5,
    countdownHours: row.countdownHours,
    whatsappOverride: row.whatsappOverride,
    offerBadge: row.offerBadge,
    offerTitle: row.offerTitle,
    offerTitleAccent: row.offerTitleAccent,
    offerSubtitle: row.offerSubtitle,
    benefitsJson: row.benefitsJson,
    reviewsJson: row.reviewsJson,
    products: row.products.map((l) => ({
      id: l.id,
      displayOrder: l.displayOrder,
      titleOverride: l.titleOverride,
      customDescription: l.customDescription,
      imagesOverride: l.imagesOverride,
      videoUrl: l.videoUrl,
      customPrice: l.customPrice != null ? String(Number(l.customPrice)) : "",
      customCompareAt: l.customCompareAt != null ? String(Number(l.customCompareAt)) : "",
      onPromoOverride: l.onPromoOverride,
      displayRating: l.displayRating,
      product: {
        id: l.product.id,
        name: l.product.name,
        slug: l.product.slug,
        active: l.product.active,
        price: Number(l.product.price),
      },
    })),
  };

  return <LandingPageEditor initial={initial} productOptions={productOptions} />;
}
