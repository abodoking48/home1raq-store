import { formatIqd } from "@/lib/currency";
import { prisma } from "@/lib/prisma";
import { allowedUserIds, sendMessage, siteUrl } from "@/lib/telegram/api";

/** `07701234567` → `0770••••567` (full number stays in /admin/orders). */
export function maskPhone(phone: string) {
  const p = phone.replace(/\s+/g, "");
  if (p.length <= 7) return "•••";
  return `${p.slice(0, 4)}${"•".repeat(Math.max(3, p.length - 7))}${p.slice(-3)}`;
}

/** Checkout stores `"<area> — <address>"`; only the area goes in the notification. */
export function areaFromAddress(address: string) {
  const parts = address.split(" — ");
  return parts.length > 1 ? parts[0].trim() : "";
}

/**
 * Notifies the owner on Telegram about a new order. Recipients: TELEGRAM_ORDER_CHAT_IDS,
 * else TELEGRAM_ALLOWED_USER_IDS. No-op when the bot token is not configured.
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

  const area = areaFromAddress(order.address);
  const lines = [
    "🛒 طلب جديد!",
    "",
    ...order.items.map(
      (i) => `• ${i.product.name} × ${i.quantity} — ${formatIqd(Number(i.priceAtOrder) * i.quantity)}`,
    ),
    "",
    `المجموع: ${formatIqd(Number(order.total))}`,
    `المدينة: ${order.city}${area ? ` — ${area}` : ""}`,
    `الزبون: ${order.fullName.split(/\s+/)[0]} (${maskPhone(order.phone)})`,
    "",
    `التفاصيل: ${siteUrl()}/admin/orders`,
  ];
  const text = lines.join("\n");

  await Promise.all(
    recipients.map((chatId) =>
      sendMessage(chatId, text).catch((e) =>
        console.error("[telegram] order notify failed:", e),
      ),
    ),
  );
}
