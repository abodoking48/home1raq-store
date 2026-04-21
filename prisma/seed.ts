import { LandingPageMode, PrismaClient } from "@prisma/client";
import { slugify } from "../src/lib/slug";
import {
  defaultLandingBenefits,
  defaultLandingReviews,
} from "../src/lib/landing-defaults";

const prisma = new PrismaClient();

async function main() {
  const categorySeed = [
    { name: "المطبخ", description: "أجهزة وأدوات المطبخ الذكية", sortOrder: 1, icon: "kitchen" },
    { name: "إلكترونيات", description: "تقنيات منزلية وإلكترونيات حديثة", sortOrder: 2, icon: "tv" },
    { name: "أثاث", description: "أثاث عصري ومريح للمنزل", sortOrder: 3, icon: "sofa" },
    { name: "أجهزة رياضية", description: "معدات رياضية منزلية", sortOrder: 4, icon: "dumbbell" },
  ];

  const categoryBySlug = new Map<string, string>();
  for (const c of categorySeed) {
    const slug = slugify(c.name);
    const saved = await prisma.category.upsert({
      where: { slug },
      update: {
        description: c.description,
        active: true,
        sortOrder: c.sortOrder,
        icon: c.icon,
      },
      create: {
        name: c.name,
        slug,
        description: c.description,
        active: true,
        sortOrder: c.sortOrder,
        icon: c.icon,
      },
    });
    categoryBySlug.set(slug, saved.id);
  }

  const samples = [
    {
      name: "طاولة قهوة زجاجية",
      description:
        "سطح زجاجي مقوّى مع قاعدة معدنية خفيفة. مناسبة للصالونات العصرية.",
      price: 185_000,
      compareAtPrice: 220_000,
      onPromo: true,
      images: [
        "https://images.unsplash.com/photo-1532372320572-cda25653a26d?w=1200&q=80",
      ],
      categorySlug: "أثاث",
    },
    {
      name: "إضاءة أرضية نحاسية",
      description: "إضاءة دافئة بزاوية قابلة للتعديل. مثالية لزوايا القراءة.",
      price: 129_000,
      compareAtPrice: null,
      onPromo: false,
      images: [
        "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=1200&q=80",
      ],
      categorySlug: "المطبخ",
    },
    {
      name: "سجادة قطنية ناعمة",
      description: "نسيج عالي الكثافة، سهل التنظيف، بألوان محايدة.",
      price: 89_000,
      compareAtPrice: null,
      onPromo: true,
      images: [
        "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1200&q=80",
      ],
      categorySlug: "أثاث",
    },
  ];

  for (const s of samples) {
    const slug = slugify(s.name);
    const categoryId = categoryBySlug.get(slugify(s.categorySlug));
    await prisma.product.upsert({
      where: { slug },
      update: {
        description: s.description,
        price: s.price,
        compareAtPrice: s.compareAtPrice,
        onPromo: s.onPromo,
        images: s.images,
        categoryId,
      },
      create: {
        name: s.name,
        slug,
        description: s.description,
        price: s.price,
        compareAtPrice: s.compareAtPrice,
        onPromo: s.onPromo,
        images: s.images,
        active: true,
        categoryId,
      },
    });
  }

  const firstProduct = await prisma.product.findFirst({
    where: { active: true },
    orderBy: { createdAt: "asc" },
  });

  const homeLp = await prisma.landingPage.upsert({
    where: { slug: "home" },
    update: {
      enabled: true,
      title: "الصفحة الافتراضية — /landing",
    },
    create: {
      slug: "home",
      title: "الصفحة الافتراضية — /landing",
      enabled: true,
      mode: LandingPageMode.SLIDER,
      countdownHours: 48,
      benefitsJson: defaultLandingBenefits,
      reviewsJson: defaultLandingReviews,
      offerBadge: "عرض حصري",
      offerTitle: "تسوق بثقة",
      offerTitleAccent: "Home1raq",
      offerSubtitle: "عدّاد ٤٨ ساعة لكل زائر — يبدأ من أول زيارة.",
    },
  });

  const homeLines = await prisma.landingPageProduct.count({
    where: { landingPageId: homeLp.id },
  });
  if (homeLines === 0 && firstProduct) {
    await prisma.landingPageProduct.create({
      data: {
        landingPageId: homeLp.id,
        productId: firstProduct.id,
        displayOrder: 0,
      },
    });
  }

  const demoLp = await prisma.landingPage.upsert({
    where: { slug: "demo" },
    update: {
      enabled: true,
      title: "Demo — متعدد المنتجات",
      mode: LandingPageMode.SLIDER,
    },
    create: {
      slug: "demo",
      title: "Demo — متعدد المنتجات",
      enabled: true,
      mode: LandingPageMode.SLIDER,
      countdownHours: 48,
      benefitsJson: defaultLandingBenefits,
      reviewsJson: defaultLandingReviews,
      offerBadge: "عرض محدود",
      offerTitle: "تصفّح المنتجات",
      offerTitleAccent: "بنفس الصفحة",
      offerSubtitle: "اسحب أو استخدم النقاط للتنقل — عدّاد خاص لكل منتج.",
    },
  });

  const twoProducts = await prisma.product.findMany({
    where: { active: true },
    orderBy: { createdAt: "asc" },
    take: 2,
  });
  const existingDemoLines = await prisma.landingPageProduct.count({
    where: { landingPageId: demoLp.id },
  });
  if (existingDemoLines === 0 && twoProducts.length > 0) {
    let order = 0;
    for (const p of twoProducts) {
      await prisma.landingPageProduct.create({
        data: {
          landingPageId: demoLp.id,
          productId: p.id,
          displayOrder: order++,
        },
      });
    }
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
