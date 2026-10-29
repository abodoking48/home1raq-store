import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { getAdminUser } from "@/lib/auth/admin";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slug";

const patchSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  price: z.number().positive().optional(),
  compareAtPrice: z.number().positive().optional().nullable(),
  onPromo: z.boolean().optional(),
  images: z.array(z.string().url()).optional(),
  active: z.boolean().optional(),
  categoryId: z.string().cuid().optional().nullable(),
});

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_req: Request, ctx: RouteContext) {
  if (!(await getAdminUser())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;
  const product = await prisma.product.findUnique({
    where: { id },
    include: { category: true },
  });
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ product });
}

export async function PATCH(req: Request, ctx: RouteContext) {
  if (!(await getAdminUser())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = patchSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten() },
      { status: 422 },
    );
  }

  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  let slug = existing.slug;
  if (parsed.data.name && parsed.data.name !== existing.name) {
    const base = slugify(parsed.data.name);
    slug = base;
    let n = 1;
    while (
      await prisma.product.findFirst({
        where: { slug, NOT: { id } },
      })
    ) {
      slug = `${base}-${n++}`;
    }
  }

  try {
    const product = await prisma.product.update({
      where: { id },
      data: {
        ...parsed.data,
        categoryId:
          parsed.data.categoryId === undefined ? undefined : (parsed.data.categoryId ?? null),
        slug,
      },
      include: { category: true },
    });
    return NextResponse.json({ product });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientValidationError) {
      return NextResponse.json(
        {
          error:
            "Prisma client out of sync. Stop next dev, then run: npm run db:generate (if EPERM: delete folder node_modules/.prisma and run again).",
        },
        { status: 500 },
      );
    }
    throw e;
  }
}

/** Shown to the admin when a product with orders is hidden instead of deleted. */
const ARCHIVED_MESSAGE =
  "هذا المنتج عليه طلبات سابقة، فانخفى من المتجر بدل الحذف حتى يبقى سجل الطلبات. تگدر ترجعه من خيار «Visible on storefront».";

/** Order lines keep pointing at the product, so a product that was ever ordered is hidden, never deleted. */
async function archive(id: string, orders: number) {
  await prisma.product.update({ where: { id }, data: { active: false } });
  return NextResponse.json({ ok: true, archived: true, orders, message: ARCHIVED_MESSAGE });
}

export async function DELETE(_req: Request, ctx: RouteContext) {
  if (!(await getAdminUser())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;

  try {
    const existing = await prisma.product.findUnique({
      where: { id },
      select: { _count: { select: { orderItems: true } } },
    });
    if (!existing) {
      return NextResponse.json({ error: "Not found", message: "المنتج غير موجود." }, { status: 404 });
    }
    if (existing._count.orderItems > 0) {
      return await archive(id, existing._count.orderItems);
    }

    // Landing-page lines cascade; nothing else references a product.
    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ ok: true, archived: false });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      // An order landed between the count and the delete.
      if (e.code === "P2003") {
        try {
          return await archive(id, await prisma.orderItem.count({ where: { productId: id } }));
        } catch (archiveError) {
          e = archiveError;
        }
      } else if (e.code === "P2025") {
        return NextResponse.json({ error: "Not found", message: "المنتج غير موجود." }, { status: 404 });
      }
    }
    console.error("[admin/products DELETE]", e);
    return NextResponse.json(
      { error: "DELETE_FAILED", message: "تعذر حذف المنتج، حاول مرة ثانية. إذا تكرر الخطأ ابلغنا." },
      { status: 500 },
    );
  }
}
