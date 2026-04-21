import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { getAdminUser } from "@/lib/auth/admin";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slug";

const createSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  price: z.number().positive(),
  compareAtPrice: z.number().positive().optional().nullable(),
  onPromo: z.boolean().optional(),
  images: z.array(z.string().url()).default([]),
  active: z.boolean().optional(),
  categoryId: z.string().cuid().optional().nullable(),
});

export async function GET() {
  if (!(await getAdminUser())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const products = await prisma.product.findMany({
    orderBy: { updatedAt: "desc" },
    include: { category: true },
  });
  return NextResponse.json({ products });
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
  const parsed = createSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten() },
      { status: 422 },
    );
  }

  const baseSlug = slugify(parsed.data.name);
  let slug = baseSlug;
  let n = 1;
  while (await prisma.product.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${n++}`;
  }

  try {
    const product = await prisma.product.create({
      data: {
        name: parsed.data.name,
        slug,
        description: parsed.data.description,
        price: parsed.data.price,
        compareAtPrice: parsed.data.compareAtPrice ?? null,
        onPromo: parsed.data.onPromo ?? false,
        images: parsed.data.images,
        active: parsed.data.active ?? true,
        categoryId: parsed.data.categoryId || null,
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
