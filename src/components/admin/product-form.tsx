"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export type ProductFormValues = {
  name: string;
  description: string;
  price: string;
  /** سعر قبل الخصم (اختياري) — يُعرض مشطوباً في المتجر */
  compareAtPrice: string;
  /** يظهر في صفحة العروض عند التفعيل */
  onPromo: boolean;
  images: string[];
  active: boolean;
  categoryId: string;
};

type Props = {
  mode: "create" | "edit";
  productId?: string;
  initial: ProductFormValues;
  categories: Array<{ id: string; name: string; active: boolean }>;
};

export function ProductForm({ mode, productId, initial, categories }: Props) {
  const router = useRouter();
  const [values, setValues] = useState<ProductFormValues>(initial);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  async function uploadFiles(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    try {
      const urls: string[] = [];
      for (const file of Array.from(files)) {
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch("/api/admin/upload", {
          method: "POST",
          body: fd,
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error ?? "Upload failed");
        urls.push(data.url);
      }
      setValues((v) => ({ ...v, images: [...v.images, ...urls] }));
      toast.success("Images uploaded");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function save() {
    setSaving(true);
    try {
      const price = Number(values.price);
      if (Number.isNaN(price) || price <= 0) {
        toast.error("Invalid price");
        setSaving(false);
        return;
      }
      const compareRaw = values.compareAtPrice.trim();
      let compareAtPrice: number | null = null;
      if (compareRaw !== "") {
        const c = Number(compareRaw);
        if (Number.isNaN(c) || c <= 0) {
          toast.error("Invalid compare-at price");
          setSaving(false);
          return;
        }
        if (c <= price) {
          toast.error("Compare-at price should be higher than sale price");
          setSaving(false);
          return;
        }
        compareAtPrice = c;
      }
      const payload = {
        name: values.name,
        description: values.description,
        price,
        compareAtPrice,
        onPromo: values.onPromo,
        images: values.images,
        active: values.active,
        categoryId: values.categoryId || null,
      };
      const url =
        mode === "create"
          ? "/api/admin/products"
          : `/api/admin/products/${productId}`;
      const res = await fetch(url, {
        method: mode === "create" ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.error ?? "Save failed");
        return;
      }
      toast.success(mode === "create" ? "Product created" : "Product updated");
      router.push("/admin/products");
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!productId) return;
    if (!confirm("حذف هذا المنتج نهائياً؟")) return;
    const res = await fetch(`/api/admin/products/${productId}`, {
      method: "DELETE",
    });
    const data = (await res.json().catch(() => ({}))) as {
      error?: string;
      message?: string;
    };
    if (!res.ok) {
      toast.error(data.message ?? data.error ?? "تعذر الحذف");
      return;
    }
    toast.success("تم الحذف");
    router.push("/admin/products");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          value={values.name}
          onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
          className="border-white/10 bg-[#131313]/80"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          rows={6}
          value={values.description}
          onChange={(e) =>
            setValues((v) => ({ ...v, description: e.target.value }))
          }
          className="border-white/10 bg-[#131313]/80"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="price">Price (IQD)</Label>
        <Input
          id="price"
          inputMode="decimal"
          value={values.price}
          onChange={(e) => setValues((v) => ({ ...v, price: e.target.value }))}
          className="border-white/10 bg-[#131313]/80"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="compareAtPrice">Compare-at price (IQD, optional)</Label>
        <Input
          id="compareAtPrice"
          inputMode="decimal"
          placeholder="Higher than sale price for strikethrough"
          value={values.compareAtPrice}
          onChange={(e) =>
            setValues((v) => ({ ...v, compareAtPrice: e.target.value }))
          }
          className="border-white/10 bg-[#131313]/80"
        />
      </div>
      <div className="flex items-center gap-2">
        <input
          id="onPromo"
          type="checkbox"
          checked={values.onPromo}
          onChange={(e) =>
            setValues((v) => ({ ...v, onPromo: e.target.checked }))
          }
          className="size-4 accent-[#a4ffb9]"
        />
        <Label htmlFor="onPromo">Include in offers (/products?promo=1)</Label>
      </div>
      <div className="flex items-center gap-2">
        <input
          id="active"
          type="checkbox"
          checked={values.active}
          onChange={(e) =>
            setValues((v) => ({ ...v, active: e.target.checked }))
          }
          className="size-4 accent-[#a4ffb9]"
        />
        <Label htmlFor="active">Visible on storefront</Label>
      </div>
      <div className="space-y-2">
        <Label htmlFor="category">Category</Label>
        <select
          id="category"
          value={values.categoryId}
          onChange={(e) =>
            setValues((v) => ({ ...v, categoryId: e.target.value }))
          }
          className="flex h-10 w-full rounded-md border border-white/10 bg-[#131313]/80 px-3 text-sm"
        >
          <option value="">Uncategorized</option>
          {categories.map((category) => (
            <option
              key={category.id}
              value={category.id}
              disabled={!category.active && values.categoryId !== category.id}
            >
              {category.name}
              {!category.active ? " (hidden)" : ""}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <Label>Images</Label>
        <div className="flex flex-wrap gap-2">
          {values.images.map((u, i) => (
            <div
              key={u + i}
              className="flex items-center gap-2 rounded-lg border border-white/10 bg-black/30 px-2 py-1 text-xs"
            >
              <span className="max-w-[200px] truncate">{u}</span>
              <button
                type="button"
                className="text-destructive"
                onClick={() =>
                  setValues((v) => ({
                    ...v,
                    images: v.images.filter((_, j) => j !== i),
                  }))
                }
              >
                ×
              </button>
            </div>
          ))}
        </div>
        <input
          type="file"
          accept="image/*"
          multiple
          className="text-sm"
          disabled={uploading}
          onChange={(e) => uploadFiles(e.target.files)}
        />
        <p className="text-xs text-muted-foreground">
          Needs a <strong>public</strong> Storage bucket{" "}
          <code className="rounded bg-white/5 px-1">products</code> and{" "}
          <code className="rounded bg-white/5 px-1">SUPABASE_SERVICE_ROLE_KEY</code>{" "}
          in <code className="rounded bg-white/5 px-1">.env.local</code> (Supabase
          → Settings → API → <em>service_role</em>, server-only).
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button
          type="button"
          disabled={saving}
          className={cn("btn-gradient-neon rounded-full px-8 font-semibold")}
          onClick={save}
        >
          {saving ? "Saving…" : mode === "create" ? "Create" : "Save changes"}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="rounded-full border-white/15"
          onClick={() => router.push("/admin/products")}
        >
          Cancel
        </Button>
        {mode === "edit" && (
          <Button
            type="button"
            variant="destructive"
            className="rounded-full"
            onClick={remove}
          >
            Delete
          </Button>
        )}
      </div>
    </div>
  );
}
