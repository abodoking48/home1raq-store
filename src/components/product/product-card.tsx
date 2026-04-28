import Image from "next/image";
import Link from "next/link";
import { formatIqdNumber } from "@/lib/currency";
import { cn } from "@/lib/utils";

export type ProductCardProps = {
  id: string;
  slug: string;
  name: string;
  price: number;
  compareAtPrice?: number | null;
  onPromo?: boolean;
  image: string | null;
  className?: string;
  /** أنماط Stitch: شبكة «الأكثر طلباً» مقابل بطاقات «أحدث المنتجات» الزجاجية */
  variant?: "default" | "popular" | "latest";
  /** Overrides variant image frame (e.g. homepage uniform grid). */
  imageAspectRatio?: "3/4";
};

export function ProductCard({
  slug,
  name,
  price,
  compareAtPrice,
  onPromo,
  image,
  className,
  variant = "default",
  imageAspectRatio,
}: ProductCardProps) {
  const isLatest = variant === "latest";
  const isPopular = variant === "popular";
  const uniform34 = imageAspectRatio === "3/4";

  return (
    <article className={cn("group", className)}>
      <Link href={`/products/${encodeURIComponent(slug)}`} className="block">
        <div
          className={cn(
            "relative overflow-hidden transition-transform duration-300 group-hover:-translate-y-1",
            isLatest
              ? "rounded-[2.5rem] border border-white/[0.08] bg-white/[0.03] p-4 shadow-none backdrop-blur-xl"
              : "glass-panel rounded-2xl border border-white/[0.08]",
          )}
        >
          <div
            className={cn(
              "relative w-full min-h-0 overflow-hidden bg-[#0a0c0b]",
              uniform34 && "aspect-[3/4] rounded-2xl",
              !uniform34 && isLatest && "mb-6 aspect-square rounded-[2rem]",
              !uniform34 && !isLatest && "aspect-[4/5]",
              uniform34 && isLatest && "mb-4",
            )}
          >
            {onPromo && (
              <span className="absolute end-3 top-3 z-[1] rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary-foreground shadow-lg">
                عرض
              </span>
            )}
            {image ? (
              <Image
                src={image}
                alt={name}
                fill
                sizes="(max-width: 640px) 50vw, 33vw"
                className="object-cover transition duration-500 group-hover:scale-[1.03]"
              />
            ) : (
              <div className="h-full min-h-0 w-full bg-[#0a0c0b]" aria-hidden />
            )}
            {!isPopular && !isLatest && (
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            )}
          </div>
          <div className={cn("space-y-2", isLatest ? "px-2 pb-2" : "p-4 md:p-6")}>
            <h3
              className={cn(
                "font-heading font-bold leading-snug text-foreground",
                isLatest ? "text-2xl" : "text-lg",
              )}
            >
              {name}
            </h3>
            <div
              className={cn(
                "flex items-end justify-between gap-3 border-t border-white/5 pt-3",
                isPopular && "pt-4",
              )}
            >
              <div>
                {compareAtPrice != null && compareAtPrice > price && (
                  <span className="mb-0.5 block text-sm text-muted-foreground line-through decoration-white/40">
                    {formatIqdNumber(compareAtPrice)}
                  </span>
                )}
                <span
                  className={cn(
                    "block font-black tabular-nums text-primary",
                    isLatest ? "text-2xl" : "text-xl",
                  )}
                >
                  {formatIqdNumber(price)}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  دينار عراقي
                </span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </article>
  );
}
