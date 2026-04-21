/** نصوص واجهة متوافقة مع تصميم Google Stitch — مشروع 15992768601551371687 (Homepage + Cart/Checkout). */

export const siteCopy = {
  meta: {
    title: "Home1raq | متجر بيتي الجديد",
    description:
      "اكتشف أفضل الأجهزة المنزلية والكهربائية بأسعار منافسة وجودة عالية. متجر الأجهزة المنزلية الأول في العراق.",
  },
  brand: {
    name: "Home1raq",
    tagline: "متجر بيتي الجديد",
  },
  nav: {
    home: "الرئيسية",
    products: "المنتجات",
    offers: "العروض",
    cart: "السلة",
    searchPlaceholder: "ابحث عن منتج...",
  },
  hero: {
    badge: "متجر الأجهزة المنزلية الأول في العراق",
    titleBefore: "مرحباً بك في",
    titleBrand: "Home1raq",
    subtitle:
      "اكتشف أفضل الأجهزة المنزلية والكهربائية بأسعار منافسة وجودة عالية. نحن هنا لنجعل حياتك أسهل وأكثر ذكاءً.",
    ctaPrimary: "تصفح المنتجات",
    ctaSecondary: "اعرف المزيد",
  },
  categories: {
    title: "تسوق حسب الفئات",
    viewAll: "عرض الكل",
    items: [
      { label: "المطبخ", href: "/products?category=المطبخ", icon: "kitchen" as const },
      { label: "إلكترونيات", href: "/products?category=إلكترونيات", icon: "tv" as const },
      { label: "أثاث", href: "/products?category=أثاث", icon: "sofa" as const },
      { label: "أجهزة رياضية", href: "/products?category=أجهزة-رياضية", icon: "dumbbell" as const },
    ],
  },
  popular: {
    badge: "الأكثر مبيعاً",
    title: "المنتجات الأكثر طلباً",
    subtitle: "اختيارات العملاء المفضلة لهذا الأسبوع",
  },
  latest: {
    badge: "الجديد كلياً",
    title: "أحدث المنتجات",
    subtitle: "وصل حديثاً لمتجرنا - اكتشف أحدث التقنيات",
    viewAll: "مشاهدة جميع الإضافات",
  },
  promo: {
    id: "promo",
    title: "عروض خاصة هذا الشهر!",
    subtitle: "خصومات تصل إلى 30% على منتجات مختارة",
    cta: "اكتشف العروض",
  },
  newsletter: {
    id: "community",
    title: "انضم إلى مجتمع Home1raq",
    subtitle: "احصل على عروض حصرية وكن أول من يعرف عن أحدث إصداراتنا.",
    placeholder: "بريدك الإلكتروني",
    submit: "اشتراك",
    toast: "شكراً — سيتم إشعارك بالعروض قريباً.",
  },
  product: {
    sectionLabel: "تفاصيل المنتج",
    addToCart: "أضف إلى السلة",
    buyNow: "اشترِ الآن",
    addedToast: "تمت الإضافة إلى السلة",
  },
  productsPage: {
    title: "جميع المنتجات",
    subtitle:
      "تصفح كامل تشكيلة الأجهزة المنزلية والذكية — نفس تجربة التصفح الزجاجية من تصميم Stitch.",
    empty: "لا توجد منتجات حالياً. تابع لوحة الإدارة لإضافة منتجات جديدة.",
    promoTitle: "العروض والخصومات",
    promoSubtitle: "منتجات مختارة بأسعار مميزة — يُحدَّد العرض من لوحة الإدارة.",
    promoEmpty:
      "لا توجد منتجات في العروض حالياً. فعّل «ضمن العروض» لمنتجات من الإدارة.",
  },
  cart: {
    title: "سلة التسوق",
    subtitle: "أكمل طلبك للحصول على أفضل تجربة منزلية من Home1raq",
    empty: "سلة التسوق فارغة.",
    contentsTitle: "محتويات السلة",
    summary: "ملخص السلة",
    continue: "متابعة الطلب",
    vatNote: "شامل ضريبة القيمة المضافة",
    delivery: "الوقت المقدر للتوصيل:",
    deliveryRange: "24 - 48 ساعة",
  },
  checkout: {
    title: "إتمام الطلب",
    titleAccent: "الذكي",
    subtitle:
      "قم بتأكيد طلبك بسرعة وسهولة عبر نظام الشراء المباشر العراقي. نحن نوفر لك تجربة تسوق آمنة وسريعة.",
    formTitle: "طلب سريع (العراق)",
    fullName: "الاسم الكامل",
    fullNamePlaceholder: "مثال: محمد علي كمال",
    phone: "رقم الهاتف",
    phonePlaceholder: "07XXXXXXXX",
    city: "المدينة",
    district: "المنطقة",
    districtPlaceholder: "اسم الحي",
    address: "العنوان بالتفصيل",
    addressPlaceholder: "أقرب نقطة دالة، رقم الزقاق...",
    notes: "ملاحظات إضافية (اختياري)",
    submit: "تأكيد الطلب",
    submitting: "جاري الإرسال…",
    asideTitle: "ملخص الطلب",
    successToast: "تم استلام طلبك — سنتواصل معك قريباً.",
  },
  footer: {
    blurb:
      "متجرك الأول في العراق لكل ما يخص المنزل الذكي والرفاهية التكنولوجية. نحن نوفر لك أحدث المنتجات العالمية بضمان حقيقي وتوصيل سريع.",
    quickTitle: "روابط سريعة",
    socialTitle: "تواصل اجتماعي",
    quickLinks: [
      { label: "الرئيسية", href: "/" },
      { label: "المنتجات", href: "/products" },
      { label: "العروض", href: "/products?promo=1" },
      { label: "السلة", href: "/cart" },
    ],
    socialLinks: [
      {
        label: "إنستغرام",
        href: "https://www.instagram.com/home1raq?igsh=OTFrd3F2ZjF6am8w&utm_source=qr",
      },
      {
        label: "فيسبوك",
        href: "https://www.facebook.com/share/1BHVGJBA1r/?mibextid=wwXIfr",
      },
      {
        label: "تيك توك",
        href: "https://www.tiktok.com/@home1raq?_r=1&_t=ZS-95XlN22oSP3",
      },
    ],
    copyright: "Home1raq. جميع الحقوق محفوظة.",
  },
} as const;
