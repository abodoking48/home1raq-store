import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth/admin";
import { categoryPatchSchema } from "@/lib/category-schema";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slug";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_req: Request, ctx: RouteContext) {
  if (!(await getAdminUser())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await ctx.params;
  const category = await prisma.category.findUnique({
    where: { id },
    include: { _count: { select: { products: true } } },
  });
  if (!category) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ category });
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

  const parsed = categoryPatchSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten() },
      { status: 422 },
    );
  }

  const existing = await prisma.category.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  let slug = existing.slug;
  if (parsed.data.name && parsed.data.name !== existing.name) {
    const base = slugify(parsed.data.name);
    slug = base;
    let n = 1;
    while (
      await prisma.category.findFirst({
        where: { slug, NOT: { id } },
      })
    ) {
      slug = `${base}-${n++}`;
    }
  }

  const category = await prisma.category.update({
    where: { id },
    data: {
      ...parsed.data,
      iconUrl: parsed.data.iconUrl === undefined ? undefined : (parsed.data.iconUrl || null),
      description:
        parsed.data.description === undefined
          ? undefined
          : (parsed.data.description || null),
      slug,
    },
  });

  return NextResponse.json({ category });
}

export async function DELETE(_req: Request, ctx: RouteContext) {
  if (!(await getAdminUser())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await ctx.params;

  try {
    await prisma.category.delete({ where: { id } });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}

