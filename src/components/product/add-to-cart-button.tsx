"use client";

import { useEffect } from "react";
import { MessageCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/cart-context";
import { trackAddToCart, trackViewContent } from "@/lib/ads";
import { formatIqdNumber } from "@/lib/currency";
import { SITE_URL, productPath } from "@/lib/site";
import { whatsappLink } from "@/lib/store-info";
import { siteCopy } from "@/lib/stitch-copy";
import { cn } from "@/lib/utils";

type Props = {
  productId: string;
  slug: string;
  name: string;
  price: number;
  image: string | null;
};

function useProductActions({ productId, slug, name, price, image }: Props) {
  const { addItem } = useCart();
  const router = useRouter();
  const p = siteCopy.product;

  const add = () => {
    addItem({ productId, slug, name, price, image, quantity: 1 });
    trackAddToCart({ id: productId, name, price, quantity: 1 });
    toast.success(p.addedToast);
  };
  const buyNow = () => {
    add();
    router.push("/checkout");
  };
  return { add, buyNow };
}

/** Fires Meta/TikTok ViewContent once per product view. */
export function TrackViewContent({ productId, name, price }: Pick<Props, "productId" | "name" | "price">) {
  useEffect(() => {
    trackViewContent({ id: productId, name, price });
  }, [productId, name, price]);
  return null;
}

export function productWhatsappHref(name: string, price: number, slug: string) {
  return whatsappLink(
    `مرحباً Home1raq، أريد أطلب:\n${name}\nالسعر: ${formatIqdNumber(price)} د.ع\n${SITE_URL}${productPath(slug)}`,
  );
}

export function AddToCartButton(props: Props) {
  const { add, buyNow } = useProductActions(props);
  const p = siteCopy.product;

  return (
    <div className="flex w-full flex-col gap-3">
      <div className="flex w-full max-w-md flex-col gap-3 sm:max-w-none sm:flex-row">
        <Button
          type="button"
          className="btn-gradient-neon flex-1 rounded-xl py-6 text-lg font-bold shadow-[0_10px_20px_rgba(0,253,135,0.2)]"
          onClick={add}
        >
          {p.addToCart}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="flex-1 rounded-xl border-white/10 bg-white/5 py-6 text-lg font-bold hover:bg-white/10"
          onClick={buyNow}
        >
          {p.buyNow}
        </Button>
      </div>
      <a
        href={productWhatsappHref(props.name, props.price, props.slug)}
        target="_blank"
        rel="noreferrer"
        className="flex w-full max-w-md items-center justify-center gap-2 rounded-xl border border-[#25D366]/40 bg-[#25D366]/10 py-3.5 text-base font-bold text-[#25D366] transition-colors hover:bg-[#25D366]/20 sm:max-w-none"
      >
        <MessageCircle className="size-5" aria-hidden />
        {p.orderWhatsapp}
      </a>
    </div>
  );
}

/** Mobile-only sticky bar: price + add to cart + buy now, above the iOS home indicator. */
export function ProductBuyBar(props: Props & { compareAtPrice?: number | null }) {
  const { add, buyNow } = useProductActions(props);
  const p = siteCopy.product;
  const showCompare = props.compareAtPrice != null && props.compareAtPrice > props.price;

  return (
    <div
      data-buybar
      className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-[#020403]/90 px-3 pt-3 backdrop-blur-xl md:hidden"
      style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
    >
      <div className="flex items-center gap-2">
        <div className="min-w-0 shrink-0 pe-1 leading-tight">
          {showCompare && (
            <p className="text-[11px] tabular-nums text-muted-foreground line-through">
              {formatIqdNumber(props.compareAtPrice!)}
            </p>
          )}
          <p className="text-lg font-black tabular-nums text-primary">
            {formatIqdNumber(props.price)}
            <span className="ms-1 text-[10px] font-medium text-muted-foreground">د.ع</span>
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          className={cn("h-12 flex-1 rounded-xl border-white/10 bg-white/5 px-2 text-sm font-bold")}
          onClick={add}
        >
          {p.addToCart}
        </Button>
        <Button
          type="button"
          className="btn-gradient-neon h-12 flex-1 rounded-xl px-2 text-sm font-bold"
          onClick={buyNow}
        >
          {p.buyNow}
        </Button>
      </div>
    </div>
  );
}
