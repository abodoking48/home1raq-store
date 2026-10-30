import { formatIqdNumber } from "@/lib/currency";
import { SITE_URL } from "@/lib/site";

/** Link-preview image size WhatsApp, Facebook and Telegram all crop well. */
export const OG_IMAGE = { width: 1200, height: 630, type: "image/jpeg" } as const;

/** ASCII, absolute, versioned — WhatsApp caches previews by URL. */
export function productOgImageUrl(id: string, updatedAt: Date) {
  return `${SITE_URL}/api/og/product/${encodeURIComponent(id)}?v=${updatedAt.getTime().toString(36)}`;
}

const MAX_DESCRIPTION = 150;
/** "المميزات:" / "المواصفات :" / "Features:" — a heading for the list below it, not content. */
const TRAILING_LABEL = /[\s\-–—|•]*[^\s:：.،]{1,20}\s*[:：]\s*$/u;
const BULLET = /^[\s\-–—*•·▪►✓✔✅☑️🔹🔸⭐️✨👈👉]+/u;

/** First real sentence of a product description: skips label-only lines and bullets. */
export function firstSentence(description: string) {
  for (const raw of description.split(/\r?\n/)) {
    let line = raw.replace(BULLET, "").trim();
    // Label-only lines ("المميزات:") introduce a list; skip them.
    if (!line || /^[^:：]{0,25}[:：]$/u.test(line)) continue;
    const end = line.search(/[.!؟?](\s|$)/u);
    if (end >= 0) line = line.slice(0, end + 1);
    line = line.replace(TRAILING_LABEL, "").trim();
    if (/\p{L}/u.test(line)) return line;
  }
  return "";
}

function clamp(text: string, max: number) {
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  const space = cut.lastIndexOf(" ");
  return `${(space > max * 0.6 ? cut.slice(0, space) : cut).replace(/[\s،,.:\-–—]+$/u, "")}…`;
}

/** "اسم المنتج — 20,000 د.ع. أول جملة من الوصف" in at most ~150 characters. */
export function productShareDescription(name: string, price: number, description: string) {
  const head = `${name} — ${formatIqdNumber(price)} د.ع`;
  const sentence = firstSentence(description);
  if (!sentence || sentence === name) return clamp(head, MAX_DESCRIPTION);
  return clamp(`${head}. ${sentence}`, MAX_DESCRIPTION);
}
