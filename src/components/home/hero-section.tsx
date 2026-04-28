import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Sparkles } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { siteCopy } from "@/lib/stitch-copy";
import { cn } from "@/lib/utils";

export function HeroSection() {
  const h = siteCopy.hero;

  return (
    <section className="relative flex min-h-[85vh] items-center justify-center overflow-hidden px-4 pb-16 pt-28 md:px-6">
      <div className="pointer-events-none absolute inset-0 -z-20">
        <Image
          src="/file.svg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-10"
        />
      </div>
      <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,255,136,0.1)_0%,rgba(2,4,3,0)_70%)]" />
      <div className="pointer-events-none absolute left-1/2 top-20 -z-10 size-[min(100vw,800px)] -translate-x-1/2 rounded-full bg-primary/5 blur-[120px]" />

      <div className="relative z-10 mx-auto max-w-5xl space-y-8 text-center md:space-y-10">
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
              "min-h-14 rounded-2xl border-white/10 bg-white/5 px-10 py-6 text-lg font-medium backdrop-blur-xl transition-transform hover:bg-white/10 active:scale-[0.98]",
            )}
          >
            {h.ctaSecondary}
          </Link>
        </div>

        <div className="flex justify-center pt-12">
          <div className="flex h-12 w-8 justify-center rounded-full border-2 border-white/20 p-2">
            <span className="size-1.5 animate-bounce rounded-full bg-primary" />
          </div>
        </div>
      </div>
    </section>
  );
}
