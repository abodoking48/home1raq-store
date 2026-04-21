"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";
import type { LandingReview } from "@/lib/landing-settings";
import { cn } from "@/lib/utils";

type ReadonlyLandingReviewsProps = {
  readonly reviews: LandingReview[];
};

export function LandingReviews({ reviews }: ReadonlyLandingReviewsProps) {
  return (
    <section className="relative overflow-hidden py-12">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      <div className="px-4 md:px-8">
        <h3 className="mb-6 text-center font-heading text-2xl font-bold md:text-3xl">
          آراء العملاء
        </h3>
        <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 [-ms-overflow-style:none] [scrollbar-width:none] md:mx-0 md:grid md:max-w-5xl md:snap-none md:grid-cols-3 md:gap-4 md:overflow-visible md:px-0 [&::-webkit-scrollbar]:hidden">
          {reviews.map((r, i) => (
            <motion.article
              key={`${r.name}-${i}`}
              initial={{ opacity: 0, scale: 0.98 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className={cn(
                "glass-panel min-w-[85vw] shrink-0 snap-center rounded-2xl p-5 ring-1 ring-white/10",
                "md:min-w-0",
              )}
            >
              <div className="mb-2 flex gap-0.5 text-primary" aria-label={`تقييم ${r.rating} من 5`}>
                {Array.from({ length: 5 }).map((_, j) => (
                  <Star
                    key={j}
                    className={cn(
                      "size-4",
                      j < r.rating ? "fill-primary text-primary" : "fill-transparent text-white/15",
                    )}
                  />
                ))}
              </div>
              <p className="font-medium text-foreground/95">&ldquo;{r.text}&rdquo;</p>
              <p className="mt-3 text-sm text-muted-foreground">— {r.name}</p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
