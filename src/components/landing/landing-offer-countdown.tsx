"use client";

import { motion } from "framer-motion";
import { Timer } from "lucide-react";
import { useEvergreenCountdown } from "@/hooks/use-evergreen-countdown";
import type { LandingPagePayload } from "@/lib/landing-settings";
import { cn } from "@/lib/utils";

type ReadonlyLandingOfferCountdownProps = {
  readonly settings: LandingPagePayload["settings"];
  readonly productId: string | null;
  readonly landingPageSlug?: string | null;
};

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

export function LandingOfferCountdown({
  settings,
  productId,
  landingPageSlug = null,
}: ReadonlyLandingOfferCountdownProps) {
  const { segments, ready, isExpired } = useEvergreenCountdown(
    settings.countdownHours,
    productId,
    landingPageSlug,
  );
  const { days, hours, minutes, seconds } = segments;

  const blocks = [
    { label: "يوم", value: days },
    { label: "ساعة", value: hours },
    { label: "دقيقة", value: minutes },
    { label: "ثانية", value: seconds },
  ];

  return (
    <section className="px-4 py-10 md:px-8">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="glass-panel relative mx-auto max-w-3xl overflow-hidden rounded-3xl p-6 ring-1 ring-primary/20 md:p-10"
      >
        <div className="pointer-events-none absolute -end-20 -top-20 size-56 rounded-full bg-primary/15 blur-3xl" />
        <div className="relative flex flex-col items-center gap-4 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary md:text-sm">
            <Timer className="size-4" aria-hidden />
            {settings.offerBadge}
          </div>
          <h3 className="font-heading text-2xl font-black md:text-4xl">
            {settings.offerTitle}{" "}
            <span className="text-primary drop-shadow-[0_0_20px_rgba(0,255,136,0.35)]">
              {settings.offerTitleAccent}
            </span>
          </h3>
          <p className="max-w-xl text-sm text-muted-foreground md:text-base">{settings.offerSubtitle}</p>

          <div
            className={cn(
              "mt-4 grid w-full max-w-lg grid-cols-4 gap-2 md:gap-3",
              !ready && "opacity-60",
            )}
            aria-live="polite"
          >
            {blocks.map((b) => (
              <div
                key={b.label}
                className="rounded-2xl border border-white/10 bg-black/25 px-1 py-3 text-center backdrop-blur-md md:py-4"
              >
                <p className="font-mono text-xl font-bold tabular-nums text-primary md:text-3xl">
                  {pad(b.value)}
                </p>
                <p className="mt-1 text-[10px] text-muted-foreground md:text-xs">{b.label}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">{isExpired ? "انتهى العرض" : "العدّاد يبدأ من أول زيارة ويُحفظ على جهازك."}</p>
        </div>
      </motion.div>
    </section>
  );
}
