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

export async function DELETE(_req: Request, ctx: RouteContext) {
  if (!(await getAdminUser())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;
  try {
    await prisma.product.delete({ where: { id } });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
