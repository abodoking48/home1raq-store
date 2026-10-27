This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Cursor: Supabase MCP

Supabase MCP is configured at the workspace root: `Home1raq/.cursor/mcp.json` (alongside `.cursor/settings.json` which enables the Supabase plugin).

1. In [Supabase Dashboard](https://supabase.com/dashboard) → your project → **Project Settings → General**, copy **Reference ID** (project ref).
2. Edit `d:\Home1raq\.cursor\mcp.json` and replace `REPLACE_WITH_PROJECT_REF` in the `supabase` URL with that ID.
3. In Cursor: **Settings → Cursor Settings → Tools & MCP**, ensure **supabase** appears and connect (restart Cursor if needed). Complete the browser OAuth step when prompted.
4. If the server does not show up, add the same `supabase` block to `%USERPROFILE%\.cursor\mcp.json` (Cursor merges user + project MCP in most builds).
5. Docs: [Supabase MCP](https://supabase.com/docs/guides/getting-started/mcp). `read_only=true` is set in the URL for safety — use a dev project, not production.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Telegram bot — نشر المنتجات من الموبايل

Webhook: `src/app/api/telegram/route.ts` (logic in `src/lib/telegram/`). It uses the same
helpers as the admin page (`src/lib/products/create.ts`, `src/lib/products/upload.ts`), so
products get the same slug, columns, storage path (`products/products/<uuid>.<ext>` in bucket
`products`) and promo rule (a "قبل الخصم" price sets `compareAtPrice` + `onPromo` → badge «عرض»
and listed on `/products?promo=1`).

**How it works:** send the product photos as one album with this caption → the bot replies with a
preview and **✅ نشر / ❌ إلغاء** → on ✅ it uploads the photos, creates the product and replies
with the live link. New orders from `/checkout` are also sent to the owner (items, total,
city/area; phone masked, no street address).

### Caption template (انسخه)

```
الاسم: خلاط كهربائي 3 سرعات
السعر: 35000
قبل الخصم: 45000
الفئة: المطبخ
الوصف: خلاط قوي 800 واط، جك زجاج 1.5 لتر.
```

- «قبل الخصم» و«الوصف» اختياري (بدون وصف ينحط الاسم كوصف).
- الأسعار تقبل `٣٥٬٠٠٠`، `35,000 د.ع`، `35 الف`.
- الفئة لازم تطابق اسم فئة فعّالة بالموقع (المطبخ، مسابح، إلكترونيات، أثاث، أجهزة رياضية، العناية الشخصية…).
- Field names are flexible: `اسم/الاسم`, `سعر/السعر`, `قبل الخصم/السعر القديم`, `الفئة/القسم/التصنيف`, `الوصف/وصف`.

### Environment variables

Set these in **Vercel → Project → Settings → Environment Variables** (Production), and in
`.env.local` for local testing (`.env*` is gitignored). Never commit them.

| Variable | Value |
| --- | --- |
| `TELEGRAM_BOT_TOKEN` | Token from @BotFather |
| `TELEGRAM_WEBHOOK_SECRET` | Any long random string (letters, digits, `_` `-`), you choose it |
| `TELEGRAM_ALLOWED_USER_IDS` | Comma-separated Telegram user IDs allowed to publish (get yours from @userinfobot) |
| `SUPABASE_SERVICE_ROLE_KEY` | Already used by the admin upload |
| `NEXT_PUBLIC_SUPABASE_URL` | Already set |
| `NEXT_PUBLIC_SITE_URL` | Optional, default `https://www.home1raq.com` |
| `TELEGRAM_ORDER_CHAT_IDS` | Optional; who gets order notifications (default: the allowed user IDs) |

### One-time setup

1. Create the bot tables (additive, no existing data touched):
   `npx prisma migrate deploy` (or `npm run db:push`) against the production `DATABASE_URL`.
2. Deploy, then register the webhook once (PowerShell, after setting the two env vars in the same window):

   ```powershell
   curl.exe -X POST "https://api.telegram.org/bot$env:TELEGRAM_BOT_TOKEN/setWebhook" -d "url=https://www.home1raq.com/api/telegram" -d "secret_token=$env:TELEGRAM_WEBHOOK_SECRET" -d "allowed_updates=[\"message\",\"callback_query\"]"
   ```

   Check it with `curl.exe "https://api.telegram.org/bot$env:TELEGRAM_BOT_TOKEN/getWebhookInfo"`.
3. Send `/start` to the bot.
