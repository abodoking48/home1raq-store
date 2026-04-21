import Link from "next/link";
import { ChefHat, Dumbbell, Sofa, Tv } from "lucide-react";
import { CATEGORY_ICON_OPTIONS, type CategoryIcon } from "@/lib/category-icons";
import { prisma } from "@/lib/prisma";
import { siteCopy } from "@/lib/stitch-copy";

const icons = {
  kitchen: ChefHat,
  tv: Tv,
  sofa: Sofa,
  dumbbell: Dumbbell,
} as const;

const iconList = [ChefHat, Tv, Sofa, Dumbbell] as const;
type CategoryLite = { name: string; slug: string; icon?: string; iconUrl?: string | null };
type CategoryDelegate = {
  findMany: (args: {
    where: { active: true };
    orderBy: Array<{ sortOrder: "asc" } | { name: "asc" }>;
    take: number;
  }) => Promise<CategoryLite[]>;
};

export async function HomeCategories() {
  const { title, viewAll } = siteCopy.categories;
  const categoryDelegate = (prisma as unknown as { category?: CategoryDelegate }).category;
  const categories = categoryDelegate
    ? await categoryDelegate.findMany({
        where: { active: true },
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
        take: 8,
      })
    : [];

  const items =
    categories.length > 0
      ? categories.map((category, index) => ({
          label: category.name,
          href: `/products?category=${encodeURIComponent(category.slug)}`,
          iconUrl: category.iconUrl?.trim() || null,
          Icon:
            CATEGORY_ICON_OPTIONS.includes(category.icon as CategoryIcon)
              ? icons[category.icon as CategoryIcon]
              : iconList[index % iconList.length],
        }))
      : siteCopy.categories.items.map((item, index) => ({
          label: item.label,
          href: item.href,
          iconUrl: null,
          Icon: icons[item.icon] ?? iconList[index % iconList.length],
        }));

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 md:px-8 md:py-24">
      <div className="mb-12 flex items-center justify-between gap-4">
        <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground md:text-3xl">
          {title}
        </h2>
        <Link
          href="/products"
          className="flex items-center gap-2 text-sm font-bold text-primary transition-colors hover:text-primary/90"
        >
          {viewAll}
          <span className="inline-block transition-transform group-hover:-translate-x-1 rtl:rotate-180">
            ←
          </span>
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
        {items.map((item) => {
          const Icon = item.Icon;
          return (
            <div
              key={item.label}
            >
              <Link
                href={item.href}
                className="glass-panel flex flex-col items-center gap-4 rounded-2xl p-6 text-center transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30"
              >
                <div className="flex size-16 items-center justify-center rounded-2xl bg-primary/10 transition-transform group-hover:scale-110">
                  {item.iconUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.iconUrl}
                      alt=""
                      className="size-8 object-contain"
                      loading="lazy"
                    />
                  ) : (
                    <Icon className="size-8 text-primary" aria-hidden />
                  )}
                </div>
                <h3 className="text-lg font-bold text-foreground">{item.label}</h3>
              </Link>
            </div>
          );
        })}
      </div>
    </section>
  );
}
