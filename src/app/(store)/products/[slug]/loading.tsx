import { ProductPageSkeleton } from "@/components/product/product-page-skeleton";

/** The listing grid skeleton lives in products/(list)/, so it never covers a product page. */
export default function ProductLoading() {
  return <ProductPageSkeleton />;
}
