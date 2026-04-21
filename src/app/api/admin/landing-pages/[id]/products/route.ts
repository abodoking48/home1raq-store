import { NextResponse } from "next/server";
import { LandingPageMode, Prisma } from "@prisma/client";
import { z } from "zod";
import { getAdminUser } from "@/lib/auth/admin";
import { prisma } from "@/lib/prisma";

const postSchema = z.object({
  productId: z.string().min(1),
  displayOrder: z.number().int().min(0).optional(),
  titleOverride: z.string().max(500).nullable().optional(),
  customDescription: z.string().max(8000).nullable().optional(),
  imagesOverride: z.array(z.string().min(1)).optional(),
  videoUrl: z.string().max(2000).nullable().optional(),
  customPrice: z.number().positive().nullable().optional(),
  customCompareAt: z.number().positive().nullable().optional(),
  onPromoOverride: z.boolean().nullable().optional(),
});

type RouteParams = { params: Promise<{ id: string }> };

export async function POST(req: Request, { params }: RouteParams) {
  if (!(await getAdminUser())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id: landingPageId } = await params;

  const page = await prisma.landingPage.findUnique({ where: { id: landingPageId } });
  if (!page) {
    return NextResponse.json({ error: "Landing page not found" }, { status: 404 });
  }

  if (page.mode === LandingPageMode.SINGLE) {
    const n = await prisma.landingPageProduct.count({ where: { landingPageId } });
    if (n >= 1) {
      return NextResponse.json(
        { error: "وضع منتج واحد يسمح بمنتج واحد فقط على هذه الصفحة." },
        { status: 400 },
      );
    }
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = postSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten() },
      { status: 422 },
    );
  }

  const d = parsed.data;
  const product = await prisma.product.findFirst({
    where: { id: d.productId, active: true },
  });
  if (!product) {
    return NextResponse.json({ error: "Product not found or inactive" }, { status: 400 });
  }

  const maxOrder = await prisma.landingPageProduct.aggregate({
    where: { landingPageId },
    _max: { displayOrder: true },
  });
  const nextOrder = d.displayOrder ?? (maxOrder._max.displayOrder ?? -1) + 1;

  try {
    const row = await prisma.landingPageProduct.create({
      data: {
        landingPageId,
        productId: d.productId,
        displayOrder: nextOrder,
        titleOverride: d.titleOverride ?? undefined,
        customDescription: d.customDescription ?? undefined,
        imagesOverride: d.imagesOverride ?? [],
        videoUrl: d.videoUrl ?? undefined,
        customPrice:
          d.customPrice != null ? new Prisma.Decimal(d.customPrice) : undefined,
        customCompareAt:
          d.customCompareAt != null ? new Prisma.Decimal(d.customCompareAt) : undefined,
        onPromoOverride: d.onPromoOverride ?? undefined,
      },
      include: {
        product: { select: { id: true, name: true, slug: true, active: true, price: true } },
      },
    });
    return NextResponse.json({ line: row });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return NextResponse.json(
        { error: "This product is already on this landing page" },
        { status: 409 },
      );
    }
    throw e;
  }
}
