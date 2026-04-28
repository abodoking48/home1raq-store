import Link from "next/link";
import dynamicImport from "next/dynamic";
import { HeroSection } from "@/components/home/hero-section";
import { HomeCategories } from "@/components/home/home-categories";
import { HomeProductBlocks } from "@/components/home/home-product-blocks";
import { HomePromoSection } from "@/components/home/home-promo-section";
import { buttonVariants } from "@/components/ui/button";
import { isDatabaseUnreachableError } from "@/lib/db-unreachable";
import { prisma } from "@/lib/prisma";
import { siteCopy } from "@/lib/stitch-copy";
import { cn } from "@/lib/utils";

const HomeNewsletter = dynamicImport(
  () => import("@/components/home/home-newsletter").then((mod) => mod.HomeNewsletter),
  {
    loading: () => <section id="community" className="mx-auto max-w-5xl px-4 py-16 md:px-8 md:py-24" />,
  },
);

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let latestRows: Awaited<ReturnType<typeof prisma.product.findMany>> = [];
  let popularFinalRows: typeof latestRows = [];
  let dbUnavailable = false;

  try {
    const [latest, popularOrderStats] = await Promise.all([
      prisma.product.findMany({
        where: { active: true },
        orderBy: { createdAt: "desc" },
        take: 8,
      }),
      prisma.orderItem.groupBy({
        by: ["productId"],
        _sum: { quantity: true },
        orderBy: { _sum: { quantity: "desc" } },
        take: 8,
      }),
    ]);

    latestRows = latest;

    const popularProductIds = popularOrderStats.map((row) => row.productId);
    const popularRowsRaw =
      popularProductIds.length > 0
        ? await prisma.product.findMany({
            where: { id: { in: popularProductIds }, active: true },
          })
        : [];

    const popularById = new Map(popularRowsRaw.map((p) => [p.id, p]));
    const popularRows = popularProductIds
      .map((id) => popularById.get(id))
      .filter((p): p is NonNullable<typeof p> => Boolean(p));

    const fallbackPopularRows =
      popularRows.length < 4
        ? latestRows.filter((p) => !popularRows.some((r) => r.id === p.id))
        : [];
    popularFinalRows = [...popularRows, ...fallbackPopularRows].slice(0, 8);
  } catch (e) {
    if (isDatabaseUnreachableError(e)) {
      console.error("[home] database unavailable:", e);
      dbUnavailable = true;
    } else {
      throw e;
    }
  }

  const latestProducts = latestRows.map((p) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    price: Number(p.price),
    compareAtPrice: p.compareAtPrice != null ? Number(p.compareAtPrice) : null,
    onPromo: p.onPromo,
    images: p.images,
  }));

  const popularProducts = popularFinalRows.map((p) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    price: Number(p.price),
    compareAtPrice: p.compareAtPrice != null ? Number(p.compareAtPrice) : null,
    onPromo: p.onPromo,
    images: p.images,
  }));

  return (
    <div className="relative overflow-hidden">
      {dbUnavailable ? (
        <div className="border-b border-amber-500/30 bg-amber-500/10 px-4 py-3 text-center text-sm text-amber-100">
          تعذر الاتصال بقاعدة البيانات مؤقتاً. تحقق من الإنترنت، من أن مشروع Supabase
          غير متوقف، ومن صحة{" "}
          <code className="rounded bg-black/20 px-1.5 py-0.5 font-mono text-xs">
            DATABASE_URL
          </code>{" "}
          في{" "}
          <code className="rounded bg-black/20 px-1.5 py-0.5 font-mono text-xs">
            .env.local
          </code>{" "}
          ثم أعد تشغيل الخادم.
        </div>
      ) : null}
      <HeroSection />
      <HomeCategories />

      {latestProducts.length === 0 ? (
        <section className="mx-auto max-w-7xl px-4 py-16 md:px-8">
          <div className="glass-panel rounded-2xl p-12 text-center">
            <p className="text-lg text-muted-foreground">
              {dbUnavailable
                ? "لا يمكن تحميل المنتجات حالياً بسبب انقطاع الاتصال بقاعدة البيانات. بعد إصلاح الإعدادات، ستظهر المنتجات هنا تلقائياً."
                : "لا توجد منتجات في المتجر بعد. أضف منتجات من لوحة الإدارة لعرضها هنا بنفس تخطيط Stitch."}
            </p>
            <Link
              href="/products"
              className={cn(
                buttonVariants({ variant: "outline" }),
                "mt-6 inline-flex rounded-full border-white/15",
              )}
            >
              {siteCopy.nav.products}
            </Link>
          </div>
        </section>
      ) : (
        <HomeProductBlocks
          popularProducts={popularProducts}
          latestProducts={latestProducts}
        />
      )}

      <HomePromoSection />
      <HomeNewsletter />
    </div>
  );
}
