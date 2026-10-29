"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Home, ShoppingCart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { HeaderSearch } from "@/components/layout/header-search";
import { useCart } from "@/contexts/cart-context";
import { siteCopy } from "@/lib/stitch-copy";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/", key: "home" as const },
  { href: "/products", key: "products" as const },
  { href: "/products?promo=1", key: "offers" as const },
];

function StoreHeaderInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { itemCount } = useCart();
  const { nav: n, brand } = siteCopy;

  const qFromUrl = searchParams.get("q") ?? "";

  return (
    <header className="fixed top-0 z-40 flex h-20 w-full items-center justify-between border-b border-white/5 bg-background/80 px-4 backdrop-blur-xl md:px-8">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 md:gap-6">
        <div className="flex min-w-0 shrink-0 items-center gap-8 md:gap-12">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex size-10 items-center justify-center rounded-xl border border-primary/20 bg-primary/10">
              <Home className="size-5 text-primary" aria-hidden />
            </div>
            <div className="text-right leading-none">
              <span className="block text-xl font-bold text-foreground">
                {brand.name}
              </span>
              <span className="mt-0.5 block text-[10px] uppercase tracking-widest text-white/40">
                {brand.tagline}
              </span>
            </div>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            {nav.map((l) => {
              const active =
                l.key === "home"
                  ? pathname === "/"
                  : l.key === "products"
                    ? pathname.startsWith("/products") &&
                      searchParams.get("promo") !== "1"
                    : l.key === "offers"
                      ? pathname.startsWith("/products") &&
                        searchParams.get("promo") === "1"
                      : false;
              const label =
                l.key === "home"
                  ? n.home
                  : l.key === "products"
                    ? n.products
                    : n.offers;
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={cn(
                    "pb-1 text-sm font-medium transition-colors",
                    active
                      ? "border-b-2 border-primary text-primary"
                      : "text-white/60 hover:text-foreground",
                  )}
                >
                  {label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex min-w-0 flex-1 items-center justify-end gap-2 md:flex-none md:shrink-0 md:gap-6">
          <div className="relative min-w-0 max-w-[min(52vw,14rem)] flex-1 sm:max-w-[16rem] sm:flex-none md:max-w-none">
            <HeaderSearch initialQuery={qFromUrl} />
          </div>

          <Link
            href="/cart"
            className="relative p-2 text-white/70 transition-colors hover:text-foreground"
            aria-label={n.cart}
          >
            <span className="transition-transform active:scale-95">
              <ShoppingCart className="size-6" />
            </span>
            {itemCount > 0 && (
              <Badge className="absolute end-0 top-0 min-w-5 justify-center border-0 bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                {itemCount > 99 ? "99+" : itemCount}
              </Badge>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}

function StoreHeaderFallback() {
  return (
    <header
      className="fixed top-0 z-40 flex h-20 w-full items-center border-b border-white/5 bg-background/80 px-4 backdrop-blur-xl md:px-8"
      aria-hidden
    />
  );
}

export function StoreHeader() {
  return (
    <Suspense fallback={<StoreHeaderFallback />}>
      <StoreHeaderInner />
    </Suspense>
  );
}
