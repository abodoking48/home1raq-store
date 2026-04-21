import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { getAdminUser } from "@/lib/auth/admin";
import { prisma } from "@/lib/prisma";

const patchSchema = z.object({
  displayOrder: z.number().int().min(0).optional(),
  titleOverride: z.string().max(500).nullable().optional(),
  customDescription: z.string().max(8000).nullable().optional(),
  imagesOverride: z.array(z.string().min(1)).optional(),
  videoUrl: z.string().max(2000).nullable().optional(),
  customPrice: z.number().positive().nullable().optional(),
  customCompareAt: z.number().positive().nullable().optional(),
  onPromoOverride: z.boolean().nullable().optional(),
  displayRating: z.number().int().min(1).max(5).nullable().optional(),
});

type RouteParams = { params: Promise<{ id: string; lppId: string }> };

export async function PATCH(req: Request, { params }: RouteParams) {
  if (!(await getAdminUser())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id: landingPageId, lppId } = await params;

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

  const d = parsed.data;
  const data: Prisma.LandingPageProductUpdateInput = {};
  if (d.displayOrder !== undefined) data.displayOrder = d.displayOrder;
  if (d.titleOverride !== undefined) data.titleOverride = d.titleOverride;
  if (d.customDescription !== undefined) {
    data.customDescription = d.customDescription;
  }
  if (d.imagesOverride !== undefined) data.imagesOverride = d.imagesOverride;
  if (d.videoUrl !== undefined) data.videoUrl = d.videoUrl;
  if (d.customPrice !== undefined) {
    data.customPrice =
      d.customPrice != null ? new Prisma.Decimal(d.customPrice) : null;
  }
  if (d.customCompareAt !== undefined) {
    data.customCompareAt =
      d.customCompareAt != null ? new Prisma.Decimal(d.customCompareAt) : null;
  }
  if (d.onPromoOverride !== undefined) data.onPromoOverride = d.onPromoOverride;
  if (d.displayRating !== undefined) data.displayRating = d.displayRating;

  try {
    const row = await prisma.landingPageProduct.update({
      where: { id: lppId, landingPageId },
      data,
      include: {
        product: { select: { id: true, name: true, slug: true, active: true, price: true } },
      },
    });
    return NextResponse.json({ line: row });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025") {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    throw e;
  }
}

export async function DELETE(_req: Request, { params }: RouteParams) {
  if (!(await getAdminUser())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id: landingPageId, lppId } = await params;
  try {
    await prisma.landingPageProduct.delete({
      where: { id: lppId, landingPageId },
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025") {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    throw e;
  }
}
