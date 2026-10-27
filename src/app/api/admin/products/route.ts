import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { getAdminUser } from "@/lib/auth/admin";
import { prisma } from "@/lib/prisma";
import { createProduct, productCreateSchema } from "@/lib/products/create";

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
  const parsed = productCreateSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten() },
      { status: 422 },
    );
  }

  try {
    const product = await createProduct(parsed.data);
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
