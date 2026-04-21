"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function suggestSlug() {
  return `offer-${Date.now().toString(36)}`;
}

export default function NewLandingPage() {
  const router = useRouter();
  const [slug, setSlug] = useState(() => suggestSlug());
  const [title, setTitle] = useState("");
  const [mode, setMode] = useState<"SLIDER" | "SINGLE">("SLIDER");
  const [loading, setLoading] = useState(false);
  const submitLock = useRef(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitLock.current) return;
    const s = slug.trim().toLowerCase();
    if (s.length < 2) {
      toast.error("Slug: حرفان على الأقل (مثل my-offer)");
      return;
    }
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(s)) {
      toast.error("Slug: أحرف إنجليزية صغيرة وأرقام وشرطة فقط");
      return;
    }
    submitLock.current = true;
    setLoading(true);
    try {
      const res = await fetch("/api/admin/landing-pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: s,
          title: title.trim() || undefined,
          enabled: true,
          mode,
        }),
      });
      const data = (await res.json()) as {
        landingPage?: { id: string };
        error?: string;
        issues?: { fieldErrors?: Record<string, string[]> };
      };
      if (!res.ok) {
        if (res.status === 409) {
          toast.error("هذا الرابط (slug) مستخدم — اختر اسماً آخر");
          return;
        }
        const fieldMsg = data.issues?.fieldErrors?.slug?.[0];
        toast.error(
          fieldMsg
            ? `Slug: ${fieldMsg}`
            : data.error === "Validation failed"
              ? "تحقق من الحقول (Slug إنجليزي صغير، حرفان على الأقل)"
              : (data.error ?? "تعذر الإنشاء"),
        );
        return;
      }
      if (data.landingPage) {
        router.push(`/admin/landing/${data.landingPage.id}/edit`);
        router.refresh();
      }
    } catch {
      toast.error("خطأ في الشبكة");
    } finally {
      setLoading(false);
      submitLock.current = false;
    }
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <Link href="/admin/landing" className="text-sm text-muted-foreground hover:text-foreground">
        ← رجوع
      </Link>
      <Card>
        <CardHeader>
          <CardTitle>صفحة هبوط جديدة</CardTitle>
          <CardDescription>
            الرابط العام: <code className="rounded bg-white/5 px-1">/landing/[slug]</code> — يُولَّد
            slug فريد افتراضياً؛ يمكنك استبداله (حرفان إنجليزي على الأقل، مثل{" "}
            <code className="rounded bg-white/5 px-1">my-offer</code>).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={onSubmit}>
            <div className="space-y-2">
              <Label htmlFor="nslug">Slug</Label>
              <Input
                id="nslug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="font-mono"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ntitle">اسم داخلي (اختياري)</Label>
              <Input
                id="ntitle"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="حملة أبريل"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nmode">الوضع</Label>
              <select
                id="nmode"
                className="flex h-10 w-full rounded-md border border-white/15 bg-background px-3 text-sm"
                value={mode}
                onChange={(e) => setMode(e.target.value as "SLIDER" | "SINGLE")}
              >
                <option value="SLIDER">سلايدر — عدة منتجات</option>
                <option value="SINGLE">منتج واحد فقط</option>
              </select>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "جاري الإنشاء…" : "إنشاء"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
