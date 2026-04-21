"use client";

import Image from "next/image";
import { useCallback, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

type Props = {
  images: string[];
  productName: string;
};

export function ProductImageGallery({ images, productName }: Props) {
  const [index, setIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const n = images.length;

  const go = useCallback(
    (delta: -1 | 1) => {
      if (n <= 1) return;
      setIndex((i) => (i + delta + n) % n);
    },
    [n],
  );

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (n <= 1) return;
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      go(-1);
    }
    if (e.key === "ArrowRight") {
      e.preventDefault();
      go(1);
    }
  };

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || n <= 1) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(dx) < 48) return;
    if (dx < 0) go(1);
    else go(-1);
  };

  if (n === 0) {
    return (
      <div className="relative aspect-[4/5] w-full rounded-2xl bg-[#0a0c0b]">
        <div className="flex h-full items-center justify-center text-muted-foreground">
          لا صورة
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div
        className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-[#0a0c0b] outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        onKeyDown={onKeyDown}
        tabIndex={0}
        role="region"
        aria-roledescription="carousel"
        aria-label={`صور ${productName}`}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={images[index]}
            initial={{ opacity: 0.85 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0.85 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0"
          >
            <Image
              src={images[index]}
              alt={`${productName} — ${index + 1}`}
              fill
              priority={index === 0}
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </motion.div>
        </AnimatePresence>

        {n > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              className={cn(
                "absolute left-2 top-1/2 z-10 flex size-10 -translate-y-1/2 items-center justify-center rounded-full",
                "border border-white/15 bg-black/45 text-white shadow-lg backdrop-blur-sm",
                "transition hover:bg-black/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary",
              )}
              aria-label="الصورة السابقة"
            >
              <ChevronLeft className="size-6" aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              className={cn(
                "absolute right-2 top-1/2 z-10 flex size-10 -translate-y-1/2 items-center justify-center rounded-full",
                "border border-white/15 bg-black/45 text-white shadow-lg backdrop-blur-sm",
                "transition hover:bg-black/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary",
              )}
              aria-label="الصورة التالية"
            >
              <ChevronRight className="size-6" aria-hidden />
            </button>
            <div
              className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1.5 rounded-full border border-white/10 bg-black/40 px-2.5 py-1 backdrop-blur-sm"
              role="tablist"
              aria-label="مؤشر الصور"
            >
              {images.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  role="tab"
                  aria-selected={i === index}
                  aria-label={`صورة ${i + 1} من ${n}`}
                  onClick={() => setIndex(i)}
                  className={cn(
                    "size-2 rounded-full transition",
                    i === index ? "bg-primary" : "bg-white/35 hover:bg-white/55",
                  )}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {n > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {images.map((src, i) => (
            <button
              key={src + i}
              type="button"
              onClick={() => setIndex(i)}
              className={cn(
                "relative aspect-square w-[4.5rem] shrink-0 overflow-hidden rounded-xl border-2 transition sm:w-24",
                i === index
                  ? "border-primary ring-1 ring-primary/40"
                  : "border-white/10 hover:border-white/35",
              )}
            >
              <Image
                src={src}
                alt=""
                fill
                sizes="96px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
