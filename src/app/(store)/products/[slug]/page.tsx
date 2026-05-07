import Link from "next/link";
import { notFound } from "next/navigation";
import { AddToCartButton } from "@/components/product/add-to-cart-button";
import { ProductImageGallery } from "@/components/product/product-image-gallery";
import { ProductCard } from "@/components/product/product-card";
import { buildSlugCandidates } from "@/lib/product-slug";
import { prisma } from "@/lib/prisma";
import { formatIqdNumber } from "@/lib/currency";
import { siteCopy } from "@/lib/stitch-copy";

export const revalidate = 3600;
export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const slugCandidates = buildSlugCandidates(slug);
  const product = await prisma.product.findFirst({
    where: {
      active: true,
      OR: slugCandidates.map((s) => ({ slug: s })),
    },
    include: { category: true },
  });

  if (!product) notFound();

  const price = Number(product.price);
  const compareAt =
    product.compareAtPrice != null ? Number(product.compareAtPrice) : null;
  const related = await prisma.product.findMany({
    where: {
      active: true,
      categoryId: product.categoryId ?? undefined,
      NOT: { id: product.id },
    },
    orderBy: { updatedAt: "desc" },
    take: 4,
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-16">
      <div className="mb-6 flex items-center gap-2 text-xs text-muted-foreground">
        <Link href="/" className="hover:text-primary">
          الرئيسية
        </Link>
        <span>/</span>
        <Link href="/products" className="hover:text-primary">
          المنتجات
        </Link>
        {product.category && (
          <>
            <span>/</span>
            <Link
              href={`/products?category=${encodeURIComponent(product.category.slug)}`}
              className="hover:text-primary"
            >
              {product.category.name}
            </Link>
          </>
        )}
      </div>
      <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
        <div className="glass-panel overflow-hidden rounded-3xl p-3 sm:p-4">
          <ProductImageGallery
            images={product.images}
            productName={product.name}
          />
        </div>

        <div className="flex flex-col gap-6">
          <div>
            <p className="text-sm text-muted-foreground">
              {siteCopy.product.sectionLabel}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <h1 className="font-heading text-3xl font-extrabold leading-tight tracking-tight text-foreground md:text-4xl lg:text-5xl">
                {product.name}
              </h1>
              {product.onPromo && (
                <Link
                  href="/products?promo=1"
                  className="rounded-full bg-primary/20 px-3 py-1 text-xs font-bold text-primary ring-1 ring-primary/30 hover:bg-primary/30"
                >
                  ضمن العروض
                </Link>
              )}
            </div>
            <div className="mt-6">
              {compareAt != null && compareAt > price && (
                <p className="mb-1 text-xl text-muted-foreground line-through decoration-white/30">
                  {formatIqdNumber(compareAt)} د.ع
                </p>
              )}
              <span className="text-3xl font-black tabular-nums text-primary md:text-4xl">
                {formatIqdNumber(price)}
              </span>
              <p className="mt-1 text-[10px] text-muted-foreground">
                دينار عراقي
              </p>
            </div>
            <p className="mt-3 inline-flex w-fit items-center rounded-full bg-primary/20 px-3 py-1 text-sm font-bold text-primary ring-1 ring-primary/30 md:text-base">
              🚚 توصيل مجاني لجميع أنحاء العراق
            </p>
          </div>

          <div className="space-y-4 text-base leading-relaxed text-muted-foreground">
            {product.description.split("\n").map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="glass-panel rounded-2xl p-4">
              <h3 className="font-bold text-foreground">ضمان موثوق</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                جميع المنتجات مدعومة بضمان وتحقق جودة قبل الشحن.
              </p>
            </div>
            <div className="glass-panel rounded-2xl p-4">
              <h3 className="font-bold text-foreground">توصيل سريع</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                تجهيز الطلبات يومياً والتوصيل لمعظم المحافظات العراقية.
              </p>
            </div>
          </div>

          <AddToCartButton
            productId={product.id}
            slug={product.slug}
            name={product.name}
            price={price}
            image={product.images[0] ?? null}
          />
        </div>
      </div>
      <section className="mt-16">
        <h2 className="font-heading text-2xl font-bold text-foreground">
          منتجات مشابهة
        </h2>
        {related.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">
            لا توجد منتجات مشابهة حالياً.
          </p>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((item) => (
              <ProductCard
                key={item.id}
                id={item.id}
                slug={item.slug}
                name={item.name}
                price={Number(item.price)}
                compareAtPrice={
                  item.compareAtPrice != null ? Number(item.compareAtPrice) : null
                }
                onPromo={item.onPromo}
                image={item.images[0] ?? null}
                variant="popular"
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
