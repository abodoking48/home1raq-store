"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

/** Few enough to stay light on mobile data; the first tap is almost always one of these. */
const MAX_PREFETCH = 4;

type NetworkInfo = { saveData?: boolean; effectiveType?: string };

/**
 * Once the page is idle, prefetches the first product links on screen (`/p/<id>`, cached ISR).
 * The first tap after landing then finds the route's code and HTML already loaded, and the
 * server-side page is warm. Skipped with Data Saver or on 2G.
 */
export function ProductPrefetch() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const net = (navigator as Navigator & { connection?: NetworkInfo }).connection;
    if (net?.saveData || /(^|-)2g$/.test(net?.effectiveType ?? "")) return;

    const run = () => {
      const links = [...document.querySelectorAll<HTMLAnchorElement>('a[href^="/p/"]')];
      const onScreen = links.filter((a) => {
        const r = a.getBoundingClientRect();
        return r.bottom > 0 && r.top < window.innerHeight * 1.5 && r.width > 0;
      });
      const hrefs = [...new Set((onScreen.length ? onScreen : links).map((a) => a.getAttribute("href")!))];
      hrefs.slice(0, MAX_PREFETCH).forEach((href) => router.prefetch(href));
    };

    const idle = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 1200));
    const cancel = window.cancelIdleCallback ?? window.clearTimeout;
    const id = idle(run, { timeout: 2500 });
    return () => cancel(id);
  }, [router, pathname]);

  return null;
}
