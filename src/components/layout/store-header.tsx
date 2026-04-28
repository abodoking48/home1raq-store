"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { Home, Search, ShoppingCart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
  const router = useRouter();
  const searchParams = useSearchParams();
  const { itemCount } = useCart();
  const { nav: n, brand } = siteCopy;

  const qFromUrl = searchParams.get("q") ?? "";
  const [searchQuery, setSearchQuery] = useState(qFromUrl);
  useEffect(() => {
    setSearchQuery(qFromUrl);
  }, [qFromUrl]);

  function onSearchSubmit(formData: FormData) {
    const q = String(formData.get("q") ?? "").trim();
    const params = new URLSearchParams(searchParams.toString());
    if (q) params.set("q", q);
    else params.delete("q");
    params.delete("page");
    router.push(`/products${params.size ? `?${params.toString()}` : ""}`);
  }

  return (
    <header className="fixed top-0 z-40 flex h-20 w-full items-center justify-between border-b border-white/5 bg-background/80 px-4 backdrop-blur-xl md:px-8">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-6">
        <div className="flex items-center gap-8 md:gap-12">
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

        <div className="flex items-center gap-4 md:gap-6">
          <div className="relative hidden sm:block">
            <form action={onSearchSubmit}>
              <Input
                name="q"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label={n.searchPlaceholder}
                placeholder={n.searchPlaceholder}
                className="w-52 rounded-xl border-white/10 bg-white/5 py-2 pe-10 ps-4 text-sm md:w-64"
              />
              <button type="submit" aria-label={n.searchPlaceholder}>
                <Search
                  className="absolute end-3 top-1/2 size-4 -translate-y-1/2 text-white/40"
                  aria-hidden
                />
              </button>
            </form>
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
