"use client";

import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { Badge } from "@/components/ui/badge";
import { LandingInlineCountdown } from "@/components/landing/landing-inline-countdown";
import { LandingPrimaryCtaButton } from "@/components/landing/landing-primary-cta-button";
import { formatIqd } from "@/lib/currency";
import { LANDING_FALLBACK_PRODUCT_IMAGE } from "@/lib/landing-defaults";
import type { LandingProductPayload } from "@/lib/landing-settings";
import { cn } from "@/lib/utils";

function thumbSrc(p: LandingProductPayload) {
  const u = p.images[0];
  return u && u.length > 0 ? u : LANDING_FALLBACK_PRODUCT_IMAGE;
}

function RatingRow({ rating }: { readonly rating: number }) {
  return (
    <div className="flex items-center gap-1" aria-label={`تقييم ${rating} من 5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={`star-${rating}-${i}`}
          className={cn(
            "size-4 shrink-0",
            i < rating ? "fill-amber-400 text-amber-400" : "text-white/15",
          )}
        />
      ))}
    </div>
  );
}

type SlideMediaProps = {
  readonly product: LandingProductPayload;
  readonly imageIdx: number;
  readonly onImageIdxChange: (updater: (i: number) => number) => void;
  readonly isActiveSlide: boolean;
  readonly showImageNav: boolean;
};

function SlideMedia({
  product,
  imageIdx,
  onImageIdxChange,
  isActiveSlide,
  showImageNav,
}: SlideMediaProps) {
  const images =
    product.images.length > 0
      ? product.images
      : [LANDING_FALLBACK_PRODUCT_IMAGE];
  const safeIdx = Math.min(imageIdx, images.length - 1);
  const src = images[safeIdx] ?? images[0];

  const next = useCallback(() => {
    onImageIdxChange((i) => (i + 1) % images.length);
  }, [images.length, onImageIdxChange]);

  const prev = useCallback(() => {
    onImageIdxChange((i) => (i - 1 + images.length) % images.length);
  }, [images.length, onImageIdxChange]);

  if (product.videoUrl && isActiveSlide) {
    return (
      <div className="relative aspect-[4/5] w-full bg-black/40 md:aspect-[16/11]">
        <video
          className="absolute inset-0 size-full object-cover"
          src={product.videoUrl}
          controls
          playsInline
          preload="metadata"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
      </div>
    );
  }

  if (product.videoUrl && !isActiveSlide) {
    return (
      <div className="relative aspect-[4/5] w-full bg-black/40 md:aspect-[16/11]">
        <Image
          src={thumbSrc(product)}
          alt=""
          fill
          sizes="(max-width:768px) 100vw, 42rem"
          className="object-cover opacity-80"
          loading="lazy"
        />
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/35">
          <span className="rounded-full border border-white/20 bg-black/50 px-3 py-1 text-xs text-white/90">
            فيديو
          </span>
        </div>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
      </div>
    );
  }

  return (
    <div className="relative aspect-[4/5] w-full bg-black/30 md:aspect-[16/11]">
      <AnimatePresence mode="wait">
        <motion.div
          key={`${product.id}-${src}`}
          initial={{ opacity: 0.35, scale: 1.02 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0.2 }}
          transition={{ duration: 0.35 }}
          className="absolute inset-0"
        >
          <Image
            src={src}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            quality={80}
            className="object-cover"
            priority={isActiveSlide && safeIdx === 0}
            loading={isActiveSlide && safeIdx === 0 ? undefined : "lazy"}
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        </motion.div>
      </AnimatePresence>

      {showImageNav && images.length > 1 ? (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              prev();
            }}
            className="absolute start-3 top-1/2 z-30 flex size-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/55 text-white shadow-lg backdrop-blur-md transition hover:bg-black/70 active:scale-95 rtl:rotate-180 md:size-10"
            aria-label="الصورة السابقة"
          >
            <ChevronLeft className="size-5" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              next();
            }}
            className="absolute end-3 top-1/2 z-30 flex size-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/55 text-white shadow-lg backdrop-blur-md transition hover:bg-black/70 active:scale-95 rtl:rotate-180 md:size-10"
            aria-label="الصورة التالية"
          >
            <ChevronRight className="size-5" />
          </button>
          <div
            className="absolute bottom-3 left-0 right-0 z-30 flex justify-center gap-1.5 px-4"
            onClick={(e) => e.stopPropagation()}
          >
            {images.map((_, i) => (
              <button
                key={`img-dot-${product.id}-${i}`}
                type="button"
                onClick={() => onImageIdxChange(() => i)}
                className={cn(
                  "size-2 rounded-full transition-all",
                  i === safeIdx
                    ? "w-6 bg-primary shadow-[0_0_8px_rgba(0,255,136,0.35)]"
                    : "bg-white/35 hover:bg-white/55",
                )}
                aria-label={`الصورة ${i + 1}`}
              />
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}

type ProductFirstSliderProps = {
  readonly products: LandingProductPayload[];
  readonly activeIndex: number;
  readonly onActiveIndexChange: (index: number) => void;
  readonly countdownHours: number;
  readonly landingPageSlug: string | null;
  readonly sliderMode?: boolean;
  readonly sliderAutoPlay: boolean;
  readonly sliderAutoPlayIntervalSec: number;
  /** Scrolls to order form — shows primary CTA below price */
  readonly onPrimaryCtaClick?: () => void;
};

export function ProductFirstSlider({
  products,
  activeIndex,
  onActiveIndexChange,
  countdownHours,
  landingPageSlug,
  sliderMode = true,
  sliderAutoPlay,
  sliderAutoPlayIntervalSec,
  onPrimaryCtaClick,
}: ProductFirstSliderProps) {
  const safe = Math.min(Math.max(0, activeIndex), Math.max(0, products.length - 1));
  const product = products[safe];
  const [imageIdxByProduct, setImageIdxByProduct] = useState<Record<string, number>>({});
  const trackRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const programmaticScroll = useRef(false);
  const activeIndexRef = useRef(safe);
  const [hoverPause, setHoverPause] = useState(false);
  const [touchPause, setTouchPause] = useState(false);
  const touchResumeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [showStickySwitcher, setShowStickySwitcher] = useState(false);
  const programmaticClearTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scrollSettleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTouchResume = useCallback(() => {
    if (touchResumeTimer.current) {
      clearTimeout(touchResumeTimer.current);
      touchResumeTimer.current = null;
    }
  }, []);

  const multi = sliderMode && products.length > 1;
  const autoPlayActive =
    multi && sliderAutoPlay && !hoverPause && !touchPause;

  activeIndexRef.current = safe;

  useEffect(() => {
    if (!product) return;
    setImageIdxByProduct((m) => (m[product.id] != null ? m : { ...m, [product.id]: 0 }));
  }, [product]);

  const imageIdx = product ? (imageIdxByProduct[product.id] ?? 0) : 0;

  const setImageIdx = useCallback((updater: (i: number) => number) => {
    if (!product) return;
    setImageIdxByProduct((m) => ({
      ...m,
      [product.id]: updater(m[product.id] ?? 0),
    }));
  }, [product]);

  const markProgrammaticScroll = useCallback(() => {
    if (programmaticClearTimer.current) {
      clearTimeout(programmaticClearTimer.current);
    }
    programmaticScroll.current = true;
    programmaticClearTimer.current = setTimeout(() => {
      programmaticScroll.current = false;
      programmaticClearTimer.current = null;
    }, 420);
  }, []);

  useLayoutEffect(() => {
    if (!multi) return;
    const el = trackRef.current;
    if (!el) return;
    const w = el.clientWidth;
    if (w <= 0) return;
    const target = safe * w;
    if (Math.abs(el.scrollLeft - target) < 8) return;
    markProgrammaticScroll();
    el.scrollTo({ left: target, behavior: "auto" });
  }, [multi, safe, products.length, markProgrammaticScroll]);

  useEffect(() => {
    const root = heroRef.current;
    if (!root || !multi) return;
    const io = new IntersectionObserver(
      ([e]) => setShowStickySwitcher(!e.isIntersecting),
      { root: null, threshold: 0, rootMargin: "-64px 0px 0px 0px" },
    );
    io.observe(root);
    return () => io.disconnect();
  }, [multi, products.length]);

  const commitTrackIndex = useCallback(() => {
    if (programmaticScroll.current || !multi) return;
    const el = trackRef.current;
    if (!el) return;
    const w = el.clientWidth;
    if (w <= 0) return;
    const ratio = el.scrollLeft / w;
    const nearest = Math.round(ratio);
    if (Math.abs(ratio - nearest) > 0.12) return;
    const clamped = Math.min(Math.max(0, nearest), products.length - 1);
    if (clamped !== activeIndexRef.current) {
      onActiveIndexChange(clamped);
    }
  }, [multi, onActiveIndexChange, products.length]);

  useEffect(() => {
    if (!multi) return;
    const el = trackRef.current;
    if (!el) return;

    const supportsScrollEnd =
      typeof document !== "undefined" && "onscrollend" in document;

    const scheduleSettle = () => {
      if (programmaticScroll.current) return;
      if (scrollSettleTimer.current) clearTimeout(scrollSettleTimer.current);
      scrollSettleTimer.current = setTimeout(() => {
        scrollSettleTimer.current = null;
        commitTrackIndex();
      }, 180);
    };

    const onScrollEnd = () => {
      if (scrollSettleTimer.current) {
        clearTimeout(scrollSettleTimer.current);
        scrollSettleTimer.current = null;
      }
      commitTrackIndex();
    };

    if (supportsScrollEnd) {
      el.addEventListener("scrollend", onScrollEnd);
    } else {
      el.addEventListener("scroll", scheduleSettle, { passive: true });
    }

    return () => {
      if (supportsScrollEnd) {
        el.removeEventListener("scrollend", onScrollEnd);
      } else {
        el.removeEventListener("scroll", scheduleSettle);
      }
      if (scrollSettleTimer.current) clearTimeout(scrollSettleTimer.current);
      if (programmaticClearTimer.current) clearTimeout(programmaticClearTimer.current);
    };
  }, [multi, products.length, commitTrackIndex]);

  useEffect(() => {
    if (!autoPlayActive || products.length < 2) return;
    const ms = Math.min(10, Math.max(3, sliderAutoPlayIntervalSec)) * 1000;
    const id = window.setInterval(() => {
      const n = products.length;
      const next = (activeIndexRef.current + 1) % n;
      onActiveIndexChange(next);
    }, ms);
    return () => window.clearInterval(id);
  }, [autoPlayActive, onActiveIndexChange, products.length, sliderAutoPlayIntervalSec]);

  useEffect(() => {
    return () => clearTouchResume();
  }, [clearTouchResume]);

  const goProd = useCallback(
    (dir: -1 | 1) => {
      const n = products.length;
      if (n < 2) return;
      onActiveIndexChange((safe + dir + n) % n);
    },
    [products.length, safe, onActiveIndexChange],
  );

  const onTouchStart = () => {
    clearTouchResume();
    setTouchPause(true);
  };

  const onTouchEnd = () => {
    clearTouchResume();
    touchResumeTimer.current = setTimeout(() => setTouchPause(false), 1800);
  };

  if (!product) return null;

  const showCompare =
    product.compareAtPrice != null && product.compareAtPrice > product.price;

  return (
    <section className="relative px-4 pt-2 pb-6 md:px-8 md:pb-8">
      {multi && showStickySwitcher ? (
        <div
          className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-background/90 px-3 py-2 shadow-lg backdrop-blur-xl"
          dir="rtl"
        >
          <p className="mb-1.5 text-center text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            تبديل سريع
          </p>
          <div className="mx-auto flex max-w-lg justify-center gap-2 overflow-x-auto pb-1 [scrollbar-width:none] md:max-w-2xl [&::-webkit-scrollbar]:hidden">
            {products.map((p, i) => (
              <button
                key={p.id}
                type="button"
                onClick={() => onActiveIndexChange(i)}
                className={cn(
                  "flex shrink-0 flex-col items-center gap-1 rounded-xl border px-2 py-1.5 transition",
                  i === safe
                    ? "border-primary/60 bg-primary/10 ring-1 ring-primary/30"
                    : "border-white/10 bg-black/20 hover:border-white/25",
                )}
              >
                <span className="relative size-10 overflow-hidden rounded-lg bg-black/40">
                  <Image
                    src={thumbSrc(p)}
                    alt=""
                    fill
                    sizes="40px"
                    className="object-cover"
                    loading="lazy"
                  />
                </span>
                <span className="max-w-[4.5rem] truncate text-[10px] leading-tight text-muted-foreground">
                  {p.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <div
        ref={heroRef}
        className="glass-panel mx-auto max-w-lg overflow-hidden rounded-3xl ring-1 ring-white/10 md:max-w-2xl"
      >
        <div
          className="relative"
          onPointerEnter={() => multi && setHoverPause(true)}
          onPointerLeave={() => multi && setHoverPause(false)}
          onTouchStart={multi ? onTouchStart : undefined}
          onTouchEnd={multi ? onTouchEnd : undefined}
          onTouchCancel={multi ? onTouchEnd : undefined}
        >
          {multi ? (
            <>
              <div
                ref={trackRef}
                className={cn(
                  "flex snap-x snap-mandatory overflow-x-auto touch-pan-x",
                  "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
                )}
                style={{ WebkitOverflowScrolling: "touch" }}
                dir="ltr"
                aria-roledescription="carousel"
                aria-label="منتجات الصفحة"
              >
                {products.map((p, i) => (
                  <div
                    key={p.id}
                    className="w-full shrink-0 snap-center snap-always"
                    aria-hidden={i !== safe}
                  >
                    <div className="relative">
                      <SlideMedia
                        product={p}
                        imageIdx={imageIdxByProduct[p.id] ?? 0}
                        onImageIdxChange={(updater) => {
                          setImageIdxByProduct((m) => ({
                            ...m,
                            [p.id]: updater(m[p.id] ?? 0),
                          }));
                        }}
                        isActiveSlide={i === safe}
                        showImageNav={i === safe}
                      />
                      {p.onPromo ? (
                        <Badge className="absolute end-4 top-4 z-10 rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground shadow-lg">
                          عرض
                        </Badge>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => goProd(-1)}
                className="absolute start-2 top-1/2 z-20 hidden size-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/45 text-white backdrop-blur-md transition hover:bg-black/60 md:flex rtl:rotate-180"
                aria-label="المنتج السابق"
              >
                <ChevronRight className="size-5" />
              </button>
              <button
                type="button"
                onClick={() => goProd(1)}
                className="absolute end-2 top-1/2 z-20 hidden size-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/45 text-white backdrop-blur-md transition hover:bg-black/60 md:flex rtl:rotate-180"
                aria-label="المنتج التالي"
              >
                <ChevronLeft className="size-5" />
              </button>
            </>
          ) : (
            <div className="relative">
              <SlideMedia
                product={product}
                imageIdx={imageIdx}
                onImageIdxChange={setImageIdx}
                isActiveSlide
                showImageNav
              />
              {product.onPromo ? (
                <Badge className="absolute end-4 top-4 z-10 rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground shadow-lg">
                  عرض
                </Badge>
              ) : null}
            </div>
          )}
        </div>

        {multi ? (
          <div className="border-b border-white/5 px-3 pb-2 pt-3">
            <p className="mb-2 text-center text-xs leading-relaxed text-muted-foreground">
              <span className="inline-block rounded-full bg-white/5 px-2 py-0.5">
                يوجد أكثر من منتج 👇
              </span>
              <span className="mx-1 text-white/25">·</span>
              <span>اسحب لعرض منتجات أخرى</span>
            </p>
            <div className="flex justify-center gap-2 overflow-x-auto py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {products.map((p, i) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => onActiveIndexChange(i)}
                  className={cn(
                    "relative size-14 shrink-0 overflow-hidden rounded-xl border-2 transition md:size-16",
                    i === safe
                      ? "border-primary shadow-[0_0_14px_rgba(0,255,136,0.25)]"
                      : "border-transparent opacity-75 hover:opacity-100",
                  )}
                  aria-label={`عرض ${p.name}`}
                  aria-current={i === safe ? "true" : undefined}
                >
                  <Image
                    src={thumbSrc(p)}
                    alt=""
                    fill
                    sizes="64px"
                    className="object-cover"
                    loading={i === safe ? "eager" : "lazy"}
                  />
                </button>
              ))}
            </div>
            <div className="mt-2 flex justify-center gap-1.5">
              {products.map((p, i) => (
                <button
                  key={`dot-${p.id}`}
                  type="button"
                  onClick={() => onActiveIndexChange(i)}
                  className={cn(
                    "rounded-full transition-all",
                    i === safe
                      ? "h-2 w-7 bg-primary"
                      : "size-2 bg-white/25 hover:bg-white/40",
                  )}
                  aria-label={`الشريحة ${i + 1}`}
                />
              ))}
            </div>
          </div>
        ) : null}

        <div className="space-y-4 p-5 md:p-8">
          <div>
            <h1 className="font-heading text-2xl font-bold leading-tight md:text-3xl">
              {product.name}
            </h1>
            <p className="mt-2 line-clamp-4 text-sm text-muted-foreground md:text-base md:line-clamp-5">
              {product.description}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <p className="font-heading text-3xl font-black text-primary md:text-4xl">
              {formatIqd(product.price)}
            </p>
            {showCompare ? (
              <p className="text-lg text-muted-foreground line-through decoration-white/30">
                {formatIqd(product.compareAtPrice!)}
              </p>
            ) : null}
            {showCompare ? (
              <Badge variant="secondary" className="rounded-full bg-primary/15 text-primary">
                وفر{" "}
                {formatIqd(Math.max(0, product.compareAtPrice! - product.price))}
              </Badge>
            ) : null}
            {product.displayRating != null ? (
              <RatingRow rating={product.displayRating} />
            ) : null}
          </div>
          <p className="inline-flex w-fit items-center rounded-full border border-emerald-400/30 bg-emerald-500/15 px-3 py-1 text-sm font-semibold text-emerald-300 md:text-base">
            🚚 توصيل مجاني لجميع أنحاء العراق
          </p>

          {onPrimaryCtaClick ? (
            <LandingPrimaryCtaButton
              onClick={onPrimaryCtaClick}
              aria-label="الانتقال إلى نموذج الطلب"
            />
          ) : null}

          <LandingInlineCountdown
            countdownHours={countdownHours}
            productId={product.id}
            landingPageSlug={landingPageSlug}
          />
        </div>
      </div>
    </section>
  );
}
