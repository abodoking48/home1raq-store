import { toAsciiDigits } from "@/lib/phone";

/**
 * Loose Arabic normalization for matching (search, caption keys, category names):
 * drops tashkeel/tatweel, unifies alef/teh marbuta/yeh forms, Arabic-Indic digits → ASCII,
 * collapses spaces and lowercases Latin.
 */
export function normalizeArabic(s: string) {
  return toAsciiDigits(s)
    .replace(/[ً-ٰٟـ]/g, "")
    .replace(/[أإآٱ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

/** True when every word of `query` appears somewhere in `text` (normalized). */
export function matchesQuery(text: string, query: string) {
  const hay = normalizeArabic(text);
  const words = normalizeArabic(query).split(" ").filter(Boolean);
  return words.length > 0 && words.every((w) => hay.includes(w));
}
