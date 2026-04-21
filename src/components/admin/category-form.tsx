"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export type CategoryFormValues = {
  name: string;
  iconUrl: string;
  description: string;
  sortOrder: string;
  active: boolean;
};

type Props = {
  mode: "create" | "edit";
  categoryId?: string;
  initial: CategoryFormValues;
};

export function CategoryForm({ mode, categoryId, initial }: Props) {
  const router = useRouter();
  const [values, setValues] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  async function uploadIcon(file: File | null) {
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: fd,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Upload failed");
      setValues((v) => ({ ...v, iconUrl: data.url }));
      toast.success("Icon uploaded");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function save() {
    setSaving(true);
    try {
      const sortOrder = Number(values.sortOrder);
      if (!Number.isInteger(sortOrder) || sortOrder < 0) {
        toast.error("Sort order must be a non-negative integer");
        return;
      }

      const payload = {
        name: values.name,
        iconUrl: values.iconUrl.trim(),
        description: values.description || "",
        sortOrder,
        active: values.active,
      };

      const url =
        mode === "create"
          ? "/api/admin/categories"
          : `/api/admin/categories/${categoryId}`;
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

      toast.success(mode === "create" ? "Category created" : "Category updated");
      router.push("/admin/categories");
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!categoryId) return;
    if (!confirm("Delete this category?")) return;

    const res = await fetch(`/api/admin/categories/${categoryId}`, {
      method: "DELETE",
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      toast.error(data.error ?? "Delete failed");
      return;
    }
    toast.success("Deleted");
    router.push("/admin/categories");
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
        <Label htmlFor="iconUpload">Upload icon from computer</Label>
        <Input
          id="iconUpload"
          type="file"
          accept="image/*"
          disabled={uploading}
          onChange={(e) => uploadIcon(e.target.files?.[0] ?? null)}
          className="border-white/10 bg-[#131313]/80 file:me-3 file:rounded-md file:border-0 file:bg-primary/20 file:px-3 file:py-1 file:text-foreground"
        />
        <p className="text-xs text-muted-foreground">
          Uploading uses the same admin storage configuration.
        </p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="iconUrl">Icon URL (optional)</Label>
        <Input
          id="iconUrl"
          type="url"
          dir="ltr"
          placeholder="https://example.com/icons/category.svg"
          value={values.iconUrl}
          onChange={(e) =>
            setValues((v) => ({ ...v, iconUrl: e.target.value }))
          }
          className="border-white/10 bg-[#131313]/80"
        />
        <p className="text-xs text-muted-foreground">
          You can paste any external icon link, or keep the uploaded URL.
        </p>
        {values.iconUrl.trim() && (
          // Use native img for unrestricted external URLs.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={values.iconUrl.trim()}
            alt="Icon preview"
            className="mt-2 size-12 rounded-lg border border-white/10 bg-black/20 object-contain p-1"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          rows={4}
          value={values.description}
          onChange={(e) =>
            setValues((v) => ({ ...v, description: e.target.value }))
          }
          className="border-white/10 bg-[#131313]/80"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="sortOrder">Sort order</Label>
        <Input
          id="sortOrder"
          inputMode="numeric"
          value={values.sortOrder}
          onChange={(e) =>
            setValues((v) => ({ ...v, sortOrder: e.target.value }))
          }
          className="border-white/10 bg-[#131313]/80"
        />
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
      <div className="flex flex-wrap gap-3">
        <Button
          type="button"
          disabled={saving}
          className={cn("btn-gradient-neon rounded-full px-8 font-semibold")}
          onClick={save}
        >
          {saving ? "Saving..." : mode === "create" ? "Create" : "Save changes"}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="rounded-full border-white/15"
          onClick={() => router.push("/admin/categories")}
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

