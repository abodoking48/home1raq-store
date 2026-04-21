"use client";

import type { LandingPageMode } from "@prisma/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type ProductOption = { id: string; name: string };

type Line = {
  id: string;
  displayOrder: number;
  titleOverride: string | null;
  customDescription: string | null;
  imagesOverride: string[];
  videoUrl: string | null;
  customPrice: string;
  customCompareAt: string;
  onPromoOverride: boolean | null;
  displayRating: number | null;
  product: { id: string; name: string; slug: string; active: boolean; price: number };
};

export type LandingPageEditorInitial = {
  id: string;
  slug: string;
  title: string;
  enabled: boolean;
  mode: LandingPageMode;
  defaultProductIndex: number;
  sliderAutoPlay: boolean;
  sliderAutoPlayIntervalSec: number;
  countdownHours: number;
  whatsappOverride: string | null;
  offerBadge: string;
  offerTitle: string;
  offerTitleAccent: string;
  offerSubtitle: string;
  benefitsJson: unknown;
  reviewsJson: unknown;
  products: Line[];
};

type ReadonlyLandingPageEditorProps = {
  readonly initial: LandingPageEditorInitial;
  readonly productOptions: ProductOption[];
};

export function LandingPageEditor({ initial, productOptions }: ReadonlyLandingPageEditorProps) {
  const router = useRouter();
  const [slug, setSlug] = useState(initial.slug);
  const [title, setTitle] = useState(initial.title);
  const [enabled, setEnabled] = useState(initial.enabled);
  const [mode, setMode] = useState<LandingPageMode>(initial.mode);
  const [defaultProductIndex, setDefaultProductIndex] = useState(
    String(initial.defaultProductIndex ?? 0),
  );
  const [sliderAutoPlay, setSliderAutoPlay] = useState(initial.sliderAutoPlay ?? false);
  const [sliderAutoPlayIntervalSec, setSliderAutoPlayIntervalSec] = useState(
    String(initial.sliderAutoPlayIntervalSec ?? 5),
  );
  const [countdownHours, setCountdownHours] = useState(String(initial.countdownHours));
  const [whatsappOverride, setWhatsappOverride] = useState(initial.whatsappOverride ?? "");
  const [offerBadge, setOfferBadge] = useState(initial.offerBadge);
  const [offerTitle, setOfferTitle] = useState(initial.offerTitle);
  const [offerTitleAccent, setOfferTitleAccent] = useState(initial.offerTitleAccent);
  const [offerSubtitle, setOfferSubtitle] = useState(initial.offerSubtitle);
  const [benefitsRaw, setBenefitsRaw] = useState(() =>
    JSON.stringify(initial.benefitsJson ?? [], null, 2),
  );
  const [reviewsRaw, setReviewsRaw] = useState(() =>
    JSON.stringify(initial.reviewsJson ?? [], null, 2),
  );
  const productsSyncKey = initial.products.map((p) => `${p.id}:${p.displayOrder}`).join("|");
  const [lines, setLines] = useState<Line[]>(
    () =>
      [...initial.products].sort((a, b) => a.displayOrder - b.displayOrder) as Line[],
  );
  const [addProductId, setAddProductId] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLines(
      [...initial.products].sort((a, b) => a.displayOrder - b.displayOrder) as Line[],
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps -- productsSyncKey fingerprints `initial.products` identity/order
  }, [initial.id, productsSyncKey]);

  const benefitsJson = useMemo(() => {
    try {
      return JSON.parse(benefitsRaw) as unknown;
    } catch {
      return null;
    }
  }, [benefitsRaw]);

  const reviewsJson = useMemo(() => {
    try {
      return JSON.parse(reviewsRaw) as unknown;
    } catch {
      return null;
    }
  }, [reviewsRaw]);

  async function saveCore() {
    if (benefitsJson === null) {
      toast.error("JSON المزايا غير صالح");
      return;
    }
    if (reviewsJson === null) {
      toast.error("JSON المراجعات غير صالح");
      return;
    }
    const hours = Number.parseInt(countdownHours, 10);
    if (!Number.isFinite(hours) || hours < 1 || hours > 168) {
      toast.error("مدة العدّاد يجب أن تكون بين 1 و 168 ساعة");
      return;
    }
    const defIdx = Number.parseInt(defaultProductIndex, 10);
    if (!Number.isFinite(defIdx) || defIdx < 0 || defIdx > 98) {
      toast.error("رقم المنتج الافتراضي غير صالح");
      return;
    }
    const slideSec = Number.parseInt(sliderAutoPlayIntervalSec, 10);
    if (!Number.isFinite(slideSec) || slideSec < 3 || slideSec > 10) {
      toast.error("مدة التمرير التلقائي: بين 3 و 10 ثوانٍ");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/landing-pages/${initial.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: slug.trim().toLowerCase(),
          title: title.trim(),
          enabled,
          mode,
          defaultProductIndex: defIdx,
          sliderAutoPlay,
          sliderAutoPlayIntervalSec: slideSec,
          countdownHours: hours,
          whatsappOverride: whatsappOverride.trim() || null,
          offerBadge,
          offerTitle,
          offerTitleAccent,
          offerSubtitle,
          benefitsJson,
          reviewsJson,
        }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        toast.error(data.error ?? "فشل الحفظ");
        return;
      }
      toast.success("تم حفظ الإعدادات");
      router.refresh();
    } catch {
      toast.error("خطأ في الشبكة");
    } finally {
      setSaving(false);
    }
  }

  async function addProduct() {
    if (!addProductId) {
      toast.error("اختر منتجاً");
      return;
    }
    try {
      const res = await fetch(`/api/admin/landing-pages/${initial.id}/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: addProductId }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        toast.error(data.error ?? "تعذر الإضافة");
        return;
      }
      toast.success("تمت إضافة المنتج");
      setAddProductId("");
      router.refresh();
    } catch {
      toast.error("خطأ في الشبكة");
    }
  }

  async function removeLine(lppId: string) {
    if (!confirm("إزالة هذا المنتج من الصفحة؟")) return;
    try {
      const res = await fetch(`/api/admin/landing-pages/${initial.id}/products/${lppId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        toast.error(data.error ?? "فشل الحذف");
        return;
      }
      setLines((prev) => prev.filter((l) => l.id !== lppId));
      toast.success("تمت الإزالة");
      router.refresh();
    } catch {
      toast.error("خطأ في الشبكة");
    }
  }

  async function saveLine(l: Line) {
    const parseOpt = (v: string) => {
      const t = v.trim();
      if (!t) return null;
      const n = Number.parseFloat(t.replace(/,/g, ""));
      return Number.isFinite(n) && n > 0 ? n : null;
    };
    try {
      const res = await fetch(`/api/admin/landing-pages/${initial.id}/products/${l.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titleOverride: l.titleOverride?.trim() || null,
          customDescription: l.customDescription?.trim() || null,
          imagesOverride: l.imagesOverride,
          videoUrl: l.videoUrl?.trim() || null,
          customPrice: parseOpt(l.customPrice ?? ""),
          customCompareAt: parseOpt(l.customCompareAt ?? ""),
          onPromoOverride: l.onPromoOverride,
          displayRating: l.displayRating,
        }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        toast.error(data.error ?? "فشل الحفظ");
        return;
      }
      toast.success("تم حفظ بيانات المنتج");
      router.refresh();
    } catch {
      toast.error("خطأ في الشبكة");
    }
  }

  async function moveLine(index: number, dir: -1 | 1) {
    const next = index + dir;
    if (next < 0 || next >= lines.length) return;
    const reordered = [...lines];
    [reordered[index], reordered[next]] = [reordered[next]!, reordered[index]!];
    try {
      await Promise.all(
        reordered.map((l, i) =>
          fetch(`/api/admin/landing-pages/${initial.id}/products/${l.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ displayOrder: i }),
          }),
        ),
      );
      setLines(reordered.map((l, i) => ({ ...l, displayOrder: i })));
      toast.success("تم ترتيب المنتجات");
      router.refresh();
    } catch {
      toast.error("خطأ في الشبكة");
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl">تعديل صفحة الهبوط</h1>
          <p className="text-sm text-muted-foreground">
            معاينة:{" "}
            <Link className="text-primary underline" href={`/landing/${slug}`} target="_blank">
              /landing/{slug}
            </Link>
          </p>
        </div>
        <Button type="button" onClick={() => void saveCore()} disabled={saving}>
          {saving ? "جاري الحفظ…" : "حفظ الإعدادات"}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>عام</CardTitle>
          <CardDescription>Slug، الوضع، والتفعيل</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="lp-slug">Slug (إنجليزي فقط)</Label>
            <Input
              id="lp-slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="font-mono"
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="lp-title">اسم داخلي (للإدارة)</Label>
            <Input id="lp-title" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="lp-mode">وضع العرض</Label>
            <select
              id="lp-mode"
              className="flex h-10 w-full rounded-md border border-white/15 bg-background px-3 text-sm"
              value={mode}
              onChange={(e) => setMode(e.target.value as LandingPageMode)}
            >
              <option value="SLIDER">سلايدر — عدة منتجات</option>
              <option value="SINGLE">منتج واحد — يُسمح بمنتج واحد فقط</option>
            </select>
          </div>
          {mode === "SLIDER" ? (
            <>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="lp-default-slide">المنتج الافتراضي (ترتيب العرض، يبدأ من 0)</Label>
                <Input
                  id="lp-default-slide"
                  value={defaultProductIndex}
                  onChange={(e) => setDefaultProductIndex(e.target.value)}
                  inputMode="numeric"
                  placeholder="0 = أول منتج"
                />
                <p className="text-xs text-muted-foreground">
                  عند وجود عدة منتجات، يُعرض هذا الرقم كشريحة أولى (يُقص تلقائياً إن تجاوز العدد).
                </p>
              </div>
              <div className="flex items-center gap-2 md:col-span-2">
                <input
                  id="lp-autoplay"
                  type="checkbox"
                  checked={sliderAutoPlay}
                  onChange={(e) => setSliderAutoPlay(e.target.checked)}
                />
                <Label htmlFor="lp-autoplay">تمرير تلقائي للسلايدر (وضع عدة منتجات)</Label>
              </div>
              <div className="space-y-2">
                <Label htmlFor="lp-slide-sec">ثوانٍ بين الشرائح (3–10)</Label>
                <Input
                  id="lp-slide-sec"
                  value={sliderAutoPlayIntervalSec}
                  onChange={(e) => setSliderAutoPlayIntervalSec(e.target.value)}
                  inputMode="numeric"
                  disabled={!sliderAutoPlay}
                />
              </div>
            </>
          ) : null}
          <div className="flex items-center gap-2">
            <input
              id="lp-en"
              type="checkbox"
              checked={enabled}
              onChange={(e) => setEnabled(e.target.checked)}
            />
            <Label htmlFor="lp-en">صفحة مفعّلة</Label>
          </div>
          <div className="space-y-2">
            <Label htmlFor="lp-hours">مدة العدّاد (ساعات)</Label>
            <Input
              id="lp-hours"
              value={countdownHours}
              onChange={(e) => setCountdownHours(e.target.value)}
              inputMode="numeric"
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="lp-wa">واتساب (أرقام فقط، اختياري)</Label>
            <Input
              id="lp-wa"
              value={whatsappOverride}
              onChange={(e) => setWhatsappOverride(e.target.value)}
              placeholder="يتجاوز الرقم الافتراضي من المتجر"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>المنتجات</CardTitle>
          <CardDescription>
            ترتيب السلايدر = ترتيب العرض. نفس المنتج يمكن أن يظهر بسعر ووصف مختلفين لكل حملة.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <select
              className="h-10 min-w-[200px] rounded-md border border-white/15 bg-background px-3 text-sm"
              value={addProductId}
              onChange={(e) => setAddProductId(e.target.value)}
            >
              <option value="">— اختر منتجاً —</option>
              {productOptions.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            <Button type="button" variant="secondary" onClick={() => void addProduct()}>
              إضافة للصفحة
            </Button>
          </div>

          {lines.length === 0 ? (
            <p className="text-sm text-muted-foreground">لا توجد منتجات بعد.</p>
          ) : (
            <ul className="space-y-6">
              {lines.map((l, index) => (
                <li key={l.id} className="rounded-xl border border-white/10 p-4">
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <p className="font-medium">{l.product.name}</p>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={index === 0}
                        onClick={() => void moveLine(index, -1)}
                      >
                        ↑
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={index === lines.length - 1}
                        onClick={() => void moveLine(index, 1)}
                      >
                        ↓
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        onClick={() => void removeLine(l.id)}
                      >
                        إزالة
                      </Button>
                    </div>
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>عنوان مخصص (اختياري)</Label>
                      <Input
                        value={l.titleOverride ?? ""}
                        onChange={(e) =>
                          setLines((prev) =>
                            prev.map((x) =>
                              x.id === l.id ? { ...x, titleOverride: e.target.value || null } : x,
                            ),
                          )
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>سعر مخصص (IQD، اختياري)</Label>
                      <Input
                        value={l.customPrice}
                        onChange={(e) =>
                          setLines((prev) =>
                            prev.map((x) =>
                              x.id === l.id ? { ...x, customPrice: e.target.value } : x,
                            ),
                          )
                        }
                        placeholder="فارغ = سعر المنتج الأصلي"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>سعر قبل الخصم (اختياري)</Label>
                      <Input
                        value={l.customCompareAt}
                        onChange={(e) =>
                          setLines((prev) =>
                            prev.map((x) =>
                              x.id === l.id ? { ...x, customCompareAt: e.target.value } : x,
                            ),
                          )
                        }
                      />
                    </div>
                    <div className="flex items-end gap-2 pb-2">
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={l.onPromoOverride ?? false}
                          onChange={(e) =>
                            setLines((prev) =>
                              prev.map((x) =>
                                x.id === l.id
                                  ? { ...x, onPromoOverride: e.target.checked }
                                  : x,
                              ),
                            )
                          }
                        />
                        إظهار badge عرض
                      </label>
                    </div>
                    <div className="space-y-2">
                      <Label>تقييم العرض (نجوم، اختياري)</Label>
                      <select
                        className="flex h-10 w-full rounded-md border border-white/15 bg-background px-3 text-sm"
                        value={l.displayRating ?? ""}
                        onChange={(e) => {
                          const v = e.target.value;
                          setLines((prev) =>
                            prev.map((x) =>
                              x.id === l.id
                                ? {
                                    ...x,
                                    displayRating:
                                      v === ""
                                        ? null
                                        : Math.min(5, Math.max(1, Number.parseInt(v, 10) || 1)),
                                  }
                                : x,
                            ),
                          );
                        }}
                      >
                        <option value="">— بدون —</option>
                        {[1, 2, 3, 4, 5].map((n) => (
                          <option key={n} value={n}>
                            {n} / 5
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label>وصف مخصص (اختياري)</Label>
                      <Textarea
                        value={l.customDescription ?? ""}
                        onChange={(e) =>
                          setLines((prev) =>
                            prev.map((x) =>
                              x.id === l.id
                                ? { ...x, customDescription: e.target.value || null }
                                : x,
                            ),
                          )
                        }
                        rows={3}
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label>روابط صور إضافية (سطر لكل رابط، اختياري)</Label>
                      <Textarea
                        value={l.imagesOverride.join("\n")}
                        onChange={(e) =>
                          setLines((prev) =>
                            prev.map((x) =>
                              x.id === l.id
                                ? {
                                    ...x,
                                    imagesOverride: e.target.value
                                      .split("\n")
                                      .map((s) => s.trim())
                                      .filter(Boolean),
                                  }
                                : x,
                            ),
                          )
                        }
                        rows={3}
                        placeholder="https://..."
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label>رابط فيديو (اختياري)</Label>
                      <Input
                        value={l.videoUrl ?? ""}
                        onChange={(e) =>
                          setLines((prev) =>
                            prev.map((x) =>
                              x.id === l.id ? { ...x, videoUrl: e.target.value || null } : x,
                            ),
                          )
                        }
                        placeholder="https://example.com/video.mp4"
                      />
                    </div>
                  </div>
                  <Button
                    type="button"
                    className="mt-3"
                    variant="secondary"
                    size="sm"
                    onClick={() => void saveLine(l)}
                  >
                    حفظ هذا المنتج
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>المحتوى — مزايا ومراجعات (JSON)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>المزايا</Label>
            <Textarea
              value={benefitsRaw}
              onChange={(e) => setBenefitsRaw(e.target.value)}
              rows={8}
              className="font-mono text-xs"
            />
          </div>
          <div className="space-y-2">
            <Label>المراجعات</Label>
            <Textarea
              value={reviewsRaw}
              onChange={(e) => setReviewsRaw(e.target.value)}
              rows={8}
              className="font-mono text-xs"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>نصوص العرض</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3">
          <div className="space-y-2">
            <Label>شارة العرض</Label>
            <Input value={offerBadge} onChange={(e) => setOfferBadge(e.target.value)} />
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-2">
              <Label>عنوان العرض</Label>
              <Input value={offerTitle} onChange={(e) => setOfferTitle(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>تمييز العنوان</Label>
              <Input
                value={offerTitleAccent}
                onChange={(e) => setOfferTitleAccent(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>وصف العرض</Label>
            <Textarea value={offerSubtitle} onChange={(e) => setOfferSubtitle(e.target.value)} rows={3} />
          </div>
        </CardContent>
      </Card>

      <Button type="button" onClick={() => void saveCore()} disabled={saving} className="w-full md:w-auto">
        {saving ? "جاري الحفظ…" : "حفظ كل الإعدادات"}
      </Button>
      <p className="text-xs text-muted-foreground">
        معاينة:{" "}
        <Link href={`/landing/${slug}`} className="text-primary underline" target="_blank">
          /landing/{slug}
        </Link>
      </p>
    </div>
  );
}
