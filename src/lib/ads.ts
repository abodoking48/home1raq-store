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

export function trackMeta(event: string, params?: Record<string, unknown>) {
  if (typeof window === "undefined" || !window.fbq) return;
  window.fbq("track", event, params);
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
