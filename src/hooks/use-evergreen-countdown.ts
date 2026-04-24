"use client";

import { useEffect, useState } from "react";

const STORAGE_PREFIX = "home1raq-landing-countdown-end";

function storageKey(productId: string | null, landingPageSlug: string | null) {
  if (landingPageSlug && productId) {
    return `${STORAGE_PREFIX}:slug:${landingPageSlug}:${productId}`;
  }
  return productId ? `${STORAGE_PREFIX}:${productId}` : `${STORAGE_PREFIX}:global`;
}

/** Fixed per-browser countdown. Stores a stable end time in localStorage by landing slug and product. */
export function useEvergreenCountdown(
  hours: number,
  productId: string | null,
  landingPageSlug: string | null = null,
) {
  const key = storageKey(productId, landingPageSlug);
  const [endMs, setEndMs] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (typeof window === "undefined") return;

    const duration = Math.max(1, hours) * 60 * 60 * 1000;
    let stored: string | null = null;
    try {
      stored = window.localStorage.getItem(key);
    } catch {
      stored = null;
    }
    let end = stored ? parseInt(stored, 10) : NaN;
    if (!Number.isFinite(end)) {
      end = Date.now() + duration;
      try {
        window.localStorage.setItem(key, String(end));
      } catch {
        /* private mode */
      }
    }
    setEndMs(end);
  }, [hours, key]);

  useEffect(() => {
    if (endMs == null) return;
    if (typeof window === "undefined") return;

    const id = setInterval(() => {
      const t = Date.now();
      setNow(t);

      // Stop ticking once countdown is finished.
      if (t >= endMs) {
        clearInterval(id);
      }
    }, 1000);
    return () => clearInterval(id);
  }, [endMs]);

  if (endMs == null) {
    return {
      segments: { days: 0, hours: 0, minutes: 0, seconds: 0 },
      totalMs: 0,
      isExpired: false,
      ready: false,
    };
  }

  const totalMs = Math.max(0, endMs - now);
  const totalSec = Math.floor(totalMs / 1000);
  const days = Math.floor(totalSec / 86400);
  const h = Math.floor((totalSec % 86400) / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;

  return {
    segments: { days, hours: h, minutes: m, seconds: s },
    totalMs,
    isExpired: totalMs <= 0,
    ready: true,
  };
}
