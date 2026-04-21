/** Placeholder image when a landing product has no images (Unsplash). */
export const LANDING_FALLBACK_PRODUCT_IMAGE =
  "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=1200&q=80";

/** Default blocks for «Home1raq - Product Landing Page» (Stitch glass / neon). */
export const defaultLandingBenefits = [
  {
    title: "شحن سريع داخل العراق",
    description: "تجهيز الطلب بسرعة وتنسيق التوصيل بأفضل شكل ممكن.",
    icon: "truck",
  },
  {
    title: "دفع عند الاستلام",
    description: "اطمئن — تدفع لحظة استلام المنتج.",
    icon: "shield-check",
  },
  {
    title: "جودة مختارة",
    description: "نختار المنتجات بعناية لتناسب بيتك العصري.",
    icon: "sparkles",
  },
];

export const defaultLandingReviews = [
  {
    name: "سارة — بغداد",
    text: "وصل بسرعة والتغليف ممتاز. أنصح به بشدة.",
    rating: 5,
  },
  {
    name: "علي — البصرة",
    text: "نفس الصور بالضبط، جودة عالية مقابل السعر.",
    rating: 5,
  },
  {
    name: "نور — أربيل",
    text: "تجربة شراء سهلة وتواصل ممتاز عبر الواتساب.",
    rating: 4,
  },
];

export const defaultLandingCopy = {
  heroBadge: "عرض حصري — لفترة محدودة",
  heroTitle: "حوّل صالونك إلى",
  heroTitleAccent: "لوحة فنية",
  heroSubtitle:
    "واجهة عالية التحويل مستوحاة من Stitch — زجاج، نيون أخضر، وتجربة موبايل أولاً تناسب إعلانات تيك توك وميتا.",
  offerBadge: "خصم مؤقت",
  offerTitle: "وفر حتى",
  offerTitleAccent: "30٪",
  offerSubtitle: "العرض مرتبط بعدّاد ٤٨ ساعة لكل زائر — يبدأ من أول زيارة.",
} as const;
