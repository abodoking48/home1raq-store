"use client";

import { useEffect, useState } from "react";

const STORAGE_PREFIX = "home1raq-landing-countdown-end";

function storageKey(productId: string | null, landingPageId: string | null) {
  if (landingPageId && productId) {
    return `${STORAGE_PREFIX}:lp:${landingPageId}:${productId}`;
  }
  return productId ? `${STORAGE_PREFIX}:${productId}` : `${STORAGE_PREFIX}:global`;
}

/** Per-browser evergreen countdown. Pass `landingPageId` so the same catalog product can have independent timers on different ad landings. */
export function useEvergreenCountdown(
  hours: number,
  productId: string | null,
  landingPageId: string | null = null,
) {
  const key = storageKey(productId, landingPageId);
  const [endMs, setEndMs] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const duration = Math.max(1, hours) * 60 * 60 * 1000;
    let stored: string | null = null;
    try {
      stored = localStorage.getItem(key);
    } catch {
      stored = null;
    }
    let end = stored ? parseInt(stored, 10) : NaN;
    if (!Number.isFinite(end) || end <= Date.now()) {
      end = Date.now() + duration;
      try {
        localStorage.setItem(key, String(end));
      } catch {
        /* private mode */
      }
    }
    setEndMs(end);
  }, [hours, key]);

  useEffect(() => {
    if (endMs == null) return;
    const id = setInterval(() => {
      const t = Date.now();
      if (t >= endMs) {
        const duration = Math.max(1, hours) * 60 * 60 * 1000;
        const next = t + duration;
        try {
          localStorage.setItem(key, String(next));
        } catch {
          /* noop */
        }
        setEndMs(next);
      }
      setNow(t);
    }, 1000);
    return () => clearInterval(id);
  }, [endMs, hours, key]);

  if (endMs == null) {
    return {
      segments: { days: 0, hours: 0, minutes: 0, seconds: 0 },
      totalMs: 0,
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
    ready: true,
  };
}
