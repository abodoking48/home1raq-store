"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/cart-context";
import { siteCopy } from "@/lib/stitch-copy";

type Props = {
  productId: string;
  slug: string;
  name: string;
  price: number;
  image: string | null;
};

export function AddToCartButton({ productId, slug, name, price, image }: Props) {
  const { addItem } = useCart();
  const router = useRouter();

  const p = siteCopy.product;

  return (
    <div className="flex w-full max-w-md flex-col gap-3 sm:max-w-none sm:flex-row">
      <Button
        type="button"
        className="btn-gradient-neon flex-1 rounded-xl py-6 text-lg font-bold shadow-[0_10px_20px_rgba(0,253,135,0.2)]"
        onClick={() => {
          addItem({
            productId,
            slug,
            name,
            price,
            image,
            quantity: 1,
          });
          toast.success(p.addedToast);
        }}
      >
        {p.addToCart}
      </Button>
      <Button
        type="button"
        variant="outline"
        className="flex-1 rounded-xl border-white/10 bg-white/5 py-6 text-lg font-bold hover:bg-white/10"
        onClick={() => {
          addItem({
            productId,
            slug,
            name,
            price,
            image,
            quantity: 1,
          });
          toast.success(p.addedToast);
          router.push("/checkout");
        }}
      >
        {p.buyNow}
      </Button>
    </div>
  );
}
