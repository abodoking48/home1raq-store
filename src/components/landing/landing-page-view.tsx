"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { trackAddToCart, trackViewContent } from "@/lib/ads";
import type { LandingPagePayload } from "@/lib/landing-settings";
import { buttonVariants } from "@/components/ui/button";
import { LandingBenefits } from "./landing-benefits";
import { LandingOrderForm } from "./landing-order-form";
import { LandingReviews } from "./landing-reviews";
import { LandingStickyCta } from "./landing-sticky-cta";
import { LandingWhatsappFloat } from "./landing-whatsapp-float";
import { ProductFirstSlider } from "./product-first-slider";
import { cn } from "@/lib/utils";

type ReadonlyLandingPageViewProps = {
  readonly initial: LandingPagePayload;
};

function whatsappDigits(override: string | null) {
  const raw = override?.trim() || process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "9647XXXXXXXXX";
  return raw.replace(/\D/g, "") || "9647XXXXXXXXX";
}

export function LandingPageView({ initial }: ReadonlyLandingPageViewProps) {
  const { settings, products, meta } = initial;
  const initialSlide = Math.min(
    Math.max(0, settings.defaultProductIndex),
    Math.max(0, products.length - 1),
  );
  const [activeIndex, setActiveIndex] = useState(initialSlide);
  const [quantity, setQuantity] = useState(1);
  const product = products[Math.min(activeIndex, Math.max(0, products.length - 1))];
  const addToCartTracked = useRef(false);

  useEffect(() => {
    if (!product) return;
    trackViewContent(product);
  }, [product]);

  const trackAddOnce = useCallback(
    (qty: number) => {
      if (!product || addToCartTracked.current) return;
      addToCartTracked.current = true;
      trackAddToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: qty,
      });
    },
    [product],
  );

  const scrollToOrder = useCallback(() => {
    trackAddOnce(quantity);
    document.getElementById("order-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [quantity, trackAddOnce]);

  const onQuantityChange = useCallback(
    (q: number) => {
      setQuantity(q);
      if (q > 1) trackAddOnce(q);
    },
    [trackAddOnce],
  );

  useEffect(() => {
    setQuantity(1);
    addToCartTracked.current = false;
  }, [product?.id]);

  if (!product) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
        <p className="max-w-md text-lg text-muted-foreground">
          لا توجد منتجات نشطة لهذه الصفحة. أنشئ صفحة هبوط وأضف منتجات من لوحة الإدارة.
        </p>
        <Link href="/admin/landing" className={cn(buttonVariants(), "mt-6 rounded-2xl")}>
          إدارة صفحات الهبوط
        </Link>
        <Link href="/" className={cn(buttonVariants({ variant: "link" }), "mt-2")}>
          العودة للمتجر
        </Link>
      </div>
    );
  }

  const landingPageSlug = meta.slug;
  const wa = whatsappDigits(settings.whatsappOverride);

  return (
    <div className="relative pb-[11rem] md:pb-36">
      <ProductFirstSlider
        products={products}
        activeIndex={activeIndex}
        onActiveIndexChange={setActiveIndex}
        countdownHours={settings.countdownHours}
        landingPageSlug={landingPageSlug}
        sliderMode={meta.mode === "SLIDER"}
        sliderAutoPlay={settings.sliderAutoPlay}
        sliderAutoPlayIntervalSec={settings.sliderAutoPlayIntervalSec}
        onPrimaryCtaClick={scrollToOrder}
      />
      <LandingBenefits benefits={settings.benefits} />
      <LandingReviews reviews={settings.reviews} />
      <LandingOrderForm
        product={product}
        quantity={quantity}
        landingPageProductId={product.landingPageProductId}
      />
      <LandingStickyCta
        product={product}
        quantity={quantity}
        onQuantityChange={onQuantityChange}
        onOrderClick={scrollToOrder}
      />
      <LandingWhatsappFloat productName={product.name} phoneDigits={wa} />
    </div>
  );
}
