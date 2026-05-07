# Home1raq Store — Technical Project Report

**Document purpose:** Living technical reference for the `home1raq-store` codebase — use it to recall **architecture**, **decisions**, **what shipped**, and **how to operate** the project.

**Last updated:** 2026-04-29 (performance pass: landing cache/ISR, Next.js 16 patterns, middleware scope, image config, mobile header search, homepage scroll UX cues; agent documentation in this report).

> **Status:** The project is **still under development**; core storefront + admin + orders + **campaign landing pages** (per-slug, optional multi-product slider) are usable; newsletter, payments, and hardening remain partial.

> **Agent checkpoint:** Use **Section 12 (Changelog)** and the **“آخر تحديثات — 2026-04-29”** block as the canonical “where we left off”. After meaningful work, append **one changelog row**, bump **Last updated**, and align any **Architecture** bullets with `schema.prisma` + the files cited here. **Cursor / coding agents:** this file is the handoff surface — read the dated Arabic blocks + Changelog before changing store, landing, or infra paths.

---

## آخر تحديثات — 2026-04-29

**سياق:** جُرِّب جزء كبير من التحسينات والإصلاحات أثناء جلسات تطوير بمساعدة **وكيل Cursor (Agent)**؛ هذا القسم يخلّص ما يهمّ أي مطوّر أو Agent لاحقاً.

**سلوك وكود (أداء + Next.js 16 + استقرار التطوير):**

- **صفحات الهبوط `/landing/[slug]`:** `export const revalidate = 60` في `src/app/(landing)/landing/[slug]/page.tsx`؛ **`getLandingPagePayload`** ملفّاً بـ **`unstable_cache`** في `src/lib/landing-pages.ts` (مفتاح `["landing-page-payload"]`، `{ revalidate: 60, tags: ["landing-pages"] }`) لتقليل ضغط Prisma وتكرار الاستعلام؛ **`Suspense`** مع **`LandingPageSkeleton`** كـ fallback أثناء التحميل.
- **الصور:** في `next.config.ts` — `images.qualities: [75, 80]` حتى لا يظهر تحذير Next عند **`quality={80}`** على `<Image>`؛ مع `minimumCacheTTL` و`formats` (AVIF/WebP) و`remotePatterns` لـ Supabase/Unsplash كما هو موثّق.
- **Middleware:** `config.matcher` مقصور على **`/admin/:path*`** (`src/middleware.ts`) حتى لا يُنفَّذ منطق Supabase cookies على كل طلب عام — يقلّل التكلفة على الصفحة الرئيسية والمتجر.
- **Next.js 16 / Server Components:** تجنّب **`next/dynamic` مع `{ ssr: false }`** داخل مكوّنات سيرفر؛ إن لزم تحميل عميل فقط، استورد المكوّن العميلي مباشرة أو افصل الحدود. تجنّب تسمية **`dynamic`** كاسم يتصادم مع **`export const dynamic`** (استخدم alias مثل `dynamicImport` أو استيراداً ثابتاً حيث يناسب).
- **الواجهة — الهيدر:** البحث يظهر على **الجوال** أيضاً مع عرض محدود (`src/components/layout/store-header.tsx`؛ commit **`682cd4d`** على `main`).
- **تحسينات أداء عامة (جلسة الوكيل):** ضبط **`next/font`** (`display: "swap"`)، تخفيف حمل السكربتات الثالثة حيث يناسب، تحسين **`next/image`** على الهوم/البطاقات/الهبوط (`priority` / `sizes` / `quality` حيث منطقي)، وترتيب محتوى الهيرو في الهبوط بعد مراجعة LCP (الصورة أمام التفاصيل حيث يقرّر الفريق).
- **الصفحة الرئيسية — UX للتمرير:** الهيرو مضبوط على **`85vh`** لإظهار لمحة من القسم التالي، مع مؤشر نزول متحرك **«اكتشف المزيد ↓»** بلون الثيم الأخضر يختفي تلقائياً بعد التمرير، والضغط عليه يعمل **smooth scroll** إلى قسم التصنيفات، مع **fade-up** خفيف عند دخول التصنيفات إلى إطار العرض.
- **تطوير محلي:** إن ظهرت **404** غير متوقعة على `/landing/...` أو تعارض Turbopack — غالباً **cache `.next`** أو **أكثر من عملية `next dev`** على نفس المنفذ؛ أوقف العمليات الزائدة، **`npm run clean`**, ثم **`next dev`** واحد. بعد تغييرات Prisma على Windows و**EPERM**: أوقف **`next dev`** ثم **`npm run db:rebuild-client`** (كما في 2026-04-24).

**ممارسات نحتفظ بها (للـ Agent والبشر):**

- أي **`quality`** على `<Image>` غير الافتراضي يجب أن يكون مدرجاً في **`images.qualities`** في `next.config.ts`.
- توسيع نطاق **middleware** فقط عند الحاجة الأمنية؛ المطابقة الواسعة تكلف كل طلباً.
- بيانات الهبوط الثقيلة: **`unstable_cache` + `revalidate`/`tags`** على الدوال المشتركة بين الصفحة والـ metadata/API حيث ينطبق.
- بعد جلسة Agent: راجع **`git diff`**, **`npm run lint`**, ومسار **`/landing/[slug]`** و**`/admin`** يدوياً أو عبر المتصفح قبل الدمج.

---

## آخر تحديثات — 2026-04-24

**سلوك وواجهات:**

- **عدّاد الهبوط (`useEvergreenCountdown`):** مدة ثابتة من أول زيارة، **بدون تجديد تلقائي** بعد الصفر؛ مفتاح `localStorage` مرتبط بـ **`landingPageSlug` + `productId`** (`…:slug:{slug}:{productId}`)؛ عند الانتهاء تبقى الأرقام على `00:00:00` ورسالة مثل «انتهى العرض» في مكوّنات العدّاد — انظر `src/hooks/use-evergreen-countdown.ts` و`landing-inline-countdown.tsx` / `landing-offer-countdown.tsx` وربط `meta.slug` من `LandingPageView` → `ProductFirstSlider`.
- **الصفحة الرئيسية — المنتجات:** شبكة **عمودين على الجوال** (`grid-cols-[repeat(2,minmax(0,1fr))]` ثم `md`/`lg` كما في التصميم السابق)؛ **`ProductCard`** يدعم **`imageAspectRatio="3/4"`** للوحدة البصرية وصورة فارغة بلون الخلفية فقط على الهوم؛ قسم «أحدث المنتجات» **يُخفى فقط** إذا كانت **نفس مجموعة الـ IDs** لعيّنة «الأكثر طلباً» (وليس بسبب `latest.length <= 4` — ذلك كان يخفي الأكثر خطأً وتم إصلاحه)؛ صف التصنيفات على الجوال **تمرير أفقي** مع **تلميح تدرج** (`::after`) على طرف السطر.
- **مسارات المنتج `/products/[slug]`:** توسيع **`buildSlugCandidates`** (`src/lib/product-slug.ts`) لمرشحات شرطة/مسافة/ترميز؛ روابط البطاقة والسلة تستخدم **`encodeURIComponent(slug)`**.
- **حذف منتج من الإدارة:** `DELETE /api/admin/products/[id]` داخل **معاملة**: حذف `OrderItem` المرتبطة، إعادة حساب **`Order.total`** أو حذف الطلب إن لم يبقَ سطور، ثم حذف المنتج — انظر `src/app/api/admin/products/[id]/route.ts`.
- **حذف صفحة هبوط:** واجهة **`/admin/landing`** — زر **حذف** يستدعي **`DELETE /api/admin/landing-pages/[id]`** (كان الـ API موجوداً مسبقاً؛ أضيف **`LandingPageDeleteButton`**).

**ممارسات للاحتفاظ بها:**

- لا تعُد ربط ظهور قسم «الأكثر طلباً» بعدد منتجات «الأحدث»؛ اعتمد **`popularProducts.length === 0`** فقط للفرع الأحادي.
- عند تعديلات **Prisma** على Windows: إن فشل **`prisma generate`** بـ **EPERM**، أوقف **`next dev`** ثم **`npm run db:rebuild-client`**.

---

## آخر تحديثات — 2026-04-21

**أخطاء وإصلاحات (أسماء الملفات):**

- **`eslint.config.mjs`:** استثناء مجلدات البناء **`.next` / `.next-dev`** و`node_modules` وغيرها حتى لا يمرّ ESLint على ملفات Webpack المُولَّدة (كانت تُسبب آلاف التحذيرات الزائفة).
- **`src/lib/landing-settings.ts`:** إزالة استيرادات **غير مستخدمة** كانت تُسبب خطأ `@typescript-eslint/no-unused-vars`.
- **`src/components/admin/landing-page-editor.tsx`:** معالجة تحذير **`react-hooks/exhaustive-deps`** مع تعليق يوضح أن **`productsSyncKey`** يمثّل بصمة قائمة المنتجات وتجنّب الحلقات عند إضافة `initial.products` كمرجع وحده.
- *(سابقاً في المشروع)* **`src/app/(store)/page.tsx`** + **`src/lib/db-unreachable.ts`** + **`src/app/api/orders/route.ts`:** تعامل آمن مع انقطاع قاعدة البيانات بدل رمي **500** على الصفحة الرئيسية ومسار الطلبات.

**كود مكرر / ميت تمت إزالته:**

- **`src/components/landing/landing-showcase.tsx`:** حذف — لم يُستورد من أي مسار؛ الواجهة الفعلية للهبوط هي **`LandingPageView`** + **`ProductFirstSlider`**.

**تحسينات أداء / صيانة:**

- **`src/lib/landing-defaults.ts`:** ثابت **`LANDING_FALLBACK_PRODUCT_IMAGE`** لصورة المنتج الافتراضية عند غياب الصور.
- **`src/components/landing/product-first-slider.tsx`:** استخدام الثابت أعلاه بدل تكرار رابط Unsplash في الملف.

**ممارسات وأدوات:**

- **`npm run lint` على `src`:** يمرّ نظيفاً مع **`eslint.config.mjs`** المحدّث.
- **`npx tsc --noEmit`:** يمرّ بدون أخطاء بعد التعديلات.

**ما لم يُغيَّر (حسب القيود):** لا تغيير على النصوص الظاهرة للمستخدم، لا تغيير على مسارات API أو شكل البيانات، الإبقاء على **RTL** والثيم الداكن.

---

## حالة المشروع

| الفحص | النتيجة (آخر مراجعة 2026-04-29) |
|--------|------------------------|
| TypeScript (`tsc --noEmit`) | **ناجح** |
| ESLint (`eslint src`) | **ناجح** (مع استثناء مجلدات البناء) |
| بنية App Router + صفحات الهبوط | **كما هي** — `/landing/[slug]` + **`ProductFirstSlider`** مع **`next/image`** وأولوية/تَكْسِل منطقية للصور |

**ملاحظة:** صفحة الهبوط تستخدم مسبقاً **`next/image`** مع **`fill`** داخل حاويات **`aspect-*`** لتقليل **CLS**؛ الخطوط عبر **`next/font`** في **`layout.tsx`** وليس `@import` للخطوط في **`globals.css`**.

---

## 1. Project Overview

### Short description

**home1raq-store** is an Arabic (**RTL**) e-commerce storefront built with **Next.js 16** (App Router), backed by **PostgreSQL** via **Prisma**, with **Supabase** for **admin authentication** and **object storage (product images)**. The public shop is **guest-only** (no customer login); the cart lives in **localStorage**.

### Purpose

Sell home-related products online with:

- A marketing-style storefront (hero, categories, product listings, **promo filter**, cart, checkout).
- **High-conversion campaign landings** at **`/landing/[slug]`** (RTL, glass UI: product showcase, benefits, reviews, **fixed** per-slug+product countdown in `localStorage` (no auto-renew), guest order, WhatsApp, ads events) — content driven by **`LandingPage`** + **`LandingPageProduct`** rows; admin **`/admin/landing`** (list, create, edit, **delete**).
- An **admin** area for products, categories, orders, landing copy, and image uploads.

### Current status (high level)

| Area | State |
|------|--------|
| Storefront browse / detail / cart / checkout | **Working** |
| **Campaign landing** `/landing/[slug]` (multi-product slider, countdown, order, pixels) | **Working** |
| Admin products & categories & orders + Excel export | **Working** |
| **Admin landing manager** `/admin/landing` (pages list/create/edit/**delete**, lines, slider settings, JSON benefits/reviews) | **Working** |
| **Promos** (`onPromo`, optional compare-at price) | **Working** (admin + `/products?promo=1`) |
| **Meta Pixel** (global PageView) | **Working** (root `layout.tsx` + `next/script`) |
| **TikTok Pixel** (optional, landing layout) | **Working** when `NEXT_PUBLIC_TIKTOK_PIXEL_ID` set |
| Newsletter | UI + toast only — **no backend** |
| Production hardening (rate limits, tests, CI) | **Not done** |

---

## 2. Current System Architecture

### Frontend

- **Next.js 16** App Router (`src/app/`).
- **React 19**, **Tailwind CSS v4**, **shadcn-style UI** + **Base UI** primitives (`src/components/ui/`).
- **RTL** root layout (`lang="ar"`, `dir="rtl"`); admin dashboard shell uses **LTR** for the dashboard UI.
- **Route groups:** `(store)` — catalog storefront; `(landing)` — **`/landing/**`** (minimal chrome: fixed header + links; no `StoreHeader` / `StoreFooter`); **`admin`** — dashboard.
- **Meta Pixel (global):** In **`src/app/layout.tsx`** via **`next/script`** with **`strategy="afterInteractive"`** + **`<noscript>`** img inside **`<body>`** — fires **PageView** on every route. Pixel ID: **`NEXT_PUBLIC_META_PIXEL_ID`** or default **`26009684582048115`** (see env notes). **Do not** add a second `fbq('init')` elsewhere.
- **TikTok Pixel (landing only):** **`src/components/landing/pixel-scripts.tsx`**, included from **`src/app/(landing)/landing/layout.tsx`**, gated by **`NEXT_PUBLIC_TIKTOK_PIXEL_ID`** — avoids duplicating Meta on **`/landing/*`**.
- **Ads helpers:** `src/lib/ads.ts` — `trackViewContent`, `AddToCart`, `InitiateCheckout`, `Purchase` (Meta) / `CompletePayment` (TikTok) for the landing client shell.
- **Client state:** `CartProvider` (`src/contexts/cart-context.tsx`) — cart key `home1raq-cart-v1` in `localStorage`.
- **Landing countdown:** `src/hooks/use-evergreen-countdown.ts` — fixed-duration per browser (**no auto-renew** after zero); **`localStorage`** key **`home1raq-landing-countdown-end:slug:{landingPageSlug}:{productId}`** (slug from landing `meta.slug`); **`typeof window`** guard before storage; interval stops at expiry; UI may show **«انتهى العرض»** via `isExpired`. Duration from **`LandingPage.countdownHours`**.
- **Motion:** `framer-motion` on hero, cards, gallery transitions (dev-only source-map noise from some deps is normal).

### Backend (same Next.js app)

- **Route Handlers** under `src/app/api/`:
  - `POST /api/orders` — guest orders (Zod + Prisma transaction; prices from DB).
  - `GET /api/landing/[slug]` — public JSON: **`getLandingPagePayload(slug)`** (enabled page + ordered **`LandingPageProduct`** lines + resolved prices/copy).
  - `GET|POST /api/admin/landing-pages` — list + create landing pages (Zod: slug min **2** chars, `[a-z0-9-]+`).
  - `GET|PATCH|DELETE /api/admin/landing-pages/[id]` — page core fields + **`defaultProductIndex`**, **`sliderAutoPlay`**, **`sliderAutoPlayIntervalSec`** (3–10s).
  - `POST /api/admin/landing-pages/[id]/products`, `GET|PATCH|DELETE …/products/[lppId]` — attach/reorder/update lines (**overrides**, **`displayRating`**, **`videoUrl`**, etc.).
  - `GET|POST /api/admin/products`, `GET|PATCH|DELETE /api/admin/products/[id]` — products including **`onPromo`**, **`compareAtPrice`**, category, images; **`DELETE`** uses a **transaction**: remove **`OrderItem`** rows for that product, **recalculate `Order.total`** or **delete** orders with no lines left, then **`Product.delete`** (avoids FK **`OrderItem_productId`** blocking admin).
  - `GET|POST /api/admin/categories`, `GET|PATCH|DELETE /api/admin/categories/[id]` — categories CRUD.
  - `GET /api/admin/orders/export` — Excel export.
  - `POST /api/admin/upload` — Supabase Storage bucket **`products`** (requires **service role** key).

### Database

- **PostgreSQL** (typically **Supabase** via `DATABASE_URL` / `DIRECT_URL`).
- **Prisma** — models: `Product`, `Category`, `Order`, `OrderItem`, `OrderStatus`, **`LandingPage`**, **`LandingPageProduct`**.
- **`LandingPage`**: unique **`slug`**, **`enabled`**, **`mode`** (`SINGLE` \| `SLIDER`), offer strings, **`benefitsJson`**, **`reviewsJson`**, **`countdownHours`**, optional **`whatsappOverride`**; showcase controls: **`defaultProductIndex`**, **`sliderAutoPlay`**, **`sliderAutoPlayIntervalSec`**.
- **`LandingPageProduct`**: join row per product on a page — **`displayOrder`**, **`titleOverride`**, **`customDescription`**, **`imagesOverride`**, **`videoUrl`**, **`customPrice`**, **`customCompareAt`**, **`onPromoOverride`**, optional **`displayRating`** (1–5 for UI). **`OrderItem`** may reference **`landingPageProductId`** for campaign-priced lines.
- **Migrations:** `prisma/migrations/` includes e.g. **`…_landing_slider_settings`** (slider + rating columns). Use **`prisma migrate deploy`** / **`migrate dev`** in production-minded workflows, or **`db push`** for fast local iteration — pick one policy per environment.
- **Product promo fields:** `onPromo` (boolean, default `false`), `compareAtPrice` (optional `Decimal`) for strikethrough “was” price; index `@@index([active, onPromo])`.
- **Category delete:** `Product.categoryId` uses **`onDelete: SetNull`** — deleting a category **uncategorizes** products (no API-side block on delete).

### External services

| Service | Use |
|---------|-----|
| **Supabase Auth** | Admin login only. |
| **Supabase Storage** | Product images, bucket **`products`**, public URLs in `next.config` `images.remotePatterns`. |
| **Unsplash** | Seed / sample image URLs allowed in `next.config.ts`. |
| **Meta Ads** | Browser **Meta Pixel** — ID via env or baked default in root layout; Events Manager receives **PageView** + custom events from `lib/ads.ts` on landing. |
| **TikTok Ads** | **TikTok Pixel** — optional; loads only on `/landing` when env set. |

### How pieces interact

1. Storefront reads via **Prisma** in Server Components (many routes `force-dynamic`).
2. **`/landing/[slug]`** (and optional **`/landing`** → default slug) loads payload server-side via **`getLandingPagePayload(slug)`** in **`src/lib/landing-pages.ts`**; client **`LandingPageView`** + **`ProductFirstSlider`** handle showcase, countdown, form, sticky CTA, WhatsApp, and **`lib/ads.ts`** events.
3. Cart is client-side until checkout.
4. Checkout and **landing order form** both post to **`/api/orders`**; server validates and snapshots **priceAtOrder**.
5. Admin uses Supabase session + **`ADMIN_EMAILS`** allowlist (`middleware`, `getAdminUser()`).
6. Uploads use **`SUPABASE_SERVICE_ROLE_KEY`** server-side only.

---

## 3. Implemented Features (Completed)

### Storefront

- **Home:** Hero, dynamic categories from DB (mobile **horizontal scroll** + end-edge **fade** hint), popular/latest blocks (**2-column mobile grid** for cards; optional **`imageAspectRatio="3/4"`** on homepage cards; hide duplicate “latest” block only when **same product ID set** as “popular” slice — see **`home-product-blocks.tsx`**), **promo CTA → `/products?promo=1`**, newsletter UI.
- **Products:** `/products` — category, **`promo=1`**, search `q`, sort, pagination; sidebar “كل المنتجات / العروض والخصومات”.
- **Product detail:** `/products/[slug]` — **`buildSlugCandidates`** (hyphen/space/encoding variants) + **`encodeURIComponent`** on storefront links to avoid `notFound` on Arabic/slug mismatches; **`ProductImageGallery`**, related products, add to cart.
- **Promo UX:** Product cards show **“عرض”** badge when `onPromo`; optional **compare-at** strikethrough when `compareAtPrice > price`.
- **Cart / checkout:** As before; cart line uses first product image.
- **Layout:** `StoreHeader` (nav includes **العروض → `?promo=1`**), **`StoreFooter`** (quick links + **social links** Instagram / Facebook / TikTok, external `target="_blank"` + `rel="noopener noreferrer"`).
- **Search:** Header search submits to `/products?q=...`; input is **controlled** (`value` + `useEffect` sync from `useSearchParams`) to avoid **Base UI** “uncontrolled → controlled” warnings.

### Data & APIs

- Orders, IQD formatting, admin CRUD patterns unchanged at a high level.
- **Category DELETE:** No artificial 409 when products exist — DB FK clears `categoryId`.

### Admin

- Products: multi-image upload, **Include in offers** (`onPromo`), **Compare-at price** (optional, must be **>** sale price if set), list shows **Promo** badge.
- **Landing Page Manager (`/admin/landing`):** list pages with **Edit · Preview · Delete** (**`LandingPageDeleteButton`** → **`DELETE /api/admin/landing-pages/[id]`**); **New** (`/admin/landing/new`) creates a page with unique slug (client: default `offer-{timestamp}`, **min 2 chars** to match API Zod; **409** if slug taken); **Edit** per page — mode `SINGLE` \| `SLIDER`, slider options (**auto-play**, **interval 3–10s**, **default slide index**), lines (product, overrides, **`displayRating`**, images/video), JSON **benefits** / **reviews**, offer copy. Nav label in `AdminShell`: **Landing Page Manager**.
- Categories, orders, export — as documented previously.

### Campaign landing (`/landing/[slug]`)

- **Public routes:** **`/landing/[slug]`** loads enabled **`LandingPage`** by slug; **`/landing`** redirects to **`/landing/home`** (`src/app/(landing)/landing/page.tsx`). **`next.config.ts`** permanent redirect **`/l/:slug` → `/landing/:slug`**.
- **Design intent:** Same Stitch-aligned RTL glass look; sections: **Product showcase** (**`ProductFirstSlider`**), **Benefits**, **Reviews**, **Guest order** + **sticky CTA**, **WhatsApp** (product name in message; **`whatsappOverride`** or **`NEXT_PUBLIC_WHATSAPP_NUMBER`**).
- **Payload types:** **`src/lib/landing-settings.ts`** — `LandingPagePayload` (`meta`, `settings`, `products[]`); each product line is **`LandingProductPayload`** (plain `number` prices — **never** pass Prisma **`Decimal`** into Client Components).
- **Resolve overrides:** **`src/lib/landing-product-resolve.ts`** — merges catalog **`Product`** with **`LandingPageProduct`** (images, copy, prices, promo, video, **`displayRating`**).
- **Showcase (multi-product):** Horizontal **scroll-snap** track (`dir="ltr"` on track for predictable **`scrollLeft`**). **Do not** update React `activeIndex` on every `scroll` tick — use **`scrollend`** when available, else **debounced** `scroll` (~180ms) + **snap proximity** (`|scrollLeft/w − round(ratio)| ≤ 0.12`) before committing index. After programmatic **`scrollTo`**, hold a **`programmaticScroll`** guard (~420ms) so scroll handlers do not fight arrows/thumbnails. **Avoid `ResizeObserver`** on the track for scroll sync (caused jank). **`touch-pan-x`** on track; optional **auto-slide** pauses on hover / touch (see component). **Per-product images:** gradient overlays **`pointer-events-none`**; gallery arrows **`z-30`** + **dots** under image on multi-image **active** slide; **`videoUrl`** renders a **`<video>`** element only on the **active** slide to save resources.
- **Seed:** `prisma/seed.ts` upserts **`home`** and **`demo`** landing pages and attaches active **`Product`** rows as **`LandingPageProduct`** lines when empty.

### Content & config

- **Central copy:** `src/lib/stitch-copy.ts` (Arabic UI strings + footer quick links + **`socialLinks`**). Stitch **project id** remains only in the **file comment** for design reference (not shown in footer).
- **Next/Image:** `sizes` where `fill` is used (e.g. product cards, detail gallery, **admin product thumbnails**, **cart thumbnails**) to satisfy Next.js performance hints.
- **`next.config.ts`:** `distDir` defaults to **`.next-dev`** on Windows to reduce `EPERM` on `.next/trace` (override with `NEXT_DIST_DIR=.next` in `.env.local` if needed); `allowedDevOrigins` for LAN dev; **`devIndicators`** left default (corner “N” **dev-only**, not in production `next start`).

### Tooling & scripts

- `npm run clean` — clears Next build caches (see `scripts/clean-next.mjs`).
- **`npm run db:rebuild-client`** — deletes `node_modules/.prisma` then runs **`prisma generate`** (helps when Windows **EPERM** blocks engine rename after schema changes).
- `npm run db:generate`, `db:push`, `db:seed` — standard Prisma workflow.
- After **`LandingPage` / `LandingPageProduct`** schema changes: **`npm run db:push`** or **`prisma migrate`**, then **`prisma generate`** (or **`npm run db:rebuild-client`** on Windows **EPERM**). Seed **`npm run db:seed`** ensures **`home`** / **`demo`** pages exist.

---

## 4. Partially Implemented Features

| Feature | What exists | What is missing |
|--------|-------------|------------------|
| **Newsletter** | Form + toast | No API / DB / provider |
| **Search** | `q` on `/products` + header | No ranking / analytics |
| **Categories** | Flat model + filters | No nesting |
| **Admin orders** | Table + export | No status workflow UI/API |
| **WhatsApp FAB (store)** | Link | Env `NEXT_PUBLIC_WHATSAPP_NUMBER`; generic message (not order-specific) |
| **WhatsApp (landing)** | Pre-filled product name | Uses override or same env; separate component **`LandingWhatsappFloat`** |

---

## 5. Applied Best Practices (Keep Doing)

### Auth & security

- Admin allowlist **`ADMIN_EMAILS`**; service role **never** exposed as `NEXT_PUBLIC_*`.
- Public `POST /api/orders` is intentional; still **no** CAPTCHA / rate limit in code (see risks).

### Database & Prisma

- Order line snapshots; transactions on order create.
- **After any `schema.prisma` change:** `db push` (or migrate) + **`prisma generate`**. If generate fails with **EPERM**, stop **`next dev`**, run **`npm run db:rebuild-client`**, restart dev.
- Admin product **PATCH/POST** catches **`PrismaClientValidationError`** and returns a hint JSON when the client is out of sync (stale `node_modules/.prisma`).
- **Admin product `DELETE`:** must keep **orders** coherent — implementation removes **`OrderItem`** rows for that SKU, **recomputes `Order.total`**, or **deletes** the order if it has no lines left; document this to operators before they purge catalog SKUs that appear in real orders.

### React / UI

- **Controlled inputs** for URL-driven fields when the library warns on changing `defaultValue` after mount (see header search).
- **External social links:** `<a target="_blank" rel="noopener noreferrer">` from footer.

### Performance & dev experience

- **`sizes`** on `next/image` with `fill`.
- **Image `quality`:** If you use non-default **`quality`** (e.g. `80`), add it to **`images.qualities`** in **`next.config.ts`** — Next 16 warns otherwise.
- **Landing payload:** Prefer **`unstable_cache`** on shared DB loaders such as **`getLandingPagePayload`** with **`revalidate`** aligned to the route’s **`export const revalidate`**; use **`tags`** when you add cache invalidation from admin mutations.
- **Middleware scope:** Keep **`matcher`** as narrow as security allows (currently **`/admin/:path*`** only) so public routes do not pay Supabase session refresh on every request.
- **Next.js 16 + Server Components:** Do not combine **`next/dynamic`** with **`{ ssr: false }`** in Server Component files; avoid naming collisions between **`dynamic()`** and **`export const dynamic`**. Prefer static imports of client components at the RSC boundary when possible.
- **Stale webpack chunks** (`Cannot find module './NNN.js'`): stop dev, **`npm run clean`**, delete locked **`.next-dev`** if needed, restart — often cache corruption, not app logic.
- **Single `next dev`:** Multiple dev servers on the same port/project folder can cause confusing 404s and corrupt incremental state — kill stray PIDs before debugging “mystery” route failures.

### Analytics pixels (Meta + TikTok)

- **Single Meta Pixel init:** Only **`src/app/layout.tsx`** loads **`fbq`** + **`PageView`**. Use **`next/script`** with **`strategy="afterInteractive"`**; **`noscript`** tracking pixel stays inside **`<body>`**. Never add a second **`fbq('init', …)`** in route layouts (previously **`LandingPixelScripts`** duplicated Meta — **removed**; that file is **TikTok-only** now).
- **Environment:** Prefer **`NEXT_PUBLIC_META_PIXEL_ID`** in `.env.local` for the same ID as production; code may fall back to a default pixel ID if unset — document which env the deployment uses.
- **TikTok:** Load only where needed (**`/landing`** layout) when **`NEXT_PUBLIC_TIKTOK_PIXEL_ID`** is set; call **`ttq.page()`** once via the embedded loader (see **`pixel-scripts.tsx`**).
- **Custom events:** Landing uses **`lib/ads.ts`** so server prices stay authoritative; **Purchase** maps to Meta **`Purchase`** and TikTok **`CompletePayment`** (platform naming).

### Code organization

- Route groups **`(store)`**, **`(landing)`**, **`admin/(dashboard)`**, **`api/*`**.
- Shared libs: `lib/prisma`, `lib/supabase/*`, `lib/auth/admin`, `lib/stitch-copy`, `lib/currency`, **`lib/product-slug`** (slug candidate expansion for PDP + links — keep in sync with any new slug rules), **`lib/landing-settings`** (types + JSON parsers), **`lib/landing-pages.ts`** ( **`getLandingPagePayload`** ), **`lib/landing-product-resolve.ts`**, **`lib/landing-defaults`**, **`lib/ads`**, etc.

### Landing admin & Client Components (best practices)

- **Slug rules:** API **`POST /api/admin/landing-pages`** requires slug **length ≥ 2** and **`^[a-z0-9]+(?:-[a-z0-9]+)*$`**. UI must match (avoid first request **422** then success). Prefer **generated unique** default slugs for “New page” (`offer-{timestamp}` pattern).
- **Double submit:** guard **Create** with a ref or disabled button until the first **`POST`** resolves.
- **Prisma → client:** never pass raw **`Decimal`** objects into **`"use client"`** editors or children — map to **`number`** / **`string`** in the **Server Component** page loader (see **`admin/.../landing/[id]/edit/page.tsx`** for product **`price`** on lines).
- **Orders:** landing checkout sends **`landingPageProductId`** when present so **`POST /api/orders`** resolves campaign line pricing.
- **Showcase changes:** touch **`product-first-slider.tsx`** together with **`landing-page-view.tsx`** ( **`activeIndex`**, **`defaultProductIndex`** ) when altering carousel contracts.

---

## 6. Development Phases (Logical)

| Phase | Focus | Status |
|-------|--------|--------|
| 1 | Next + Tailwind + Prisma + env | Done |
| 2 | Storefront + cart + checkout + orders API | Done |
| 3 | Admin + Storage + categories + orders export | Done |
| 4 | Promo catalog, gallery UX, footer/social, Prisma/Windows ops polish | Done |
| 5 | **Campaign landings `/landing/[slug]`**, **`LandingPage`** model, admin landing manager, multi-product showcase, evergreen countdown, ads helpers, global Meta Pixel + optional TikTok on landing | **Done** |
| 6 | Payments, notifications, tests, migrations in repo | Pending |

---

## 7. Pending Work / Checklist

### Product & catalog

- [x] Categories + filters.
- [x] **Promo flag** + optional compare-at + `/products?promo=1`.
- [ ] Inventory / stock.
- [ ] Variants (size, color).
- [~] Search (basic `q` only).

### Orders & ops

- [ ] Admin order **status** workflow.
- [ ] Email / SMS / WhatsApp on new order.
- [ ] Payment provider (if not COD-only).

### Marketing & legal

- [x] **Meta Pixel** global (root layout) + optional **TikTok** on landing; custom events on landing via `lib/ads.ts`.
- [x] **Conversion landing** `/landing/[slug]` + admin landing manager + multi-product slider UX.
- [ ] Newsletter backend.
- [ ] Real **privacy / terms** pages (footer no longer uses `#` placeholders for those — add pages when ready); consider cookie/consent banner if EU traffic + strict ad compliance.

### Quality

- [ ] Automated tests.
- [ ] Rate limiting on `POST /api/orders`.
- [ ] CI/CD + **versioned migrations** in repo if production requires it.

### i18n

- [ ] Admin remains largely English; storefront Arabic — unify if product needs it.

---

## 8. Technical Decisions & Trade-offs

| Decision | Rationale | Trade-off |
|----------|-----------|-----------|
| **Promo = boolean + optional compare-at** | Simple admin UX; real price stays `price` | No scheduled promos / coupon engine |
| **Guest checkout + localStorage cart** | Low friction | No cross-device cart |
| **`distDir: .next-dev`** | Reduce Windows file lock pain vs `.next` | Non-default folder; document for tooling |
| **Prisma direct to Postgres** | Type-safe, fast iteration | RLS not applied to Prisma connection — app must enforce rules |
| **Meta Pixel in root layout** | One init, PageView on all routes, Next **`Script`** best practice | Pixel ID in client bundle (`NEXT_PUBLIC_*`); respect org privacy/consent policies |
| **`LandingPage` per campaign slug** | Many URLs, independent copy/pricing lines | More admin surface; keep editor validation + plain JSON for lines |

---

## 9. Risks & Technical Debt

1. **Spam / abuse** on public order creation — no rate limit.
2. **Service role key** — powerful; rotate if leaked.
3. **Storage bucket `products`** — must exist and be public-read for current URL pattern.
4. **Windows dev** — `EPERM` on Prisma engine / `.next-dev` trace; use **clean + rebuild client**; don’t run multiple dev servers on same folder.
5. **Stale Next webpack chunks** — full clean + restart after crashes.
6. **`next-themes`** — listed in `package.json` but unused (cleanup candidate).
7. **Migration discipline** — repo now has **`prisma/migrations/`**; still easy to drift if some envs use only **`db push`**. Align team on **one** workflow per environment.
8. **Framer-motion / devtools** — occasional `.mjs.map` 404 noise in dev; harmless.
9. **Duplicate Meta Pixel** — if someone re-injects **`fbq('init')`** in a nested layout, Events Manager will show **inflated** counts; keep a **single** init in **`layout.tsx`** only.

---

## 10. Future Roadmap (Suggested)

- **Short:** Order status actions, notifications, rate limit on orders, remove unused deps, commit migrations if production needs them.
- **Medium:** Inventory, richer search, payment provider.
- **Long:** Customer accounts, analytics, i18n, caching strategy (ISR/revalidate) for heavy Prisma pages.

---

## 11. Developer Notes (Operations)

### Environment (non-exhaustive)

- `DATABASE_URL`, `DIRECT_URL`
- `NEXT_PUBLIC_SUPABASE_URL`, anon/publishable key
- **`SUPABASE_SERVICE_ROLE_KEY`** — required for `/api/admin/upload`
- **`ADMIN_EMAILS`** — comma-separated
- `NEXT_PUBLIC_WHATSAPP_NUMBER` — optional (store FAB + landing fallback)
- **`NEXT_PUBLIC_META_PIXEL_ID`** — optional; Meta Pixel ID (if omitted, root layout may use documented default — keep deployment and repo in sync)
- **`NEXT_PUBLIC_TIKTOK_PIXEL_ID`** — optional; TikTok Pixel on **`/landing`** only

### Commands

- After **schema** change: `npm run db:push` (or migrate) + **`npm run db:generate`** (or **`npm run db:rebuild-client`** if EPERM).
- After **env** change: restart `next dev`.
- **Broken dev build / missing chunks:** `npm run clean`, remove `.next-dev` if locked, restart.

### Social URLs (footer — also in `stitch-copy.ts`)

- Instagram: `https://www.instagram.com/home1raq?igsh=OTFrd3F2ZjF6am8w&utm_source=qr`
- Facebook: `https://www.facebook.com/share/1BHVGJBA1r/?mibextid=wwXIfr`
- TikTok: `https://www.tiktok.com/@home1raq?_r=1&_t=ZS-95XlN22oSP3`

### Honesty

This report reflects **code + intentional behavior** documented here; production also depends on Supabase dashboard settings, DNS, and deployment env.

---

## 12. Changelog (for future “where we left off”)

| When (approx) | What changed |
|----------------|--------------|
| **2026-05-07** | Added `export const revalidate = 3600;` to `src/app/(store)/products/page.tsx` and `src/app/(store)/products/[slug]/page.tsx` to set 1-hour route revalidation on products listing and product detail pages. |
| **2026-05-07** | Product detail page (`/products/[slug]`) now shows a green free-delivery line under price and before description: **"🚚 توصيل مجاني لجميع أنحاء العراق"** (styled to match the promo badge tone). |
| **2026-05-07** | Cart/checkout summaries now remove shipping-cost rows and show **"توصيل مجاني 🚚"** in green next to total while keeping total math unchanged; landing product section adds a marketing badge under price: **"🚚 توصيل مجاني لجميع أنحاء العراق"**. |
| **2026-05-07** | Added Facebook domain verification meta (`verification.other["facebook-domain-verification"]`) to root `metadata` in `src/app/layout.tsx`. |
| **2026-04-29** | **Homepage hero refactor:** **`HeroSection`** uses **`flex-col` + `justify-center` + `minHeight: 85svh`**, a **`flex-1`** spacer before the scroll row, **no `absolute`** on **«اكتشف المزيد ↓»**; **`animate-bounce`** on chevron; removed **`.hero-section-height-stack`** from **`globals.css`**. |
| **2026-04-29** | **Homepage hero layout tweak:** hero `<section>` uses **`.hero-section-height-stack`** (`85vh` → `85dvh` → `85svh`); removed extra section **`paddingBottom`**; inner content **`pb-16`**; scroll indicator **`bottom-8`** (was **`bottom-4`**). |
| **2026-04-29** | **iOS Safari viewport fix (hero):** switched hero height to **`85svh`** with **`85vh`** fallback and added bottom safe-area padding via **`env(safe-area-inset-bottom)`** so **«اكتشف المزيد ↓»** remains visible above browser/home UI on real iPhones. |
| **2026-04-29** | **Homepage hero spacing fix:** removed excessive top empty space by tightening hero top layout padding/alignment; moved **«اكتشف المزيد ↓»** to an absolute bottom position inside the 85vh hero so it is visible on first load (mobile included). |
| **2026-04-29** | **Homepage scroll UX:** hero height 85vh, animated scroll indicator (bounce + Arabic label, auto-hide on scroll), smooth-scroll to categories, fade-up entrance on categories section. |
| **2026-04-29** | **Performance / Next 16:** Landing **`revalidate = 60`** + **`unstable_cache`** on **`getLandingPagePayload`** (`landing-pages.ts`) with tags; **`Suspense`** + **`LandingPageSkeleton`** on **`/landing/[slug]`**. **`next.config`:** **`images.qualities`** `[75, 80]`, image cache TTL + AVIF/WebP. **Middleware** matcher narrowed to **`/admin/:path*`**. **Store header:** search visible on mobile with constrained width (**`682cd4d`**). **Patterns:** no **`dynamic(..., { ssr: false })`** in RSC files; font **`display: "swap"`**; lighter third-party script loading where applied. **Dev:** document single **`next dev`**, clean `.next` when Turbopack/404 issues. **`PROJECT_REPORT.md`:** new **2026-04-29** Arabic block + Changelog + best-practices for **Cursor Agent** handoff. |
| **2026-04-24** | **Landing countdown:** fixed window, **no auto-renew**, `localStorage` key **`…:slug:{slug}:{productId}`**, SSR-safe storage, **`isExpired`** UI copy. **Home:** mobile **2-col** product grids, homepage **`ProductCard`** **`imageAspectRatio="3/4"`** + neutral empty image; **categories** mobile **horizontal scroll** + **`::after`** fade; **latest** section hidden only when **same ID multiset** as popular slice (**not** when `latest.length <= 4` — that bug was fixed). **PDP:** **`buildSlugCandidates`** (hyphen/space/encoding) + **`encodeURIComponent`** on product links. **Admin:** **`DELETE /api/admin/products/[id]`** in a **transaction** (strip **`OrderItem`**, recalc or delete **`Order`**), Arabic delete toasts; **`/admin/landing`** **Delete** button (**`LandingPageDeleteButton`**). **`PROJECT_REPORT.md`** refreshed for agents. |
| **2026-04-21** | **Audit:** ESLint **ignores** for `.next` / `.next-dev`; fix **unused imports** in `landing-settings.ts`; **react-hooks** note in `landing-page-editor`; remove unused **`landing-showcase.tsx`**; **`LANDING_FALLBACK_PRODUCT_IMAGE`** in `landing-defaults.ts` + use in **`product-first-slider.tsx`**. |
| **2026-04** | Product **image gallery** (slider, thumbs, swipe, a11y). |
| **2026-04** | **Promos:** `onPromo`, `compareAtPrice`; `/products?promo=1`; admin toggles; nav + home promo CTA; cards + PDP badges/strike price. |
| **2026-04** | **Category delete** allowed with products (FK `SetNull`). |
| **2026-04** | **Footer:** removed Stitch footer line; **social** links; trimmed quick links. |
| **2026-04** | **Header search** controlled state (Base UI fix). |
| **2026-04** | **Prisma:** `db:rebuild-client` script; API hint on stale client; image `sizes` on admin list + cart. |
| **2026-04** | Next **dev indicator** left enabled (hidden in production builds). |
| **2026-04-19** | **First shipped landing route** under **`(landing)`**: showcase-style blocks, benefits, reviews, offer + **evergreen countdown** (`localStorage` / **`use-evergreen-countdown`**), guest **order** → **`POST /api/orders`**, sticky CTA, **WhatsApp** with product name (later generalized to **`/landing/[slug]`** — see **2026-04-20**). |
| **2026-04-19** | **Earlier landing iteration:** singleton settings + single featured product API (**superseded 2026-04-20** by **`LandingPage`** / **`landing-pages`** APIs — see rows below). |
| **2026-04-19** | **Meta Pixel:** **`next/script`** + **`afterInteractive`** + **noscript** in **`src/app/layout.tsx`**; **no duplicate** Meta in **`LandingPixelScripts`** (TikTok-only there). **`lib/ads.ts`** for ViewContent / AddToCart / InitiateCheckout / Purchase (+ TikTok CompletePayment). |
| **2026-04-19** | **Env:** document **`NEXT_PUBLIC_META_PIXEL_ID`**, **`NEXT_PUBLIC_TIKTOK_PIXEL_ID`**, WhatsApp override behavior. |
| **2026-04-20** | **Replaced singleton landing with multi-page model:** **`LandingPage`** + **`LandingPageProduct`**; public **`getLandingPagePayload(slug)`**; routes **`/landing/[slug]`**, admin **`/admin/landing`**, APIs under **`/api/admin/landing-pages`**; redirect **`/l/:slug` → `/landing/:slug`**. |
| **2026-04-20** | **Showcase UX:** horizontal snap carousel, thumbnails + dots, sticky mini-switcher, optional auto-slide (admin-toggled), **`scrollend`** / debounced index commit + programmatic scroll guard; per-slide image dots + **`pointer-events-none`** overlays; **`displayRating`** on lines. |
| **2026-04-20** | **Admin new page:** default unique slug, client **min-2** validation, submit lock, clearer **422/409** toasts; API returns first **slug** Zod error as **`error`** string. |
| **2026-04-20** | **Prisma migrations** in repo (e.g. slider + **`displayRating`** columns); **`db:rebuild-client`** still recommended on Windows **EPERM** after **`prisma generate`**. |

---

## Document maintenance

- Update **Changelog (section 12)** and **Last updated** when you ship meaningful features or change architecture; add a short row to the **dated Arabic “آخر تحديثات”** block (e.g. **2026-04-29**) when behaviour changes materially for Arabic storefront or admin.
- Before claiming a capability, verify **`prisma/schema.prisma`** (`LandingPage`, `LandingPageProduct`, `Order` / `OrderItem` delete semantics), **`src/lib/landing-pages.ts`**, **`src/lib/landing-settings.ts`**, **`src/lib/landing-product-resolve.ts`**, **`src/components/landing/product-first-slider.tsx`**, **`src/hooks/use-evergreen-countdown.ts`**, **`src/components/home/home-product-blocks.tsx`**, **`src/lib/product-slug.ts`**, the **`src/app/api/admin/landing-pages/`** and **`src/app/api/admin/products/[id]/`** route handlers, **`src/app/layout.tsx`** (pixels), and **`src/lib/stitch-copy.ts`**.
