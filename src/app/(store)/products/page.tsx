import Link from "next/link";
import { ProductCard } from "@/components/product/product-card";
import { prisma } from "@/lib/prisma";
import { siteCopy } from "@/lib/stitch-copy";

export const revalidate = 3600;
export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{
    category?: string;
    q?: string;
    sort?: string;
    page?: string;
    promo?: string;
  }>;
};

const PAGE_SIZE = 12;

export default async function ProductsPage({ searchParams }: Props) {
  const sp = await searchParams;
  const category = sp.category?.trim() || undefined;
  const q = sp.q?.trim() || undefined;
  const promoActive = sp.promo === "1" || sp.promo === "true";
  const sort = sp.sort === "price-asc" || sp.sort === "price-desc" ? sp.sort : "latest";
  const page = Math.max(1, Number(sp.page || "1") || 1);
  const skip = (page - 1) * PAGE_SIZE;

  const categories = await prisma.category.findMany({
    where: { active: true },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: { id: true, name: true, slug: true },
  });

  const where = {
    active: true,
    ...(promoActive ? { onPromo: true } : {}),
    ...(category ? { category: { slug: category } } : {}),
    ...(q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" as const } },
            { description: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [total, products] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      orderBy:
        sort === "price-asc"
          ? { price: "asc" }
          : sort === "price-desc"
            ? { price: "desc" }
            : { updatedAt: "desc" },
      include: { category: true },
      skip,
      take: PAGE_SIZE,
    }),
  ]);

  const c = siteCopy.productsPage;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const activeCategory = categories.find((item) => item.slug === category);
  const makeHref = (next: {
    category?: string;
    q?: string;
    sort?: string;
    page?: string;
    /** اضبط "1" للتفعيل، أو "" لإلغاء فلتر العروض */
    promo?: string;
  }) => {
    const mergedCategory = next.category !== undefined ? next.category : category;
    const mergedQ = next.q !== undefined ? next.q : q;
    const mergedSort = next.sort !== undefined ? next.sort : sort;
    const mergedPage = next.page ?? String(page);
    const mergedPromo =
      next.promo !== undefined
        ? next.promo
        : promoActive
          ? "1"
          : "";
    const params = new URLSearchParams();
    if (mergedCategory) params.set("category", mergedCategory);
    if (mergedQ) params.set("q", mergedQ);
    if (mergedSort && mergedSort !== "latest") params.set("sort", mergedSort);
    if (mergedPage && mergedPage !== "1") params.set("page", mergedPage);
    if (mergedPromo === "1") params.set("promo", "1");
    return `/products${params.size > 0 ? `?${params.toString()}` : ""}`;
  };

  const pageTitle = promoActive
    ? c.promoTitle
    : activeCategory
      ? `قسم ${activeCategory.name}`
      : c.title;
  const pageSubtitle = promoActive ? c.promoSubtitle : c.subtitle;
  const emptyMessage = promoActive ? c.promoEmpty : c.empty;

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 md:px-8 md:py-16">
      <div className="mb-4 flex items-center gap-2 text-xs text-muted-foreground">
        <Link href="/" className="hover:text-primary">
          الرئيسية
        </Link>
        <span>/</span>
        <span className="text-foreground">{pageTitle}</span>
      </div>
      <div className="mb-10 max-w-2xl">
        <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          {pageTitle}
        </h1>
        <p className="mt-3 text-muted-foreground">{pageSubtitle}</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
        <aside className="glass-panel h-fit rounded-2xl p-5">
          <h2 className="text-lg font-bold text-foreground">الفئات</h2>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <Link
                href={makeHref({ category: undefined, page: "1", promo: "" })}
                className={
                  !promoActive && !category
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }
              >
                كل المنتجات
              </Link>
            </li>
            <li>
              <Link
                href={makeHref({ category: undefined, page: "1", promo: "1" })}
                className={
                  promoActive && !category
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }
              >
                العروض والخصومات
              </Link>
            </li>
            {categories.map((item) => (
              <li key={item.id}>
                <Link
                  href={makeHref({ category: item.slug, page: "1" })}
                  className={
                    item.slug === category
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </aside>

        <div>
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">عدد النتائج: {total}</p>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">الترتيب:</span>
              <Link href={makeHref({ sort: "latest", page: "1" })} className={sort === "latest" ? "text-primary" : "hover:text-primary"}>
                الأحدث
              </Link>
              <Link href={makeHref({ sort: "price-asc", page: "1" })} className={sort === "price-asc" ? "text-primary" : "hover:text-primary"}>
                السعر تصاعدي
              </Link>
              <Link href={makeHref({ sort: "price-desc", page: "1" })} className={sort === "price-desc" ? "text-primary" : "hover:text-primary"}>
                السعر تنازلي
              </Link>
            </div>
          </div>

          {products.length === 0 ? (
            <div className="glass-panel rounded-2xl p-12 text-center text-muted-foreground">
              {emptyMessage}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((p) => (
                <ProductCard
                  key={p.id}
                  id={p.id}
                  slug={p.slug}
                  name={p.name}
                  price={Number(p.price)}
                  compareAtPrice={
                    p.compareAtPrice != null ? Number(p.compareAtPrice) : null
                  }
                  onPromo={p.onPromo}
                  image={p.images[0] ?? null}
                  variant="popular"
                />
              ))}
            </div>
          )}

          <div className="mt-8 flex items-center justify-center gap-3 text-sm">
            <Link
              href={makeHref({ page: String(Math.max(1, page - 1)) })}
              className={`rounded-full border px-4 py-2 ${page === 1 ? "pointer-events-none border-white/10 text-muted-foreground/50" : "border-white/20 hover:border-primary/40"}`}
            >
              السابق
            </Link>
            <span className="text-muted-foreground">
              صفحة {page} من {totalPages}
            </span>
            <Link
              href={makeHref({ page: String(Math.min(totalPages, page + 1)) })}
              className={`rounded-full border px-4 py-2 ${page >= totalPages ? "pointer-events-none border-white/10 text-muted-foreground/50" : "border-white/20 hover:border-primary/40"}`}
            >
              التالي
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
