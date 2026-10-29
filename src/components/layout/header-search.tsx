"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useMemo, useRef, useState, useTransition } from "react";
import { LayoutGrid, Loader2, MessageCircle, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { trackMeta } from "@/lib/ads";
import { matchesQuery, rankByQuery } from "@/lib/arabic";
import { formatIqdNumber } from "@/lib/currency";
import { productPath } from "@/lib/site";
import { whatsappLink } from "@/lib/store-info";
import { siteCopy } from "@/lib/stitch-copy";
import { cn } from "@/lib/utils";

type IndexProduct = {
  slug: string;
  name: string;
  price: number;
  compareAtPrice: number | null;
  onPromo: boolean;
  image: string | null;
  category: string | null;
};
type SearchIndex = { products: IndexProduct[]; categories: { name: string; slug: string }[] };

/** Fetched once per page load and shared by every search box. */
let indexPromise: Promise<SearchIndex> | null = null;
function loadIndex() {
  indexPromise ??= fetch("/api/search-index")
    .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
    .catch(() => {
      indexPromise = null;
      return { products: [], categories: [] };
    });
  return indexPromise;
}

type Option =
  | { kind: "product"; href: string; item: IndexProduct }
  | { kind: "category"; href: string; name: string }
  | { kind: "all"; href: string };

export function HeaderSearch({ initialQuery }: { initialQuery: string }) {
  const router = useRouter();
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState(initialQuery);
  const [debounced, setDebounced] = useState(initialQuery);
  const [index, setIndex] = useState<SearchIndex | null>(null);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  // Server-rendered results can take a moment; show a spinner until the navigation lands.
  const [navigating, startNavigation] = useTransition();
  const placeholder = siteCopy.nav.searchPlaceholder;

  useEffect(() => setQuery(initialQuery), [initialQuery]);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(query), 150);
    return () => clearTimeout(t);
  }, [query]);
  useEffect(() => setActive(-1), [debounced]);

  // Close on outside tap.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [open]);

  const ensureIndex = () => {
    if (!index) void loadIndex().then(setIndex);
  };

  const q = debounced.trim();
  const allHref = `/products?q=${encodeURIComponent(q)}`;
  const options = useMemo<Option[]>(() => {
    if (!q || !index) return [];
    const products = rankByQuery(index.products, q, (p) => ({ name: p.name, category: p.category }))
      .slice(0, 6)
      .map((item): Option => ({ kind: "product", href: productPath(item.slug), item }));
    const categories = index.categories
      .filter((c) => matchesQuery(c.name, q))
      .slice(0, 3)
      .map((c): Option => ({
        kind: "category",
        href: `/products?category=${encodeURIComponent(c.slug)}`,
        name: c.name,
      }));
    const found = [...products, ...categories];
    return found.length ? [...found, { kind: "all", href: allHref }] : [];
  }, [q, index, allHref]);

  const showPanel = open && q.length > 0;

  const go = (href: string) => {
    setOpen(false);
    startNavigation(() => router.push(href));
  };

  const submit = () => {
    const term = query.trim();
    setOpen(false);
    if (!term) {
      startNavigation(() => router.push("/products"));
      return;
    }
    trackMeta("Search", { search_string: term });
    startNavigation(() => router.push(`/products?q=${encodeURIComponent(term)}`));
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      setOpen(false);
      return;
    }
    if (!showPanel || options.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => (i + 1) % options.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => (i <= 0 ? options.length - 1 : i - 1));
    } else if (e.key === "Enter" && active >= 0) {
      e.preventDefault();
      go(options[active].href);
    }
  };

  return (
    <div ref={rootRef} className="relative w-full">
      <form
        role="search"
        className="relative w-full"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <Input
          name="q"
          type="search"
          enterKeyHint="search"
          autoComplete="off"
          role="combobox"
          aria-expanded={showPanel}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
          value={query}
          onFocus={() => {
            ensureIndex();
            setOpen(true);
          }}
          onChange={(e) => {
            ensureIndex();
            setQuery(e.target.value);
            setOpen(true);
          }}
          onKeyDown={onKeyDown}
          aria-busy={navigating}
          aria-label={placeholder}
          placeholder={placeholder}
          className="h-9 w-full min-w-0 rounded-xl border-white/10 bg-white/5 py-2 pe-9 ps-3 text-sm sm:h-10 sm:w-52 sm:pe-10 sm:ps-4 md:w-64 [&::-webkit-search-cancel-button]:hidden"
        />
        <button
          type="submit"
          aria-label={placeholder}
          className="absolute end-1 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center text-white/40 hover:text-primary"
        >
          {navigating ? (
            <Loader2 className="size-4 animate-spin text-primary" aria-hidden />
          ) : (
            <Search className="size-4" aria-hidden />
          )}
        </button>
        {navigating && (
          <span className="pointer-events-none absolute inset-x-2 -bottom-px h-0.5 overflow-hidden rounded-full">
            <span className="block h-full w-1/3 animate-[search-progress_1s_ease-in-out_infinite] bg-primary" />
          </span>
        )}
      </form>

      {showPanel && (
        <div
          id={listId}
          role="listbox"
          aria-label="اقتراحات البحث"
          className="fixed inset-x-3 top-[4.75rem] z-50 max-h-[70svh] overflow-y-auto rounded-2xl border border-primary/15 bg-[#0a0c0b] p-2 shadow-[0_20px_60px_rgba(0,0,0,0.7)] md:absolute md:inset-x-auto md:end-0 md:top-12 md:w-[26rem]"
        >
          {!index ? (
            <p className="p-4 text-center text-sm text-muted-foreground">جاري البحث…</p>
          ) : options.length === 0 ? (
            <div className="space-y-3 p-4 text-center">
              <p className="text-sm text-muted-foreground">ما لگينا نتائج لـ «{q}»</p>
              <a
                href={whatsappLink(`مرحباً Home1raq، أدور على: ${q}`)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-[#25D366]/10 px-4 py-2 text-sm font-bold text-[#25D366] ring-1 ring-[#25D366]/40 hover:bg-[#25D366]/20"
              >
                <MessageCircle className="size-4" aria-hidden />
                اسألنا عن منتج
              </a>
            </div>
          ) : (
            <ul className="space-y-1">
              {options.map((o, i) => (
                <li key={`${o.kind}-${o.href}`} id={`${listId}-${i}`} role="option" aria-selected={i === active}>
                  <Link
                    href={o.href}
                    onClick={() => setOpen(false)}
                    onMouseEnter={() => setActive(i)}
                    className={cn(
                      "flex items-center gap-3 rounded-xl p-2 transition-colors",
                      i === active ? "bg-primary/15" : "hover:bg-white/5",
                    )}
                  >
                    {o.kind === "product" ? (
                      <>
                        <span className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-[#0a0c0b]">
                          {o.item.image && (
                            <Image src={o.item.image} alt="" fill sizes="48px" className="object-cover" />
                          )}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-semibold text-foreground">{o.item.name}</span>
                          <span className="mt-0.5 flex items-center gap-2 text-xs">
                            <span className="font-bold tabular-nums text-primary">
                              {formatIqdNumber(o.item.price)} د.ع
                            </span>
                            {o.item.compareAtPrice != null && o.item.compareAtPrice > o.item.price && (
                              <span className="tabular-nums text-muted-foreground line-through">
                                {formatIqdNumber(o.item.compareAtPrice)}
                              </span>
                            )}
                            {o.item.onPromo && (
                              <span className="rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground">
                                عرض
                              </span>
                            )}
                          </span>
                        </span>
                      </>
                    ) : o.kind === "category" ? (
                      <>
                        <span className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <LayoutGrid className="size-5" aria-hidden />
                        </span>
                        <span className="text-sm text-foreground">
                          قسم <span className="font-bold">{o.name}</span>
                        </span>
                      </>
                    ) : (
                      <span className="w-full py-1 text-center text-sm font-bold text-primary">
                        عرض كل النتائج لـ «{q}»
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
