import { NextResponse } from "next/server";
import { LandingPageMode, Prisma } from "@prisma/client";
import { z } from "zod";
import { getAdminUser } from "@/lib/auth/admin";
import { prisma } from "@/lib/prisma";
import {
  defaultLandingBenefits,
  defaultLandingReviews,
} from "@/lib/landing-defaults";

const createSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(2)
    .max(80)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  title: z.string().max(200).optional(),
  enabled: z.boolean().optional(),
  mode: z.nativeEnum(LandingPageMode).optional(),
  countdownHours: z.number().int().min(1).max(168).optional(),
  whatsappOverride: z.string().max(32).nullable().optional(),
  offerBadge: z.string().max(200).optional(),
  offerTitle: z.string().max(300).optional(),
  offerTitleAccent: z.string().max(200).optional(),
  offerSubtitle: z.string().max(2000).optional(),
});

export async function GET() {
  if (!(await getAdminUser())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const rows = await prisma.landingPage.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      _count: { select: { products: true } },
    },
  });
  return NextResponse.json({ landingPages: rows });
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
    const flat = parsed.error.flatten();
    const slugErr = flat.fieldErrors.slug?.[0];
    return NextResponse.json(
      {
        error: slugErr ?? "Validation failed",
        issues: flat,
      },
      { status: 422 },
    );
  }

  const d = parsed.data;
  const slug = d.slug.toLowerCase();

  try {
    const row = await prisma.landingPage.create({
      data: {
        slug,
        title: d.title ?? "",
        enabled: d.enabled ?? true,
        mode: d.mode ?? LandingPageMode.SLIDER,
        countdownHours: d.countdownHours ?? 48,
        whatsappOverride: d.whatsappOverride ?? undefined,
        offerBadge: d.offerBadge ?? "",
        offerTitle: d.offerTitle ?? "",
        offerTitleAccent: d.offerTitleAccent ?? "",
        offerSubtitle: d.offerSubtitle ?? "",
        benefitsJson: defaultLandingBenefits as unknown as Prisma.InputJsonValue,
        reviewsJson: defaultLandingReviews as unknown as Prisma.InputJsonValue,
      },
    });
    return NextResponse.json({ landingPage: row });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return NextResponse.json({ error: "Slug already exists" }, { status: 409 });
    }
    throw e;
  }
}
