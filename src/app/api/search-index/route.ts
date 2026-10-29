import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/** Lightweight catalog for the header's live suggestions (filtered client-side; catalog is small). */
export const revalidate = 300;

export async function GET() {
  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      where: { active: true },
      orderBy: { updatedAt: "desc" },
      select: {
        slug: true,
        name: true,
        price: true,
        compareAtPrice: true,
        onPromo: true,
        images: true,
        category: { select: { name: true } },
      },
    }),
    prisma.category.findMany({
      where: { active: true },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: { name: true, slug: true },
    }),
  ]);

  return NextResponse.json({
    products: products.map((p) => ({
      slug: p.slug,
      name: p.name,
      price: Number(p.price),
      compareAtPrice: p.compareAtPrice != null ? Number(p.compareAtPrice) : null,
      onPromo: p.onPromo,
      image: p.images[0] ?? null,
      category: p.category?.name ?? null,
    })),
    categories,
  });
}
