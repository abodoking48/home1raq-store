"use client";

import { motion } from "framer-motion";
import { Package, ShieldCheck, Sparkles, Truck, type LucideIcon } from "lucide-react";
import type { LandingBenefit } from "@/lib/landing-settings";
import { cn } from "@/lib/utils";

const ICON_MAP: Record<string, LucideIcon> = {
  truck: Truck,
  "shield-check": ShieldCheck,
  sparkles: Sparkles,
  package: Package,
};

type ReadonlyLandingBenefitsProps = {
  readonly benefits: LandingBenefit[];
};

export function LandingBenefits({ benefits }: ReadonlyLandingBenefitsProps) {
  return (
    <section className="px-4 py-12 md:px-8">
      <div className="mx-auto max-w-5xl">
        <h3 className="mb-8 text-center font-heading text-2xl font-bold md:text-3xl">
          ليش تختار <span className="text-primary">Home1raq</span>؟
        </h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {benefits.map((b, i) => {
            const Icon = ICON_MAP[b.icon] ?? Sparkles;
            return (
              <motion.div
                key={`${b.title}-${i}`}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ delay: i * 0.06, duration: 0.45 }}
                className={cn(
                  "glass-panel rounded-2xl p-5 ring-1 ring-white/10",
                  "hover:border-primary/25 hover:shadow-[0_0_24px_rgba(0,255,136,0.08)]",
                )}
              >
                <div className="mb-3 flex size-11 items-center justify-center rounded-xl bg-primary/15 text-primary">
                  <Icon className="size-5" aria-hidden />
                </div>
                <p className="font-heading text-lg font-semibold">{b.title}</p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{b.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
