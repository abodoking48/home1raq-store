"use client";

import { Timer } from "lucide-react";
import { useEvergreenCountdown } from "@/hooks/use-evergreen-countdown";
import { cn } from "@/lib/utils";

type ReadonlyLandingInlineCountdownProps = {
  readonly countdownHours: number;
  readonly productId: string;
  readonly landingPageId: string | null;
};

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

export function LandingInlineCountdown({
  countdownHours,
  productId,
  landingPageId,
}: ReadonlyLandingInlineCountdownProps) {
  const { segments, ready } = useEvergreenCountdown(
    countdownHours,
    productId,
    landingPageId,
  );
  const { days, hours, minutes, seconds } = segments;

  const blocks = [
    { label: "يوم", value: days },
    { label: "ساعة", value: hours },
    { label: "دقيقة", value: minutes },
    { label: "ثانية", value: seconds },
  ];

  return (
    <div
      className={cn(
        "rounded-2xl border border-primary/25 bg-black/30 px-3 py-3 backdrop-blur-md",
        !ready && "opacity-70",
      )}
      aria-live="polite"
    >
      <div className="mb-2 flex items-center justify-center gap-2 text-[11px] font-semibold text-primary md:text-xs">
        <Timer className="size-3.5 shrink-0" aria-hidden />
        <span>ينتهي العرض خلال</span>
      </div>
      <div className="grid grid-cols-4 gap-1.5 md:gap-2">
        {blocks.map((b) => (
          <div
            key={b.label}
            className="rounded-xl border border-white/10 bg-black/40 px-0.5 py-2 text-center"
          >
            <p className="font-mono text-sm font-bold tabular-nums text-primary md:text-lg">
              {pad(b.value)}
            </p>
            <p className="text-[9px] text-muted-foreground md:text-[10px]">{b.label}</p>
          </div>
        ))}
      </div>
      <p className="mt-2 text-center text-[10px] text-muted-foreground md:text-[11px]">
        يُحفظ على جهازك ويُجدد تلقائياً بعد انتهاء المدة
      </p>
    </div>
  );
}
