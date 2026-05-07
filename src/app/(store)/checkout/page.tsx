"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCart } from "@/contexts/cart-context";
import { formatIqd } from "@/lib/currency";
import { siteCopy } from "@/lib/stitch-copy";
import { cn } from "@/lib/utils";

export default function CheckoutPage() {
  const router = useRouter();
  const { lines, subtotal, clear } = useCart();
  const q = siteCopy.checkout;
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ phone?: string; fullName?: string }>({});
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    city: "",
    district: "",
    address: "",
    notes: "",
  });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const phone = form.phone.trim();
    const fullName = form.fullName.trim();
    const nextErrors: { phone?: string; fullName?: string } = {};
    if (fullName.length < 2) nextErrors.fullName = "الاسم يجب أن يكون حرفين على الأقل";
    if (!/^(\+?964|0)?7\d{9}$/.test(phone.replace(/\s+/g, ""))) {
      nextErrors.phone = "رقم الهاتف غير صالح (مثال: 07XXXXXXXX)";
    }
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }
    setErrors({});

    if (lines.length === 0) {
      toast.error("السلة فارغة");
      return;
    }
    const addressParts = [form.district.trim(), form.address.trim()].filter(
      Boolean,
    );
    const composedAddress =
      addressParts.length > 0 ? addressParts.join(" — ") : form.address.trim();

    setLoading(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          phone,
          city: form.city,
          address: composedAddress,
          notes: form.notes || undefined,
          items: lines.map((l) => ({
            productId: l.productId,
            quantity: l.quantity,
          })),
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        message?: string;
      };
      if (!res.ok) {
        toast.error(data.message ?? data.error ?? "تعذر إرسال الطلب");
        return;
      }
      clear();
      toast.success(q.successToast);
      router.push("/products");
    } catch {
      toast.error("خطأ في الشبكة");
    } finally {
      setLoading(false);
    }
  }

  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center md:px-6">
        <p className="text-muted-foreground">لا يوجد شيء للدفع حالياً.</p>
        <Link
          href="/cart"
          className={cn(
            buttonVariants({ variant: "outline" }),
            "mt-6 inline-flex rounded-full border-white/15",
          )}
        >
          العودة للسلة
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-16">
      <h1 className="font-heading text-4xl font-bold tracking-tight text-foreground md:text-6xl">
        {q.title}{" "}
        <span className="text-primary">{q.titleAccent}</span>
      </h1>
      <p className="mt-4 max-w-2xl text-lg text-muted-foreground">{q.subtitle}</p>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_380px]">
        <form
          onSubmit={onSubmit}
          className="glass-panel space-y-6 rounded-2xl p-6 md:p-8"
        >
          <h2 className="text-2xl font-bold tracking-wide text-foreground">
            {q.formTitle}
          </h2>

          <div className="grid gap-2">
            <Label htmlFor="fullName">{q.fullName}</Label>
            <Input
              id="fullName"
              required
              placeholder={q.fullNamePlaceholder}
              value={form.fullName}
              onChange={(e) =>
                setForm((f) => ({ ...f, fullName: e.target.value }))
              }
              className="rounded-xl border-0 bg-white/5 py-4 ring-1 ring-white/10 focus-visible:ring-primary/40"
            />
            {errors.fullName && (
              <p className="text-xs text-destructive">{errors.fullName}</p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="phone">{q.phone}</Label>
            <Input
              id="phone"
              required
              inputMode="tel"
              dir="ltr"
              placeholder={q.phonePlaceholder}
              value={form.phone}
              onChange={(e) =>
                setForm((f) => ({ ...f, phone: e.target.value }))
              }
              className="rounded-xl border-0 bg-white/5 py-4 ring-1 ring-white/10 focus-visible:ring-primary/40"
            />
            {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="city">{q.city}</Label>
            <Input
              id="city"
              required
              value={form.city}
              onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
              className="rounded-xl border-0 bg-white/5 py-4 ring-1 ring-white/10 focus-visible:ring-primary/40"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="district">{q.district}</Label>
            <Input
              id="district"
              placeholder={q.districtPlaceholder}
              value={form.district}
              onChange={(e) =>
                setForm((f) => ({ ...f, district: e.target.value }))
              }
              className="rounded-xl border-0 bg-white/5 py-4 ring-1 ring-white/10 focus-visible:ring-primary/40"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="address">{q.address}</Label>
            <Textarea
              id="address"
              required
              rows={3}
              placeholder={q.addressPlaceholder}
              value={form.address}
              onChange={(e) =>
                setForm((f) => ({ ...f, address: e.target.value }))
              }
              className="rounded-xl border-0 bg-white/5 py-4 ring-1 ring-white/10 focus-visible:ring-primary/40"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="notes">{q.notes}</Label>
            <Textarea
              id="notes"
              rows={2}
              value={form.notes}
              onChange={(e) =>
                setForm((f) => ({ ...f, notes: e.target.value }))
              }
              className="rounded-xl border-0 bg-white/5 py-4 ring-1 ring-white/10 focus-visible:ring-primary/40"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className={cn(
              buttonVariants(),
              "btn-gradient-neon w-full rounded-2xl py-6 text-base font-bold",
            )}
          >
            {loading ? q.submitting : q.submit}
          </button>
        </form>

        <aside className="glass-panel h-fit rounded-2xl p-6">
          <h2 className="text-2xl font-black text-foreground">{q.asideTitle}</h2>
          <ul className="mt-4 space-y-3 text-sm">
            {lines.map((l) => (
              <li
                key={l.productId}
                className="flex justify-between gap-4 text-muted-foreground"
              >
                <span className="truncate">
                  {l.name} × {l.quantity}
                </span>
                <span className="shrink-0 tabular-nums text-foreground">
                  {formatIqd(l.price * l.quantity)}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-6 border-t border-white/10 pt-4">
            <div className="flex justify-between font-heading text-xl text-primary">
              <span className="flex items-center gap-2">
                <span>الإجمالي</span>
                <span className="text-sm font-semibold text-emerald-400">
                  توصيل مجاني 🚚
                </span>
              </span>
              <span>{formatIqd(subtotal)}</span>
            </div>
            <p className="mt-1 text-[10px] text-muted-foreground">
              {siteCopy.cart.vatNote}
            </p>
          </div>
          <div className="mt-5 grid gap-3 text-xs text-muted-foreground">
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
              طلبك مشفر وآمن بالكامل.
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
              فريقنا يتواصل معك خلال دقائق لتأكيد التفاصيل.
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
              إمكانية الدفع عند الاستلام متاحة.
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
