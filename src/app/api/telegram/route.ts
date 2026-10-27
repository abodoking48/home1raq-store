import { timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";
import { handleUpdate, type TgUpdate } from "@/lib/telegram/bot";

export const runtime = "nodejs";
/** Publishing downloads + re-uploads up to 10 photos. */
export const maxDuration = 60;

function secretMatches(header: string | null) {
  const expected = process.env.TELEGRAM_WEBHOOK_SECRET?.trim();
  if (!expected || !header) return false;
  const a = Buffer.from(header);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

/** Telegram webhook — registered with `setWebhook` + `secret_token` (see README). */
export async function POST(req: Request) {
  if (!secretMatches(req.headers.get("x-telegram-bot-api-secret-token"))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let update: TgUpdate;
  try {
    update = (await req.json()) as TgUpdate;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  try {
    await handleUpdate(update);
  } catch (e) {
    // Always 200: a non-2xx makes Telegram re-deliver the update over and over.
    console.error("[telegram] update failed:", e);
  }
  return NextResponse.json({ ok: true });
}
