/** Public origin of the store, no trailing slash. */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://www.home1raq.com").replace(/\/+$/, "");

export function productPath(slug: string) {
  return `/products/${encodeURIComponent(slug)}`;
}

/** Short ASCII link for sharing (WhatsApp etc.); the long Arabic slug URL breaks some previews. */
export function shortProductUrl(id: string) {
  return `${SITE_URL}/p/${encodeURIComponent(id)}`;
}
