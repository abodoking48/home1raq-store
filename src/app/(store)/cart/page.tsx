"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { useCart } from "@/contexts/cart-context";
import { formatIqd } from "@/lib/currency";
import { siteCopy } from "@/lib/stitch-copy";
import { cn } from "@/lib/utils";

export default function CartPage() {
  const { lines, setQuantity, removeLine, subtotal } = useCart();
  const c = siteCopy.cart;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-16">
      <h1 className="font-heading text-4xl font-bold tracking-tight text-foreground md:text-5xl">
        {c.title}
      </h1>
      <p className="mt-3 text-lg font-light text-muted-foreground">{c.subtitle}</p>

      {lines.length === 0 ? (
        <div className="glass-panel mt-10 rounded-2xl p-10 text-center">
          <p className="text-muted-foreground">{c.empty}</p>
          <Link
            href="/products"
            className={cn(
              buttonVariants({ variant: "outline" }),
              "mt-6 inline-flex rounded-full border-white/15 px-6",
            )}
          >
            {siteCopy.hero.ctaPrimary}
          </Link>
        </div>
      ) : (
        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_380px]">
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-foreground">{c.contentsTitle}</h2>
            {lines.map((line) => (
              <div
                key={line.productId}
                className="glass-panel flex flex-col gap-4 rounded-2xl p-4 sm:flex-row sm:items-center"
              >
                <div className="relative h-28 w-full shrink-0 overflow-hidden rounded-xl bg-[#0a0c0b] sm:h-24 sm:w-24">
                  {line.image ? (
                    <Image
                      src={line.image}
                      alt={line.name}
                      fill
                      sizes="(max-width: 639px) 100vw, 96px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                      —
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/products/${encodeURIComponent(line.slug)}`}
                    className="text-lg font-bold hover:text-primary"
                  >
                    {line.name}
                  </Link>
                  <p className="mt-1 text-sm font-medium text-primary">
                    {formatIqd(line.price)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    aria-label="نقص الكمية"
                    className={cn(
                      "inline-flex size-9 items-center justify-center rounded-full border border-white/10 bg-white/5",
                      "hover:bg-white/10",
                    )}
                    onClick={() =>
                      setQuantity(line.productId, line.quantity - 1)
                    }
                  >
                    <Minus className="size-4" />
                  </button>
                  <span className="min-w-8 text-center text-sm tabular-nums">
                    {line.quantity}
                  </span>
                  <button
                    type="button"
                    aria-label="زد الكمية"
                    className={cn(
                      "inline-flex size-9 items-center justify-center rounded-full border border-white/10 bg-white/5",
                      "hover:bg-white/10",
                    )}
                    onClick={() =>
                      setQuantity(line.productId, line.quantity + 1)
                    }
                  >
                    <Plus className="size-4" />
                  </button>
                  <button
                    type="button"
                    aria-label="احذف"
                    className="ms-2 inline-flex size-9 items-center justify-center rounded-full text-destructive hover:bg-destructive/10"
                    onClick={() => removeLine(line.productId)}
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <aside className="glass-panel h-fit rounded-2xl p-6">
            <h2 className="text-xl font-bold text-foreground">{c.summary}</h2>
            <ul className="mt-4 space-y-3 text-sm">
              {lines.map((l) => (
                <li
                  key={l.productId}
                  className="flex justify-between gap-4 text-muted-foreground"
                >
                  <span className="truncate">
                    {l.name} × {l.quantity}
                  </span>
                  <span className="shrink-0 tabular-nums text-foreground">
                    {formatIqd(l.price * l.quantity)}
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-6 border-t border-white/10 pt-4">
              <div className="mb-2 flex justify-between text-sm text-muted-foreground">
                <span>خصم الأعضاء</span>
                <span>—</span>
              </div>
              <div className="flex justify-between font-heading text-xl text-primary">
                <span className="flex items-center gap-2">
                  <span>الإجمالي</span>
                  <span className="text-sm font-semibold text-emerald-400">
                    توصيل مجاني 🚚
                  </span>
                </span>
                <span>{formatIqd(subtotal)}</span>
              </div>
              <p className="mt-1 text-[10px] text-muted-foreground">{c.vatNote}</p>
              <p className="mt-4 text-sm text-muted-foreground">
                {c.delivery}{" "}
                <span className="font-bold text-foreground">{c.deliveryRange}</span>
              </p>
            </div>
            <Link
              href="/checkout"
              className={cn(
                buttonVariants(),
                "btn-gradient-neon mt-6 flex w-full justify-center rounded-2xl py-6 text-base font-bold",
              )}
            >
              {c.continue}
            </Link>
            <Link
              href="/products"
              className={cn(
                buttonVariants({ variant: "ghost" }),
                "mt-3 flex w-full justify-center",
              )}
            >
              {siteCopy.nav.products}
            </Link>
            <div className="mt-5 space-y-2 border-t border-white/10 pt-4 text-xs text-muted-foreground">
              <p>دفع عند الاستلام متاح لكل المحافظات.</p>
              <p>تشفير آمن لبياناتك أثناء إرسال الطلب.</p>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
