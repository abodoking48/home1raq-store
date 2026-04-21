export type LandingProductPayload = {
  id: string;
  landingPageProductId: string | null;
  name: string;
  slug: string;
  description: string;
  price: number;
  compareAtPrice: number | null;
  onPromo: boolean;
  images: string[];
  videoUrl: string | null;
  /** 1–5 for UI; null hides rating row */
  displayRating: number | null;
};

export type LandingPagePayload = {
  meta: {
    slug: string;
    landingPageId: string;
    mode: "SINGLE" | "SLIDER";
  };
  settings: {
    offerBadge: string;
    offerTitle: string;
    offerTitleAccent: string;
    offerSubtitle: string;
    countdownHours: number;
    benefits: LandingBenefit[];
    reviews: LandingReview[];
    whatsappOverride: string | null;
    defaultProductIndex: number;
    sliderAutoPlay: boolean;
    sliderAutoPlayIntervalSec: number;
  };
  products: LandingProductPayload[];
};

export type LandingBenefit = {
  title: string;
  description: string;
  icon: string;
};

export type LandingReview = {
  name: string;
  text: string;
  rating: number;
  city?: string;
};

export function parseBenefits(json: unknown): LandingBenefit[] {
  if (!Array.isArray(json)) return [];
  const out: LandingBenefit[] = [];
  for (const row of json) {
    if (!row || typeof row !== "object") continue;
    const o = row as Record<string, unknown>;
    const title = typeof o.title === "string" ? o.title : "";
    const description = typeof o.description === "string" ? o.description : "";
    const icon = typeof o.icon === "string" ? o.icon : "sparkles";
    if (!title) continue;
    out.push({ title, description, icon });
  }
  return out;
}

export function parseReviews(json: unknown): LandingReview[] {
  if (!Array.isArray(json)) return [];
  const out: LandingReview[] = [];
  for (const row of json) {
    if (!row || typeof row !== "object") continue;
    const o = row as Record<string, unknown>;
    const name = typeof o.name === "string" ? o.name : "";
    const text = typeof o.text === "string" ? o.text : "";
    const rating = typeof o.rating === "number" ? Math.min(5, Math.max(1, o.rating)) : 5;
    if (!name || !text) continue;
    const city = typeof o.city === "string" ? o.city : undefined;
    const item: LandingReview = { name, text, rating };
    if (city) item.city = city;
    out.push(item);
  }
  return out;
}
