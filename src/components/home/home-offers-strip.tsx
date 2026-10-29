import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { formatIqdNumber } from "@/lib/currency";
import { productPath } from "@/lib/site";
import { siteCopy } from "@/lib/stitch-copy";

type StripProduct = {
  id: string;
  slug: string;
  name: string;
  price: number;
  compareAtPrice: number | null;
  onPromo: boolean;
  images: string[];
};

/** Offers banner + a swipeable row of real products, so the first mobile screen sells. */
export function HomeOffersStrip({ products }: { products: StripProduct[] }) {
  if (products.length === 0) return null;
  const p = siteCopy.promo;

  return (
    <section className="mx-auto max-w-7xl px-4 pb-6 md:px-8 md:pb-12">
      <Link
        href="/products?promo=1"
        className="flex items-center justify-between gap-3 rounded-2xl bg-[#007b4d] px-4 py-3 text-white shadow-lg shadow-primary/10 md:px-6 md:py-4"
      >
        <span className="min-w-0">
          <span className="block font-heading text-base font-black md:text-xl">{p.title}</span>
          <span className="block truncate text-xs text-white/85 md:text-sm">{p.subtitle}</span>
        </span>
        <span className="inline-flex shrink-0 items-center gap-1 rounded-xl bg-white px-3 py-2 text-xs font-bold text-[#007b4d] md:text-sm">
          {p.cta}
          <ArrowLeft className="size-4" aria-hidden />
        </span>
      </Link>

      <div className="-mx-4 mt-3 flex snap-x gap-3 overflow-x-auto px-4 pb-2 md:mx-0 md:mt-5 md:grid md:grid-cols-4 md:gap-5 md:overflow-visible md:px-0 lg:grid-cols-6">
        {products.map((item, i) => {
          const hasCompare = item.compareAtPrice != null && item.compareAtPrice > item.price;
          return (
            <Link
              key={item.id}
              href={productPath(item.slug)}
              className="glass-panel w-36 shrink-0 snap-start overflow-hidden rounded-2xl md:w-auto"
            >
              <div className="relative aspect-square w-full bg-[#0a0c0b]">
                {item.images[0] && (
                  <Image
                    src={item.images[0]}
                    alt={item.name}
                    fill
                    priority={i < 2}
                    sizes="(max-width: 767px) 144px, 200px"
                    className="object-cover"
                  />
                )}
                {item.onPromo && (
                  <span className="absolute end-2 top-2 rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground">
                    عرض
                  </span>
                )}
              </div>
              <div className="space-y-1 p-2.5">
                <p className="line-clamp-2 min-h-[2.5rem] text-xs font-semibold leading-5 text-foreground">
                  {item.name}
                </p>
                <p className="text-sm font-black tabular-nums text-primary">
                  {formatIqdNumber(item.price)}
                  <span className="ms-1 text-[10px] font-medium text-muted-foreground">د.ع</span>
                </p>
                {hasCompare && (
                  <p className="text-[11px] tabular-nums text-muted-foreground line-through">
                    {formatIqdNumber(item.compareAtPrice!)}
                  </p>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
