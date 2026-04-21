import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { siteCopy } from "@/lib/stitch-copy";
import { cn } from "@/lib/utils";

export function HomePromoSection() {
  const p = siteCopy.promo;
  return (
    <section id={p.id} className="mx-auto max-w-7xl px-4 py-12 md:px-8 md:py-20">
      <div className="relative flex flex-col items-center justify-center overflow-hidden rounded-3xl bg-[#007b4d] p-12 text-center shadow-2xl shadow-primary/20 md:p-24">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-50" />
        <div className="relative z-10 max-w-4xl space-y-6 md:space-y-8">
          <h2 className="font-heading text-4xl font-black leading-tight text-white md:text-6xl lg:text-7xl">
            {p.title}
          </h2>
          <p className="text-lg font-medium text-white/90 md:text-2xl">
            {p.subtitle}
          </p>
          <Link
            href="/products?promo=1"
            className={cn(
              buttonVariants({ size: "lg" }),
              "inline-flex rounded-2xl bg-white px-10 py-6 text-lg font-bold text-[#007b4d] shadow-none hover:bg-white/90",
            )}
          >
            {p.cta}
          </Link>
        </div>
      </div>
    </section>
  );
}
