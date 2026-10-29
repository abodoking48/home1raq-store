import { formatIqd } from "@/lib/currency";
import { iraqiPhone } from "@/lib/phone";
import { prisma } from "@/lib/prisma";
import { allowedUserIds, sendMessage, siteUrl } from "@/lib/telegram/api";

function escapeHtml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/**
 * Notifies the owner on Telegram about a new order. Recipients: TELEGRAM_ORDER_CHAT_IDS,
 * else TELEGRAM_ALLOWED_USER_IDS. No-op when the bot token is not configured.
 * Includes the full phone and address (the owner asked for them for delivery).
 */
export async function notifyNewOrder(orderId: string) {
  if (!process.env.TELEGRAM_BOT_TOKEN?.trim()) return;
  const explicit = (process.env.TELEGRAM_ORDER_CHAT_IDS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const recipients = explicit.length ? explicit : [...allowedUserIds()];
  if (!recipients.length) return;

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: { include: { product: { select: { name: true } } } } },
  });
  if (!order) return;

  const phone = iraqiPhone(order.phone);
  const lines = [
    "🛒 <b>طلب جديد!</b>",
    "",
    ...order.items.map(
      (i) =>
        `• ${escapeHtml(i.product.name)} × ${i.quantity} — ${formatIqd(Number(i.priceAtOrder) * i.quantity)}`,
    ),
    "",
    `<b>المجموع:</b> ${formatIqd(Number(order.total))}`,
    "",
    `<b>الزبون:</b> ${escapeHtml(order.fullName)}`,
    // <code> = tap to copy; the +964 form below is auto-linked by Telegram (tap to call).
    `<b>الهاتف:</b> <code>${escapeHtml(phone.local)}</code>`,
    ...(phone.intl ? [`<b>اتصال:</b> +${phone.intl}`] : []),
    `<b>المدينة:</b> ${escapeHtml(order.city)}`,
    `<b>العنوان:</b> ${escapeHtml(order.address)}`,
    ...(order.notes?.trim() ? [`<b>ملاحظات:</b> ${escapeHtml(order.notes.trim())}`] : []),
    "",
    `التفاصيل: ${siteUrl()}/admin/orders`,
  ];
  const extra: Record<string, unknown> = { parse_mode: "HTML" };
  if (phone.intl) {
    extra.reply_markup = {
      inline_keyboard: [[{ text: "💬 واتساب الزبون", url: `https://wa.me/${phone.intl}` }]],
    };
  }

  await Promise.all(
    recipients.map((chatId) =>
      sendMessage(chatId, lines.join("\n"), extra).catch((e) =>
        console.error("[telegram] order notify failed:", e),
      ),
    ),
  );
}
