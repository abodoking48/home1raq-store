"use client";

import { useCallback, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  trackInitiateCheckout,
  trackPurchase,
} from "@/lib/ads";
import type { LandingProductPayload } from "@/lib/landing-settings";
import { formatIqd } from "@/lib/currency";

type ReadonlyLandingOrderFormProps = {
  readonly product: LandingProductPayload;
  readonly quantity: number;
  readonly landingPageProductId: string | null;
};

export function LandingOrderForm({
  product,
  quantity,
  landingPageProductId,
}: ReadonlyLandingOrderFormProps) {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const checkoutTracked = useRef(false);

  const handleFocus = useCallback(() => {
    if (checkoutTracked.current) return;
    checkoutTracked.current = true;
    trackInitiateCheckout({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity,
    });
  }, [product.id, product.name, product.price, quantity]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    handleFocus();
    setLoading(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: fullName.trim(),
          phone: phone.trim(),
          address: address.trim(),
          city: city.trim(),
          notes: notes.trim() || null,
          items: [
            {
              productId: product.id,
              quantity,
              ...(landingPageProductId
                ? { landingPageProductId }
                : {}),
            },
          ],
        }),
      });
      const data = (await res.json()) as {
        id?: string;
        error?: string;
        message?: string;
      };
      if (!res.ok) {
        toast.error(data.message ?? data.error ?? "تعذر إرسال الطلب");
        return;
      }
      const total = product.price * quantity;
      trackPurchase({
        id: data.id ?? "",
        value: total,
        productId: product.id,
        productName: product.name,
        quantity,
      });
      toast.success("تم استلام طلبك — سنتواصل معك قريباً");
      setFullName("");
      setPhone("");
      setAddress("");
      setCity("");
      setNotes("");
    } catch {
      toast.error("خطأ في الشبكة");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section id="order-form" className="scroll-mt-28 px-4 py-12 md:px-8">
      <Card className="glass-panel mx-auto max-w-lg border-white/10 ring-1 ring-white/10">
        <CardHeader>
          <CardTitle className="font-heading text-xl md:text-2xl">اطلب الآن — بدون تسجيل</CardTitle>
          <p className="text-sm text-muted-foreground">
            أدخل بيانات التوصيل وسنجهّز طلبك بسرعة. الدفع عند الاستلام.
          </p>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={onSubmit}>
            <div className="space-y-2">
              <Label htmlFor="lp-name">الاسم الكامل</Label>
              <Input
                id="lp-name"
                required
                minLength={2}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                onFocus={handleFocus}
                className="h-11 rounded-xl"
                placeholder="مثال: أحمد محمد"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lp-phone">رقم الهاتف</Label>
              <Input
                id="lp-phone"
                required
                minLength={6}
                inputMode="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                onFocus={handleFocus}
                className="h-11 rounded-xl"
                placeholder="07XXXXXXXXX"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lp-city">المحافظة / المدينة</Label>
              <Input
                id="lp-city"
                required
                minLength={2}
                value={city}
                onChange={(e) => setCity(e.target.value)}
                onFocus={handleFocus}
                className="h-11 rounded-xl"
                placeholder="بغداد، البصرة..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lp-address">العنوان التفصيلي</Label>
              <Textarea
                id="lp-address"
                required
                minLength={4}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                onFocus={handleFocus}
                className="min-h-[88px] rounded-xl"
                placeholder="الحي، أقرب نقطة دالة، رقم المنزل..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lp-notes">ملاحظات (اختياري)</Label>
              <Textarea
                id="lp-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                onFocus={handleFocus}
                className="min-h-[72px] rounded-xl"
                placeholder="لون، وقت التوصيل المفضل..."
              />
            </div>

            <div className="flex items-center justify-between rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm">
              <span className="text-muted-foreground">الإجمالي ({quantity} قطعة)</span>
              <span className="font-heading text-lg font-bold text-primary">
                {formatIqd(product.price * quantity)}
              </span>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="h-12 w-full rounded-2xl text-base font-bold"
            >
              {loading ? (
                <>
                  <Loader2 className="size-5 animate-spin" />
                  جاري الإرسال...
                </>
              ) : (
                "تأكيد الطلب"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}
