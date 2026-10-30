import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getProductBySlug,
  notFoundMetadata,
  ProductDetail,
  productMetadata,
} from "@/components/product/product-detail-page";
import { productPath, SITE_URL } from "@/lib/site";

/** ISR: crawlers (WhatsApp, Facebook) get cached HTML; product saves revalidate it on demand. */
export const revalidate = 3600;
/** Nothing prebuilt at deploy; each product is rendered on its first visit, then cached. */
export async function generateStaticParams() {
  return [];
}

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
