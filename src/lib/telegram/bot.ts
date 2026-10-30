import { Prisma } from "@prisma/client";
import { after } from "next/server";
import { formatIqd } from "@/lib/currency";
import { prisma } from "@/lib/prisma";
import { shortProductUrl } from "@/lib/site";
import { createProduct, uniqueProductSlug } from "@/lib/products/create";
import { uploadProductImage } from "@/lib/products/upload";
import {
  allowedUserIds,
  downloadFile,
  productUrl,
  sendMessage,
  tg,
} from "@/lib/telegram/api";
import { CAPTION_TEMPLATE, type ValidDraft, validateCaption } from "@/lib/telegram/caption";

/** Subset of the Telegram Update object the bot reads. */
export type TgUpdate = {
  update_id: number;
  message?: TgMessage;
  callback_query?: {
    id: string;
    from: { id: number };
    data?: string;
    message?: { message_id: number; chat: { id: number } };
  };
};

type TgMessage = {
  message_id: number;
  from?: { id: number };
  chat: { id: number; type: string };
  text?: string;
  caption?: string;
  media_group_id?: string;
  photo?: { file_id: string; width: number; height: number }[];
};

/**
 * Album photos arrive as separate updates, and Telegram only sends the next update
 * after we respond to the current one. So the preview is built after the response
 * (`after`), once the rest of the album has had time to land.
 */
function albumWaitMs() {
  const v = Number(process.env.TELEGRAM_ALBUM_WAIT_MS);
  return Number.isFinite(v) && v >= 0 ? v : 4000;
}

const SERVER_ERROR_TEXT = "⚠️ صار خطأ بالسيرفر وما گدرت أجهّز المعاينة. جرّب تدز الصور مرة ثانية.";

const HELP_TEXT = [
  "هلا بيك 👋 حتى تنشر منتج بالموقع:",
  "١. اختار صور المنتج (لحد ١٠ صور) ودزها كألبوم.",
  "٢. بنفس الرسالة اكتب الكابشن هيج:",
  "",
  CAPTION_TEMPLATE,
  "",
  "«قبل الخصم» و«الوصف» اختياري. إذا حطيت «قبل الخصم» المنتج ينحط عرض.",
].join("\n");

function escapeHtml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function isAllowed(userId: number | undefined) {
  return userId != null && allowedUserIds().has(String(userId));
}

export async function handleUpdate(update: TgUpdate) {
  if (update.callback_query) return handleCallback(update.callback_query);
  const msg = update.message;
  if (!msg || msg.chat.type !== "private" || !isAllowed(msg.from?.id)) return;

  if (msg.photo?.length) {
    try {
      await handlePhoto(msg);
    } catch (e) {
      console.error("[telegram] photo handling failed:", e);
      if (msg.caption?.trim()) {
        await sendMessage(msg.chat.id, SERVER_ERROR_TEXT);
      }
    }
    return;
  }

  const text = msg.text?.trim() ?? "";
  if (/السعر|سعر/.test(text)) {
    await sendMessage(
      msg.chat.id,
      "الكابشن وصل بس بدون صور 📷\nاختار الصور وبعدين اكتب هالكابشن ويّاها بنفس الرسالة.",
    );
    return;
  }
  await sendMessage(msg.chat.id, HELP_TEXT);
}

async function handlePhoto(msg: TgMessage) {
  const chatId = String(msg.chat.id);
  const largest = msg.photo![msg.photo!.length - 1];

  await prisma.telegramPhoto.createMany({
    data: [
      {
        chatId,
        messageId: msg.message_id,
        mediaGroupId: msg.media_group_id ?? null,
        fileId: largest.file_id,
      },
    ],
    skipDuplicates: true,
  });

  if (!msg.caption?.trim()) {
    // Uncaptioned album photo: the captioned one will pick it up.
    if (!msg.media_group_id) {
      await sendMessage(msg.chat.id, `الصورة وصلت بس بدون كابشن.\n\n${HELP_TEXT}`);
    }
    return;
  }

  const categories = await prisma.category.findMany({
    where: { active: true },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: { id: true, name: true, slug: true },
  });
  const result = validateCaption(msg.caption, categories);
  if (!result.ok) {
    await sendMessage(msg.chat.id, `⚠️ ${result.error}\n\nصحّح الكابشن ودز الصور من جديد.`);
    return;
  }

  if (!msg.media_group_id) {
    await sendPreview(msg, result.draft);
    return;
  }
  after(async () => {
    try {
      await new Promise((r) => setTimeout(r, albumWaitMs()));
      await sendPreview(msg, result.draft);
    } catch (e) {
      console.error("[telegram] album preview failed:", e);
      await sendMessage(msg.chat.id, SERVER_ERROR_TEXT).catch(() => {});
    }
  });
}

/** Photo file_ids of the album `messageId` belongs to (or just that photo), in send order. */
async function albumFileIds(chatId: string, messageId: number, mediaGroupId?: string | null) {
  const photos = await prisma.telegramPhoto.findMany({
    where: mediaGroupId ? { chatId, mediaGroupId } : { chatId, messageId },
    orderBy: { messageId: "asc" },
  });
  return photos.map((p) => p.fileId).slice(0, 10);
}

async function sendPreview(msg: TgMessage, draft: ValidDraft) {
  const chatId = String(msg.chat.id);
  const fileIds = await albumFileIds(chatId, msg.message_id, msg.media_group_id);

  let draftId: string;
  try {
    const row = await prisma.telegramDraft.create({
      data: {
        chatId,
        sourceMessageId: msg.message_id,
        name: draft.name,
        description: draft.description,
        price: draft.price,
        compareAtPrice: draft.compareAtPrice,
        categoryId: draft.category.id,
        fileIds,
      },
    });
    draftId = row.id;
  } catch (e) {
    // Telegram re-delivered the same update: the preview was already sent.
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") return;
    throw e;
  }

  // Housekeeping: photos are only needed until the draft exists.
  await prisma.telegramPhoto.deleteMany({
    where: { createdAt: { lt: new Date(Date.now() - 2 * 24 * 3600 * 1000) } },
  });

  const slug = await uniqueProductSlug(draft.name);

  if (fileIds.length > 1) {
    await tg("sendMediaGroup", {
      chat_id: msg.chat.id,
      media: fileIds.map((id) => ({ type: "photo", media: id })),
    });
  } else {
    await tg("sendPhoto", { chat_id: msg.chat.id, photo: fileIds[0] });
  }

  const lines = [
    "👀 <b>معاينة المنتج قبل النشر</b>",
    "",
    `<b>الاسم:</b> ${escapeHtml(draft.name)}`,
    `<b>السعر:</b> ${formatIqd(draft.price)}`,
    draft.compareAtPrice != null
      ? `<b>قبل الخصم:</b> <s>${formatIqd(draft.compareAtPrice)}</s>  🔥 ينحط عرض`
      : "<b>قبل الخصم:</b> — (مو عرض)",
    `<b>الفئة:</b> ${escapeHtml(draft.category.name)}`,
    `<b>الصور:</b> ${fileIds.length}`,
    `<b>الرابط:</b> ${escapeHtml(productUrl(slug))}`,
    "",
    `<b>الوصف:</b>\n${escapeHtml(draft.description)}`,
  ];
  await sendMessage(msg.chat.id, lines.join("\n"), {
    parse_mode: "HTML",
    reply_markup: publishKeyboard(draftId),
  });
}

function publishKeyboard(draftId: string) {
  return {
    inline_keyboard: [
      [
        { text: "✅ نشر", callback_data: `pub:${draftId}` },
        { text: "❌ إلغاء", callback_data: `cxl:${draftId}` },
      ],
    ],
  };
}

async function handleCallback(cb: NonNullable<TgUpdate["callback_query"]>) {
  if (!isAllowed(cb.from.id) || !cb.message) return;
  const [action, draftId] = (cb.data ?? "").split(":");
  const chatId = cb.message.chat.id;
  const messageId = cb.message.message_id;

  const editText = (text: string, extra: Record<string, unknown> = {}) =>
    tg("editMessageText", {
      chat_id: chatId,
      message_id: messageId,
      text,
      parse_mode: "HTML",
      link_preview_options: { is_disabled: true },
      ...extra,
    });

  if (action === "cxl") {
    const { count } = await prisma.telegramDraft.updateMany({
      where: { id: draftId, chatId: String(chatId), status: "PENDING" },
      data: { status: "CANCELLED" },
    });
    await tg("answerCallbackQuery", {
      callback_query_id: cb.id,
      text: count ? "انلغى" : "هذا المنتج مو بانتظار النشر",
    });
    if (count) await editText("❌ انلغى، ما انتشر شي.");
    return;
  }

  if (action !== "pub") {
    await tg("answerCallbackQuery", { callback_query_id: cb.id });
    return;
  }

  // Claim the draft so a double tap can't publish twice.
  const { count } = await prisma.telegramDraft.updateMany({
    where: { id: draftId, chatId: String(chatId), status: "PENDING" },
    data: { status: "PUBLISHING" },
  });
  if (!count) {
    await tg("answerCallbackQuery", {
      callback_query_id: cb.id,
      text: "هذا المنتج انتشر أو انلغى من قبل",
    });
    return;
  }
  await tg("answerCallbackQuery", { callback_query_id: cb.id, text: "جاري النشر…" });
  await editText("⏳ جاري رفع الصور ونشر المنتج…");

  const draft = await prisma.telegramDraft.findUniqueOrThrow({ where: { id: draftId } });
  try {
    // Pick up album photos that landed after the preview was built.
    const source = await prisma.telegramPhoto.findUnique({
      where: { chatId_messageId: { chatId: draft.chatId, messageId: draft.sourceMessageId } },
    });
    const latest = source?.mediaGroupId
      ? await albumFileIds(draft.chatId, draft.sourceMessageId, source.mediaGroupId)
      : [];
    const fileIds = latest.length > draft.fileIds.length ? latest : draft.fileIds;

    const images: string[] = [];
    for (const fileId of fileIds) {
      const file = await downloadFile(fileId);
      const type = file.contentType?.startsWith("image/") ? file.contentType : undefined;
      images.push(await uploadProductImage(file.buffer, file.ext, type));
    }

    const compareAtPrice = draft.compareAtPrice != null ? Number(draft.compareAtPrice) : null;
    const product = await createProduct({
      name: draft.name,
      description: draft.description,
      price: Number(draft.price),
      compareAtPrice,
      // Same rule the storefront uses: a "was" price means it is an offer (/products?promo=1).
      onPromo: compareAtPrice != null,
      images,
      active: true,
      categoryId: draft.categoryId,
    });

    await prisma.telegramDraft.update({
      where: { id: draftId },
      data: { status: "PUBLISHED", productSlug: product.slug },
    });
    const url = productUrl(product.slug);
    const shareUrl = shortProductUrl(product.id);
    await editText(
      `✅ <b>انتشر المنتج!</b>\n${escapeHtml(product.name)}\n\n` +
        `<b>رابط المشاركة (للواتساب):</b>\n${escapeHtml(shareUrl)}`,
      { reply_markup: { inline_keyboard: [[{ text: "🔗 افتح المنتج", url }]] } },
    );
  } catch (e) {
    console.error("[telegram] publish failed:", e);
    await prisma.telegramDraft.update({ where: { id: draftId }, data: { status: "PENDING" } });
    const reason = e instanceof Error ? e.message : String(e);
    await editText(
      `⚠️ صار خطأ وما انتشر المنتج:\n<code>${escapeHtml(reason.slice(0, 300))}</code>\n\nجرّب تدوس ✅ مرة ثانية.`,
      { reply_markup: publishKeyboard(draftId) },
    );
  }
}
