import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getProductBySlug,
  notFoundMetadata,
  ProductDetail,
  productMetadata,
} from "@/components/product/product-detail-page";
import { productPath, SITE_URL } from "@/lib/site";

/**
 * Rendered per request. ISR here returned Vercel's static 500 for every Arabic (percent-encoded)
 * slug in production, while the ASCII `/p/<id>` share link — which crawlers get — stays ISR.
 */
export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await getProductBySlug((await params).slug);
  if (!product) return notFoundMetadata;
  return productMetadata(product, `${SITE_URL}${productPath(product.slug)}`);
}

export default async function ProductDetailPage({ params }: Props) {
  const product = await getProductBySlug((await params).slug);
  if (!product) notFound();
  return <ProductDetail product={product} />;
}
