import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getProductById,
  notFoundMetadata,
  ProductDetail,
  productMetadata,
} from "@/components/product/product-detail-page";
import { shortProductUrl } from "@/lib/site";

/**
 * Short ASCII share link `/p/<id>`: renders the product page itself (no redirect), so link
 * previews read their tags here. The long Arabic slug URL stays canonical for search engines.
 */
export const revalidate = 3600;
/** Nothing prebuilt at deploy; each product is rendered on its first visit, then cached. */
export async function generateStaticParams() {
  return [];
}

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await getProductById((await params).id);
  if (!product) return notFoundMetadata;
  return productMetadata(product, shortProductUrl(product.id));
}

export default async function ShortProductPage({ params }: Props) {
  const product = await getProductById((await params).id);
  if (!product) notFound();
  return <ProductDetail product={product} />;
}
