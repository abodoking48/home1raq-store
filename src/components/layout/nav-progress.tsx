"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

/**
 * Thin neon bar at the top on every in-store link tap (styles: `.h1q-navbar` in globals.css), so a
 * tap always gives instant feedback even before the next page's skeleton shows. It creeps to ~85%
 * and completes when the path changes; it gives up after 8 s.
 */
export function NavProgress() {
  const pathname = usePathname();
  const [progress, setProgress] = useState<number | null>(null);
  const timers = useRef<number[]>([]);

  const clear = () => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  };

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.("a");
      if (!a || a.target === "_blank" || a.hasAttribute("download")) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin || url.pathname === location.pathname) return;
      clear();
      setProgress(0.15);
      timers.current.push(
        window.setTimeout(() => setProgress(0.55), 120),
        window.setTimeout(() => setProgress(0.85), 900),
        window.setTimeout(() => setProgress(null), 8000),
      );
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  useEffect(() => {
    clear();
    setProgress((p) => (p == null ? null : 1));
    const t = window.setTimeout(() => setProgress(null), 300);
    return () => window.clearTimeout(t);
  }, [pathname]);

  if (progress == null) return null;
  return (
    <div
      className="h1q-navbar"
      style={{ transform: `scaleX(${progress})`, opacity: progress >= 1 ? 0 : 1 }}
      aria-hidden
    />
  );
}
