/**
 * Meta + TikTok browser pixels. Safe no-ops when scripts or env IDs are missing.
 * Env: NEXT_PUBLIC_META_PIXEL_ID, NEXT_PUBLIC_TIKTOK_PIXEL_ID
 */

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    _fbq?: unknown;
    ttq?: {
      track: (event: string, params?: Record<string, unknown>) => void;
      page: () => void;
    };
  }
}

function iqParams(value: number, contentId: string, contentName: string) {
  return {
    value,
    currency: "IQD",
    content_ids: [contentId],
    content_type: "product",
    content_name: contentName,
  };
}

/**
 * The Meta Pixel loads with `lazyOnload`, so early events (e.g. ViewContent on mount) would be
 * dropped; retry for a while until `fbq` exists.
 */
export function trackMeta(
  event: string,
  params?: Record<string, unknown>,
  options?: { eventID?: string },
) {
  if (typeof window === "undefined") return;
  let tries = 0;
  const send = () => {
    if (window.fbq) {
      if (options) window.fbq("track", event, params, options);
      else window.fbq("track", event, params);
    } else if (tries++ < 40) {
      setTimeout(send, 500);
    }
  };
  send();
}

export function trackTikTok(event: string, params?: Record<string, unknown>) {
  if (typeof window === "undefined" || !window.ttq) return;
  window.ttq.track(event, params);
}

/** Use when pixels load client-side only; layout scripts may already fire PageView. */
export function trackPageView() {
  trackMeta("PageView");
  if (typeof window !== "undefined" && window.ttq) window.ttq.page();
}

export function trackViewContent(product: {
  id: string;
  name: string;
  price: number;
}) {
  const p = iqParams(product.price, product.id, product.name);
  trackMeta("ViewContent", p);
  trackTikTok("ViewContent", {
    content_id: product.id,
    content_type: "product",
    content_name: product.name,
    value: product.price,
    currency: "IQD",
  });
}

export function trackAddToCart(product: {
  id: string;
  name: string;
  price: number;
  quantity: number;
}) {
  const p = {
    ...iqParams(product.price * product.quantity, product.id, product.name),
    contents: [{ id: product.id, quantity: product.quantity }],
  };
  trackMeta("AddToCart", p);
  trackTikTok("AddToCart", {
    content_id: product.id,
    content_type: "product",
    content_name: product.name,
    value: product.price * product.quantity,
    currency: "IQD",
    quantity: String(product.quantity),
  });
}

export function trackInitiateCheckout(product: {
  id: string;
  name: string;
  price: number;
  quantity: number;
}) {
  const p = {
    ...iqParams(product.price * product.quantity, product.id, product.name),
    contents: [{ id: product.id, quantity: product.quantity }],
    num_items: product.quantity,
  };
  trackMeta("InitiateCheckout", p);
  trackTikTok("InitiateCheckout", {
    content_id: product.id,
    content_type: "product",
    content_name: product.name,
    value: product.price * product.quantity,
    currency: "IQD",
    quantity: String(product.quantity),
  });
}

export function trackPurchase(order: {
  id: string;
  value: number;
  productId: string;
  productName: string;
  quantity: number;
}) {
  trackMeta("Purchase", {
    value: order.value,
    currency: "IQD",
    content_ids: [order.productId],
    content_type: "product",
    content_name: order.productName,
    contents: [{ id: order.productId, quantity: order.quantity }],
    num_items: order.quantity,
  });
  /** TikTok standard name for completed purchase (Meta uses `Purchase`). */
  trackTikTok("CompletePayment", {
    content_id: order.productId,
    content_type: "product",
    content_name: order.productName,
    value: order.value,
    currency: "IQD",
    quantity: String(order.quantity),
  });
}

export type CartEventLine = { productId: string; name: string; price: number; quantity: number };

function cartParams(lines: CartEventLine[]) {
  return {
    value: lines.reduce((sum, l) => sum + l.price * l.quantity, 0),
    currency: "IQD",
    content_ids: lines.map((l) => l.productId),
    content_type: "product",
    contents: lines.map((l) => ({ id: l.productId, quantity: l.quantity, item_price: l.price })),
    num_items: lines.reduce((sum, l) => sum + l.quantity, 0),
  };
}

/** Storefront checkout (whole cart). */
export function trackCartInitiateCheckout(lines: CartEventLine[]) {
  const p = cartParams(lines);
  trackMeta("InitiateCheckout", p);
  trackTikTok("InitiateCheckout", { value: p.value, currency: "IQD", contents: p.contents });
}

/**
 * Storefront order placed. Fires once per order: `eventID` lets Meta dedupe, and a
 * localStorage mark stops repeats in this browser.
 */
export function trackCartPurchase(orderId: string, lines: CartEventLine[]) {
  const key = `h1q-purchase-${orderId}`;
  try {
    if (localStorage.getItem(key)) return;
    localStorage.setItem(key, "1");
  } catch {
    /* storage blocked: still fire; eventID dedupes on Meta's side */
  }
  const p = cartParams(lines);
  trackMeta("Purchase", p, { eventID: `order-${orderId}` });
  trackTikTok("CompletePayment", { value: p.value, currency: "IQD", contents: p.contents });
}
