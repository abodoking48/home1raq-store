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

function sumOrderLinesTotal(
  lines: { priceAtOrder: Prisma.Decimal | number | unknown; quantity: number }[],
): Prisma.Decimal {
  const sum = lines.reduce(
    (acc, row) => acc + Number(row.priceAtOrder) * row.quantity,
    0,
  );
  return new Prisma.Decimal(sum);
}

export async function DELETE(_req: Request, ctx: RouteContext) {
  if (!(await getAdminUser())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;

  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    await prisma.$transaction(async (tx) => {
      const affectedLines = await tx.orderItem.findMany({
        where: { productId: id },
        select: { orderId: true },
      });
      const orderIds = [...new Set(affectedLines.map((row) => row.orderId))];

      await tx.orderItem.deleteMany({ where: { productId: id } });

      for (const orderId of orderIds) {
        const remaining = await tx.orderItem.findMany({
          where: { orderId },
          select: { priceAtOrder: true, quantity: true },
        });
        if (remaining.length === 0) {
          await tx.order.delete({ where: { id: orderId } });
        } else {
          await tx.order.update({
            where: { id: orderId },
            data: { total: sumOrderLinesTotal(remaining) },
          });
        }
      }

      await tx.product.delete({ where: { id } });
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2003") {
      return NextResponse.json(
        {
          error: "FOREIGN_KEY",
          message:
            "تعذر الحذف بسبب ارتباط هذا المنتج ببيانات أخرى غير الطلبات. راجع صفحات الهبوط أو الإعدادات.",
        },
        { status: 409 },
      );
    }
    console.error("[admin/products DELETE]", e);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
