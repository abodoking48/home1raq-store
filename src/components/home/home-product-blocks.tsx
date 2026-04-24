import Link from "next/link";
import { ProductCard } from "@/components/product/product-card";
import { siteCopy } from "@/lib/stitch-copy";

type Product = {
  id: string;
  slug: string;
  name: string;
  price: number;
  compareAtPrice?: number | null;
  onPromo?: boolean;
  images: string[];
};

type Props = {
  popularProducts: Product[];
  latestProducts: Product[];
};

/** Same catalog items (order-independent); used to hide duplicate homepage sections. */
function sameProductsById(a: Product[], b: Product[]): boolean {
  if (a.length !== b.length) return false;
  const sa = [...a.map((p) => p.id)].sort();
  const sb = [...b.map((p) => p.id)].sort();
  return sa.every((id, i) => id === sb[i]);
}

const HOME_CARD_GRID =
  "grid grid-cols-[repeat(2,minmax(0,1fr))] gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-4";

const HOME_LATEST_GRID =
  "grid grid-cols-[repeat(2,minmax(0,1fr))] gap-4 md:grid-cols-3 md:gap-8";

const cardProps = {
  imageAspectRatio: "3/4" as const,
  className: "min-w-0",
};

export function HomeProductBlocks({ popularProducts, latestProducts }: Props) {
  if (popularProducts.length === 0 && latestProducts.length === 0) return null;

  if (popularProducts.length === 0 || latestProducts.length <= 4) {
    return (
      <section className="mx-auto max-w-7xl bg-primary/[0.02] px-4 py-16 md:px-8 md:py-24">
        <div className="mb-12 flex flex-col items-end justify-between gap-4 md:flex-row">
          <div className="space-y-4 text-right">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-primary">
              {siteCopy.latest.badge}
            </div>
            <h2 className="font-heading text-4xl font-black text-foreground md:text-5xl">
              {siteCopy.latest.title}
            </h2>
            <p className="text-muted-foreground">{siteCopy.latest.subtitle}</p>
          </div>
          <Link
            href="/products"
            className="flex items-center gap-2 font-bold text-primary underline-offset-8 hover:underline"
          >
            {siteCopy.latest.viewAll}
            <span className="inline-block rtl:rotate-180">←</span>
          </Link>
        </div>
        <div className={HOME_CARD_GRID}>
          {latestProducts.map((p) => (
            <ProductCard
              key={p.id}
              id={p.id}
              slug={p.slug}
              name={p.name}
              price={p.price}
              compareAtPrice={p.compareAtPrice}
              onPromo={p.onPromo}
              image={p.images[0] ?? null}
              variant="latest"
              {...cardProps}
            />
          ))}
        </div>
      </section>
    );
  }

  const popular = popularProducts.slice(0, 4);
  const latest = latestProducts.slice(0, 4);
  const showLatestSection = latest.length > 0 && !sameProductsById(popular, latest);

  return (
    <>
      <section className="mx-auto max-w-7xl px-4 py-12 md:px-8 md:py-24">
        <div className="mb-16 space-y-4 text-center">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-primary">
            {siteCopy.popular.badge}
          </div>
          <h2 className="font-heading text-4xl font-black text-foreground md:text-5xl">
            {siteCopy.popular.title}
          </h2>
          <p className="text-muted-foreground">{siteCopy.popular.subtitle}</p>
        </div>
        <div className={HOME_CARD_GRID}>
          {popular.map((p) => (
            <ProductCard
              key={p.id}
              id={p.id}
              slug={p.slug}
              name={p.name}
              price={p.price}
              compareAtPrice={p.compareAtPrice}
              onPromo={p.onPromo}
              image={p.images[0] ?? null}
              variant="popular"
              {...cardProps}
            />
          ))}
        </div>
      </section>

      {showLatestSection ? (
        <section className="mx-auto max-w-7xl bg-primary/[0.02] px-4 py-16 md:px-8 md:py-24">
          <div className="mb-16 flex flex-col items-end justify-between gap-4 md:flex-row">
            <div className="space-y-4 text-right">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-primary">
                {siteCopy.latest.badge}
              </div>
              <h2 className="font-heading text-4xl font-black text-foreground md:text-5xl">
                {siteCopy.latest.title}
              </h2>
              <p className="text-muted-foreground">{siteCopy.latest.subtitle}</p>
            </div>
            <Link
              href="/products"
              className="flex items-center gap-2 font-bold text-primary underline-offset-8 transition-all hover:underline"
            >
              {siteCopy.latest.viewAll}
              <span className="inline-block rtl:rotate-180">←</span>
            </Link>
          </div>
          <div className={HOME_LATEST_GRID}>
            {latest.map((p) => (
              <ProductCard
                key={p.id}
                id={p.id}
                slug={p.slug}
                name={p.name}
                price={p.price}
                compareAtPrice={p.compareAtPrice}
                onPromo={p.onPromo}
                image={p.images[0] ?? null}
                variant="latest"
                {...cardProps}
              />
            ))}
          </div>
        </section>
      ) : null}
    </>
  );
}
