"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

type Props = {
  id: string;
  label: string;
};

export function LandingPageDeleteButton({ id, label }: Props) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function onDelete() {
    if (!confirm(`حذف صفحة الهبوط «${label}» نهائياً؟ سُيحذف كل المنتجات المرتبطة بها من هذه الصفحة.`)) {
      return;
    }
    setPending(true);
    try {
      const res = await fetch(`/api/admin/landing-pages/${id}`, { method: "DELETE" });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        message?: string;
      };
      if (!res.ok) {
        toast.error(data.message ?? data.error ?? "تعذر الحذف");
        return;
      }
      toast.success("تم حذف صفحة الهبوط");
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="h-auto px-2 py-1 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
      disabled={pending}
      onClick={onDelete}
    >
      {pending ? "جاري الحذف…" : "حذف"}
    </Button>
  );
}
