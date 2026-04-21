import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth/admin";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slug";
import { categoryCreateSchema } from "@/lib/category-schema";
import { DEFAULT_CATEGORY_ICON } from "@/lib/category-icons";

export async function GET() {
  if (!(await getAdminUser())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const categories = await prisma.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { updatedAt: "desc" }],
    include: {
      _count: { select: { products: true } },
    },
  });

  return NextResponse.json({ categories });
}

export async function POST(req: Request) {
  if (!(await getAdminUser())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = categoryCreateSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten() },
      { status: 422 },
    );
  }

  const baseSlug = slugify(parsed.data.name);
  let slug = baseSlug;
  let n = 1;
  while (await prisma.category.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${n++}`;
  }

  const category = await prisma.category.create({
    data: {
      name: parsed.data.name,
      slug,
      icon: parsed.data.icon ?? DEFAULT_CATEGORY_ICON,
      iconUrl: parsed.data.iconUrl || null,
      description: parsed.data.description || null,
      active: parsed.data.active ?? true,
      sortOrder: parsed.data.sortOrder ?? 0,
    },
  });

  return NextResponse.json({ category });
}

