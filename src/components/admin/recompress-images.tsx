"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type { ImageResult, RecompressBatch, RecompressCursor } from "@/lib/images/recompress";

const kb = (n: number) => `${Math.round(n / 1024).toLocaleString("en")} KB`;

const SKIP_LABEL: Record<NonNullable<ImageResult["skipped"]>, string> = {
  "not-ours": "رابط خارجي",
  "already-webp": "مضغوطة",
  "not-smaller": "صغيرة أصلاً",
  unreadable: "ما تنقرا",
  "download-failed": "ما نزلت",
};

export function RecompressImages() {
  const [running, setRunning] = useState<null | "dry" | "real">(null);
  const [results, setResults] = useState<ImageResult[]>([]);
  const [finished, setFinished] = useState<null | "dry" | "real">(null);

  async function run(dryRun: boolean) {
    if (!dryRun && !confirm("تضغط كل الصور القديمة هسه؟ الصور الأصلية تبقى بالتخزين.")) return;
    setRunning(dryRun ? "dry" : "real");
    setFinished(null);
    setResults([]);
    let cursor: RecompressCursor | null = null;
    try {
      do {
        const res = await fetch("/api/admin/images/recompress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ dryRun, cursor }),
        });
        const data = (await res.json().catch(() => ({}))) as Partial<RecompressBatch> & { error?: string };
        if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
        setResults((prev) => [...prev, ...(data.results ?? [])]);
        cursor = data.next ?? null;
      } while (cursor);
      setFinished(dryRun ? "dry" : "real");
    } catch (e) {
      toast.error(`توقف: ${e instanceof Error ? e.message : "خطأ"}. تگدر تعيد، الصور اللي انضغطت ما تنعاد.`);
    } finally {
      setRunning(null);
    }
  }

  const done = results.filter((r) => r.after != null && !r.skipped);
  const before = done.reduce((s, r) => s + r.before, 0);
  const after = done.reduce((s, r) => s + (r.after ?? 0), 0);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <Button variant="outline" disabled={running != null} onClick={() => run(true)}>
          {running === "dry" ? "جاري الفحص…" : "1. جرّب (بدون تغيير)"}
        </Button>
        <Button disabled={running != null} onClick={() => run(false)} className="btn-gradient-neon">
          {running === "real" ? "جاري الضغط…" : "2. اضغط الصور"}
        </Button>
      </div>

      {results.length > 0 && (
        <div className="glass-panel rounded-2xl p-4 text-sm">
          <p className="font-bold">
            {finished === "dry" ? "نتيجة التجربة: " : finished === "real" ? "خلص الضغط: " : "شغال… "}
            {done.length} صورة، من {kb(before)} إلى {kb(after)}
            {before > 0 && ` (توفير ${Math.round((1 - after / before) * 100)}%)`}
          </p>
          <ul className="mt-3 max-h-[50svh] space-y-1 overflow-y-auto text-xs text-muted-foreground">
            {results.map((r, i) => (
              <li key={`${r.url}-${i}`} className="flex justify-between gap-3">
                <span className="truncate">{r.label}</span>
                <span className="shrink-0 tabular-nums">
                  {r.skipped
                    ? `${SKIP_LABEL[r.skipped]}${r.before ? ` · ${kb(r.before)}` : ""}`
                    : `${kb(r.before)} → ${kb(r.after ?? 0)}`}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
