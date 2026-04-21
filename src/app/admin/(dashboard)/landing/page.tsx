import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminLandingManager() {
  const rows = await prisma.landingPage.findMany({
    orderBy: { updatedAt: "desc" },
    include: { _count: { select: { products: true } } },
  });

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl">Landing Page Manager</h1>
          <p className="text-sm text-muted-foreground">
            روابط عامة:{" "}
            <code className="rounded bg-white/5 px-1.5 py-0.5 text-xs">/landing/[slug]</code> — منتج
            واحد أو سلايدر متعدد حسب الوضع.
          </p>
        </div>
        <Link href="/admin/landing/new" className={cn(buttonVariants(), "rounded-xl")}>
          صفحة جديدة
        </Link>
      </div>

      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="bg-white/[0.04] text-left">
            <tr>
              <th className="p-3 font-medium">Slug</th>
              <th className="p-3 font-medium">الاسم</th>
              <th className="p-3 font-medium">الوضع</th>
              <th className="p-3 font-medium">الحالة</th>
              <th className="p-3 font-medium">المنتجات</th>
              <th className="p-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-white/10">
                <td className="p-3 font-mono text-xs text-primary">{r.slug}</td>
                <td className="p-3">{r.title || "—"}</td>
                <td className="p-3">{r.mode === "SINGLE" ? "منتج واحد" : "سلايدر"}</td>
                <td className="p-3">{r.enabled ? "مفعّل" : "معطّل"}</td>
                <td className="p-3">{r._count.products}</td>
                <td className="p-3 text-end">
                  <Link
                    href={`/admin/landing/${r.id}/edit`}
                    className="text-primary underline underline-offset-4"
                  >
                    تعديل
                  </Link>
                  {" · "}
                  <Link
                    href={`/landing/${r.slug}`}
                    className="text-muted-foreground underline underline-offset-4"
                    target="_blank"
                    rel="noreferrer"
                  >
                    معاينة
                  </Link>
                </td>
              </tr>
            ))}
            {rows.length === 0 ? (
              <tr>
                <td className="p-6 text-center text-muted-foreground" colSpan={6}>
                  لا توجد صفحات بعد — أنشئ صفحة باسم slug مثل <code className="text-primary">home</code>{" "}
                  لاستخدام <code className="text-primary">/landing/home</code>.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
