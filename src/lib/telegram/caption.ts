/**
 * Parses the product caption the store owner sends to the Telegram bot:
 *
 *   الاسم: ...
 *   السعر: 35000
 *   قبل الخصم: 45000   (optional)
 *   الفئة: المطبخ
 *   الوصف: ...         (optional, may span several lines)
 */

type Field = "name" | "price" | "compareAtPrice" | "category" | "description";

/** Keys are compared after `normalizeArabic`. */
const FIELD_KEYS: Record<Field, string[]> = {
  name: ["الاسم", "اسم", "اسم المنتج", "المنتج", "name"],
  price: ["السعر", "سعر", "السعر بعد الخصم", "بعد الخصم", "price"],
  compareAtPrice: [
    "قبل الخصم",
    "السعر قبل الخصم",
    "السعر القديم",
    "سعر قبل",
    "قبل",
    "old price",
    "compare",
  ],
  category: ["الفئه", "فئه", "القسم", "قسم", "التصنيف", "category"],
  description: ["الوصف", "وصف", "التفاصيل", "description"],
};

const KEY_LOOKUP = new Map<string, Field>();
for (const [field, keys] of Object.entries(FIELD_KEYS) as [Field, string[]][]) {
  for (const k of keys) KEY_LOOKUP.set(normalizeArabic(k), field);
}

/** Loose Arabic normalization for matching keys and category names. */
export function normalizeArabic(s: string) {
  return s
    .replace(/[ً-ْـ]/g, "") // harakat + tatweel
    .replace(/[أإآٱ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

/**
 * "٣٥٬٠٠٠" / "35,000 د.ع" / "35 الف" → 35000. Returns null when no number is found.
 */
export function parsePrice(raw: string): number | null {
  let s = raw
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0))
    .replace(/[,،٬\s]/g, "")
    .replace(/٫/g, ".");
  const thousands = /(الف|ألف|آلاف|الاف|k)/i.test(s);
  s = s.replace(/[^\d.]/g, "");
  if (!s || !/\d/.test(s)) return null;
  const n = Number(s);
  if (!Number.isFinite(n)) return null;
  return thousands ? n * 1000 : n;
}

export type ParsedCaption = {
  name?: string;
  price?: string;
  compareAtPrice?: string;
  category?: string;
  description?: string;
};

export function parseCaption(caption: string): ParsedCaption {
  const out: ParsedCaption = {};
  let current: Field | null = null;

  for (const rawLine of caption.split(/\r?\n/)) {
    const line = rawLine.trim();
    const m = line.match(/^([^:：\-–=]{1,30}?)\s*[:：\-–=]\s*(.*)$/);
    const field = m ? KEY_LOOKUP.get(normalizeArabic(m[1])) : undefined;
    if (m && field) {
      current = field;
      out[field] = m[2].trim();
      continue;
    }
    // Continuation lines belong to the description only.
    if (current === "description") {
      out.description = out.description ? `${out.description}\n${rawLine}` : rawLine;
    }
  }

  if (out.description) out.description = out.description.trim();
  return out;
}

export type CategoryOption = { id: string; name: string; slug: string };

export type ValidDraft = {
  name: string;
  description: string;
  price: number;
  compareAtPrice: number | null;
  category: CategoryOption;
};

export const CAPTION_TEMPLATE = [
  "الاسم: خلاط كهربائي 3 سرعات",
  "السعر: 35000",
  "قبل الخصم: 45000",
  "الفئة: المطبخ",
  "الوصف: خلاط قوي 800 واط، جك زجاج 1.5 لتر.",
].join("\n");

/** Returns the draft, or an Iraqi-dialect error message for the owner. */
export function validateCaption(
  caption: string,
  categories: CategoryOption[],
): { ok: true; draft: ValidDraft } | { ok: false; error: string } {
  const p = parseCaption(caption);
  const categoryList = categories.map((c) => `• ${c.name}`).join("\n");

  if (!p.name) {
    return { ok: false, error: "ناقص اسم المنتج 🙏 اكتب سطر مثل:\nالاسم: خلاط كهربائي" };
  }
  if (!p.price) {
    return { ok: false, error: "ناقص السعر 🙏 اكتب سطر مثل:\nالسعر: 35000" };
  }
  const price = parsePrice(p.price);
  if (price == null || price <= 0) {
    return { ok: false, error: `السعر «${p.price}» مو رقم صحيح. اكتبه هيج: السعر: 35000` };
  }

  let compareAtPrice: number | null = null;
  if (p.compareAtPrice) {
    compareAtPrice = parsePrice(p.compareAtPrice);
    if (compareAtPrice == null || compareAtPrice <= 0) {
      return {
        ok: false,
        error: `سعر «قبل الخصم» «${p.compareAtPrice}» مو رقم صحيح. اكتبه هيج: قبل الخصم: 45000`,
      };
    }
    if (compareAtPrice <= price) {
      return {
        ok: false,
        error: "سعر «قبل الخصم» لازم يكون أكبر من السعر الحالي، وإلا ما يصير عرض.",
      };
    }
  }

  if (!p.category) {
    return { ok: false, error: `ناقص الفئة 🙏 اختار وحدة من هذني:\n${categoryList}` };
  }
  const wanted = normalizeArabic(p.category);
  const category =
    categories.find((c) => normalizeArabic(c.name) === wanted) ??
    categories.find((c) => c.slug.toLowerCase() === wanted) ??
    categories.find((c) => normalizeArabic(c.name).replace(/^ال/, "") === wanted.replace(/^ال/, ""));
  if (!category) {
    return {
      ok: false,
      error: `ما لگيت فئة اسمها «${p.category}». الفئات الموجودة:\n${categoryList}`,
    };
  }

  return {
    ok: true,
    draft: {
      name: p.name,
      // Admin schema requires a description; fall back to the name.
      description: p.description || p.name,
      price,
      compareAtPrice,
      category,
    },
  };
}
