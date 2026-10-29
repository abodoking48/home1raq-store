import { productPath, SITE_URL } from "@/lib/site";

/** Minimal Telegram Bot API client (server-only). Token comes from TELEGRAM_BOT_TOKEN. */

function botToken() {
  const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
  if (!token) throw new Error("Missing TELEGRAM_BOT_TOKEN");
  return token;
}

/** Overridable for local tests against a mock server. */
function apiBase() {
  return process.env.TELEGRAM_API_BASE?.trim() || "https://api.telegram.org";
}

export async function tg<T = unknown>(
  method: string,
  params: Record<string, unknown>,
): Promise<T> {
  const res = await fetch(`${apiBase()}/bot${botToken()}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  const json = (await res.json().catch(() => null)) as
    | { ok: boolean; result?: T; description?: string }
    | null;
  if (!json?.ok) {
    throw new Error(`Telegram ${method} failed: ${json?.description ?? res.status}`);
  }
  return json.result as T;
}

export function sendMessage(
  chatId: number | string,
  text: string,
  extra: Record<string, unknown> = {},
) {
  return tg("sendMessage", {
    chat_id: chatId,
    text,
    link_preview_options: { is_disabled: true },
    ...extra,
  });
}

/** Downloads a photo by file_id; returns bytes plus the extension Telegram stored it with. */
export async function downloadFile(fileId: string) {
  const file = await tg<{ file_path?: string }>("getFile", { file_id: fileId });
  if (!file.file_path) throw new Error("Telegram getFile returned no file_path");
  const res = await fetch(`${apiBase()}/file/bot${botToken()}/${file.file_path}`);
  if (!res.ok) throw new Error(`Telegram file download failed: ${res.status}`);
  const buffer = Buffer.from(await res.arrayBuffer());
  const ext = file.file_path.split(".").pop();
  return { buffer, ext, contentType: res.headers.get("content-type") ?? undefined };
}

export function allowedUserIds(): Set<string> {
  return new Set(
    (process.env.TELEGRAM_ALLOWED_USER_IDS ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
  );
}

export function siteUrl() {
  return SITE_URL;
}

export function productUrl(slug: string) {
  return `${SITE_URL}${productPath(slug)}`;
}
