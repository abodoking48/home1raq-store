/** Public origin of the store, no trailing slash. */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://www.home1raq.com").replace(/\/+$/, "");

export function productPath(slug: string) {
  return `/products/${encodeURIComponent(slug)}`;
}

/**
 * Where the store links to a product (cards, search, cart, related): the ASCII `/p/<id>` route is
 * cached (ISR) and prefetched by <Link>, so a tap opens instantly. Full-page caching of the Arabic
 * slug route returned 500 on Vercel; the slug URL stays canonical for search engines.
 */
export function productLinkPath(id: string) {
  return `/p/${encodeURIComponent(id)}`;
}

/** Short ASCII link for sharing (WhatsApp etc.); the long Arabic slug URL breaks some previews. */
export function shortProductUrl(id: string) {
  return `${SITE_URL}/p/${encodeURIComponent(id)}`;
}
