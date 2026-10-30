"use client";

import { Check, Share2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

/** Shares the short `/p/<id>` link: the phone's share sheet where available, else copy. */
export function ShareButton({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false);

  async function share() {
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch (e) {
        // Closing the share sheet is not an error.
        if (e instanceof DOMException && e.name === "AbortError") return;
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("انسخ الرابط، دزه لأي واحد");
      setTimeout(() => setCopied(false), 2500);
    } catch {
      window.prompt("انسخ الرابط:", url);
    }
  }

  return (
    <button
      type="button"
      onClick={share}
      className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-5 text-sm font-semibold text-foreground transition-colors hover:border-primary/40 hover:text-primary"
    >
      {copied ? <Check className="size-4 text-primary" aria-hidden /> : <Share2 className="size-4" aria-hidden />}
      {copied ? "انسخ الرابط" : "شارك المنتج"}
    </button>
  );
}
