"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowDown, ArrowLeft, Sparkles } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { siteCopy } from "@/lib/stitch-copy";
import { cn } from "@/lib/utils";

export function HeroSection() {
  const h = siteCopy.hero;
  const [showScrollIndicator, setShowScrollIndicator] = useState(true);

  useEffect(() => {
    const onScroll = () => {
      setShowScrollIndicator(window.scrollY < 200);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToCategories = () => {
    const categoriesSection = document.getElementById("home-categories");
    categoriesSection?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section className="relative flex h-[85vh] items-start justify-center overflow-hidden px-4 pb-16 pt-4 md:px-6 md:pt-6">
      <div className="pointer-events-none absolute inset-0 -z-20 bg-[radial-gradient(circle_at_50%_50%,rgba(0,255,136,0.12)_0%,rgba(2,4,3,0)_70%)]" />
      <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,255,136,0.1)_0%,rgba(2,4,3,0)_70%)]" />

      <div className="relative z-10 mx-auto max-w-5xl space-y-8 pt-4 text-center md:space-y-10 md:pt-6">
        <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-5 py-2 text-sm font-medium text-primary">
          <Sparkles className="size-4 shrink-0" aria-hidden />
          {h.badge}
        </div>

        <h1 className="font-heading text-5xl font-black leading-[1.1] tracking-tight text-foreground md:text-7xl lg:text-8xl">
          {h.titleBefore}
          <br />
          <span className="text-primary">{h.titleBrand}</span>
        </h1>

        <p className="mx-auto max-w-3xl text-lg font-light leading-relaxed text-muted-foreground md:text-2xl">
          {h.subtitle}
        </p>

        <div className="flex flex-col items-center justify-center gap-4 pt-2 sm:flex-row sm:gap-6">
          <Link
            href="/products"
            className={cn(
              buttonVariants({ size: "lg" }),
              "inline-flex min-h-14 items-center gap-3 rounded-2xl bg-primary px-10 py-6 text-lg font-bold text-primary-foreground shadow-[0_0_20px_rgba(0,255,136,0.3)] transition-transform hover:scale-[1.02] active:scale-[0.98]",
            )}
          >
            {h.ctaPrimary}
            <ArrowLeft className="size-5 rtl:rotate-180" aria-hidden />
          </Link>
          <Link
            href="/#community"
            className={cn(
              buttonVariants({ size: "lg", variant: "outline" }),
              "min-h-14 rounded-2xl border-white/10 bg-white/[0.08] px-10 py-6 text-lg font-medium transition-transform hover:bg-white/10 active:scale-[0.98]",
            )}
          >
            {h.ctaSecondary}
          </Link>
        </div>

      </div>
      <button
        type="button"
        onClick={scrollToCategories}
        aria-label="اكتشف المزيد"
        className={cn(
          "absolute bottom-4 left-1/2 z-20 flex w-fit -translate-x-1/2 flex-col items-center gap-1 text-primary transition-all duration-300",
          showScrollIndicator
            ? "translate-y-0 opacity-100"
            : "pointer-events-none translate-y-2 opacity-0",
        )}
      >
        <span className="text-sm font-semibold">اكتشف المزيد ↓</span>
        <ArrowDown className="hero-scroll-indicator size-5" aria-hidden />
      </button>
    </section>
  );
}
