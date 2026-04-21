"use client";

import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LandingPrimaryCtaButton } from "@/components/landing/landing-primary-cta-button";
import { formatIqd } from "@/lib/currency";
import type { LandingProductPayload } from "@/lib/landing-settings";
import { cn } from "@/lib/utils";

type ReadonlyLandingStickyCtaProps = {
  readonly product: LandingProductPayload;
  readonly quantity: number;
  readonly onQuantityChange: (q: number) => void;
  readonly onOrderClick: () => void;
};

export function LandingStickyCta({
  product,
  quantity,
  onQuantityChange,
  onOrderClick,
}: ReadonlyLandingStickyCtaProps) {
  return (
    <div
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 border-t border-primary/20 bg-background/90 shadow-[0_-12px_40px_rgba(0,0,0,0.45)]",
        "px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-xl",
      )}
    >
      <div
        className={cn(
          "mx-auto flex w-full max-w-lg flex-col gap-3 md:max-w-2xl md:flex-row md:items-center md:gap-4",
        )}
      >
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div className="flex shrink-0 items-center rounded-xl border border-white/10 bg-black/25 p-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-10 rounded-lg"
              onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
              aria-label="تقليل الكمية"
            >
              <Minus className="size-4" />
            </Button>
            <span className="min-w-9 text-center font-mono text-sm font-bold tabular-nums">
              {quantity}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-10 rounded-lg"
              onClick={() => onQuantityChange(quantity + 1)}
              aria-label="زيادة الكمية"
            >
              <Plus className="size-4" />
            </Button>
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs text-muted-foreground">{product.name}</p>
            <p className="font-heading text-lg font-black text-primary md:text-xl">
              {formatIqd(product.price * quantity)}
            </p>
          </div>
        </div>
        <LandingPrimaryCtaButton
          pulse={false}
          onClick={onOrderClick}
          className="shadow-[0_8px_28px_rgba(0,255,136,0.35)] md:min-w-[200px] md:max-w-[280px] md:shrink-0"
          aria-label="اطلب الآن والانتقال إلى نموذج الطلب"
        />
      </div>
    </div>
  );
}
