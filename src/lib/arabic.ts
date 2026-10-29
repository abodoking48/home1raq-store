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

/** "ال", "لل", "بال"… so "مسابح" counts as a word start in "للمسابح". */
const ARTICLE_PREFIX = /^(وال|بال|كال|فال|لل|ال)/;

/** Relevance tiers: lower is better. */
export const MATCH_TIER = { namePrefix: 0, name: 1, category: 2, description: 3 } as const;

/**
 * Ranks how `query` matches a product. Every query word must match somewhere; the result is
 * the worst tier among the words (so "مسبح intex" ranks by its weakest word). Word-prefix hits in
 * the name rank first, then anywhere in the name, then the category, then the description.
 * Returns null when some word matches nowhere.
 */
export function matchTier(
  query: string,
  fields: { name: string; category?: string | null; description?: string | null },
): number | null {
  const words = normalizeArabic(query).split(" ").filter(Boolean);
  if (words.length === 0) return null;
  const name = normalizeArabic(fields.name);
  const nameWords = name.split(" ");
  const category = normalizeArabic(fields.category ?? "");
  const description = normalizeArabic(fields.description ?? "");

  let worst = 0;
  for (const w of words) {
    const tier = nameWords.some((nw) => nw.startsWith(w) || nw.replace(ARTICLE_PREFIX, "").startsWith(w))
      ? MATCH_TIER.namePrefix
      : name.includes(w)
        ? MATCH_TIER.name
        : category.includes(w)
          ? MATCH_TIER.category
          : description.includes(w)
            ? MATCH_TIER.description
            : null;
    if (tier == null) return null;
    worst = Math.max(worst, tier);
  }
  return worst;
}

/**
 * Filters and orders items by relevance. Description-only matches are a fallback: they are kept
 * only when nothing matches by name or category. Ties keep the input order.
 */
export function rankByQuery<T>(
  items: T[],
  query: string,
  fields: (item: T) => { name: string; category?: string | null; description?: string | null },
): T[] {
  const scored = items
    .map((item, i) => ({ item, i, tier: matchTier(query, fields(item)) }))
    .filter((s): s is { item: T; i: number; tier: number } => s.tier != null);
  const strong = scored.filter((s) => s.tier < MATCH_TIER.description);
  return (strong.length ? strong : scored)
    .sort((a, b) => a.tier - b.tier || a.i - b.i)
    .map((s) => s.item);
}
