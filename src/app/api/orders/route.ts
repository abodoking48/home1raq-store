import { NextResponse } from "next/server";
import { z } from "zod";
import { isDatabaseUnreachableError } from "@/lib/db-unreachable";
import { prisma } from "@/lib/prisma";

/** Supabase pooler / network flakiness: give interactive tx time to acquire a connection. */
const ORDER_TX_OPTIONS = {
  maxWait: 20_000,
  timeout: 25_000,
} as const;

const bodySchema = z.object({
  fullName: z.string().min(2),
  phone: z.string().min(6),
  address: z.string().min(4),
  city: z.string().min(2),
  notes: z.string().optional().nullable(),
  items: z
    .array(
      z.object({
        productId: z.string(),
        quantity: z.number().int().positive(),
        landingPageProductId: z.string().optional(),
      }),
    )
    .min(1),
});

export async function POST(req: Request) {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten() },
      { status: 422 },
    );
  }

  const { fullName, phone, address, city, notes, items } = parsed.data;

  try {
    const result = await prisma.$transaction(
      async (tx) => {
        let total = 0;
        const resolved: {
          productId: string;
          quantity: number;
          price: number;
        }[] = [];

        for (const line of items) {
          if (line.landingPageProductId) {
            const row = await tx.landingPageProduct.findFirst({
              where: {
                id: line.landingPageProductId,
                productId: line.productId,
              },
              include: {
                product: true,
                landingPage: { select: { enabled: true } },
              },
            });
            if (!row || !row.landingPage.enabled || !row.product.active) {
              throw new Error("LANDING_LINE_INVALID");
            }
            const unit =
              row.customPrice != null
                ? Number(row.customPrice)
                : Number(row.product.price);
            total += unit * line.quantity;
            resolved.push({
              productId: row.product.id,
              quantity: line.quantity,
              price: unit,
            });
          } else {
            const product = await tx.product.findFirst({
              where: { id: line.productId, active: true },
            });
            if (!product) {
              throw new Error("PRODUCT_NOT_FOUND");
            }
            const price = Number(product.price);
            total += price * line.quantity;
            resolved.push({
              productId: product.id,
              quantity: line.quantity,
              price,
            });
          }
        }

        const order = await tx.order.create({
          data: {
            fullName,
            phone,
            address,
            city,
            notes: notes ?? undefined,
            total,
            items: {
              create: resolved.map((r) => ({
                productId: r.productId,
                quantity: r.quantity,
                priceAtOrder: r.price,
              })),
            },
          },
        });

        return order;
      },
      ORDER_TX_OPTIONS,
    );

    return NextResponse.json({ id: result.id });
  } catch (e) {
    if (e instanceof Error && e.message === "PRODUCT_NOT_FOUND") {
      return NextResponse.json({ error: "Invalid product in cart" }, { status: 400 });
    }
    if (e instanceof Error && e.message === "LANDING_LINE_INVALID") {
      return NextResponse.json(
        { error: "Invalid landing page product line" },
        { status: 400 },
      );
    }

    if (isDatabaseUnreachableError(e)) {
      console.error("[orders] database unavailable:", e);
      return NextResponse.json(
        {
          error: "database_unavailable",
          message:
            "تعذر الاتصال بقاعدة البيانات مؤقتاً. تحقق من إنترنتك، من أن مشروع Supabase غير متوقف، ومن صحة DATABASE_URL ثم أعد المحاولة.",
        },
        { status: 503 },
      );
    }

    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
