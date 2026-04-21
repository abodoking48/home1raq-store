import { NextResponse } from "next/server";
import { LandingPageMode, Prisma } from "@prisma/client";
import { z } from "zod";
import { getAdminUser } from "@/lib/auth/admin";
import { prisma } from "@/lib/prisma";

const benefitSchema = z.object({
  title: z.string().min(1),
  description: z.string(),
  icon: z.string().default("sparkles"),
});

const reviewSchema = z.object({
  name: z.string().min(1),
  text: z.string().min(1),
  rating: z.number().min(1).max(5),
  city: z.string().optional(),
});

const patchSchema = z.object({
  title: z.string().max(200).optional(),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(80)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .optional(),
  enabled: z.boolean().optional(),
  mode: z.nativeEnum(LandingPageMode).optional(),
  countdownHours: z.number().int().min(1).max(168).optional(),
  whatsappOverride: z.string().max(32).nullable().optional(),
  offerBadge: z.string().max(200).optional(),
  offerTitle: z.string().max(300).optional(),
  offerTitleAccent: z.string().max(200).optional(),
  offerSubtitle: z.string().max(2000).optional(),
  benefitsJson: z.array(benefitSchema).optional(),
  reviewsJson: z.array(reviewSchema).optional(),
  defaultProductIndex: z.number().int().min(0).max(99).optional(),
  sliderAutoPlay: z.boolean().optional(),
  sliderAutoPlayIntervalSec: z.number().int().min(3).max(10).optional(),
});

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: RouteParams) {
  if (!(await getAdminUser())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const row = await prisma.landingPage.findUnique({
    where: { id },
    include: {
      products: {
        include: {
          product: { select: { id: true, name: true, slug: true, active: true, price: true } },
        },
        orderBy: { displayOrder: "asc" },
      },
    },
  });
  if (!row) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ landingPage: row });
}

export async function PATCH(req: Request, { params }: RouteParams) {
  if (!(await getAdminUser())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;

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

  const nextMode = d.mode;
  if (nextMode === LandingPageMode.SINGLE) {
    const n = await prisma.landingPageProduct.count({ where: { landingPageId: id } });
    if (n > 1) {
      return NextResponse.json(
        {
          error:
            "وضع منتج واحد يتطلب حذف المنتجات الإضافية أولاً (احتفظ بمنتج واحد فقط).",
        },
        { status: 400 },
      );
    }
  }

  const data: Prisma.LandingPageUpdateInput = {};
  if (d.title !== undefined) data.title = d.title;
  if (d.slug !== undefined) data.slug = d.slug.toLowerCase();
  if (d.enabled !== undefined) data.enabled = d.enabled;
  if (d.mode !== undefined) data.mode = d.mode;
  if (d.countdownHours !== undefined) data.countdownHours = d.countdownHours;
  if (d.whatsappOverride !== undefined) data.whatsappOverride = d.whatsappOverride;
  if (d.offerBadge !== undefined) data.offerBadge = d.offerBadge;
  if (d.offerTitle !== undefined) data.offerTitle = d.offerTitle;
  if (d.offerTitleAccent !== undefined) data.offerTitleAccent = d.offerTitleAccent;
  if (d.offerSubtitle !== undefined) data.offerSubtitle = d.offerSubtitle;
  if (d.benefitsJson !== undefined) {
    data.benefitsJson = d.benefitsJson as Prisma.InputJsonValue;
  }
  if (d.reviewsJson !== undefined) {
    data.reviewsJson = d.reviewsJson as Prisma.InputJsonValue;
  }
  if (d.defaultProductIndex !== undefined) data.defaultProductIndex = d.defaultProductIndex;
  if (d.sliderAutoPlay !== undefined) data.sliderAutoPlay = d.sliderAutoPlay;
  if (d.sliderAutoPlayIntervalSec !== undefined) {
    data.sliderAutoPlayIntervalSec = d.sliderAutoPlayIntervalSec;
  }

  try {
    const row = await prisma.landingPage.update({
      where: { id },
      data,
      include: {
        products: {
          include: {
            product: { select: { id: true, name: true, slug: true, active: true, price: true } },
          },
          orderBy: { displayOrder: "asc" },
        },
      },
    });
    return NextResponse.json({ landingPage: row });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return NextResponse.json({ error: "Slug already exists" }, { status: 409 });
    }
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
  const { id } = await params;
  try {
    await prisma.landingPage.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025") {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    throw e;
  }
}
