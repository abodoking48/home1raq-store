import { RecompressImages } from "@/components/admin/recompress-images";

export const dynamic = "force-dynamic";

export default function AdminImagesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl">Image compression</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          الصور الجديدة تنضغط تلقائياً. هذي الصفحة تضغط الصور القديمة مرة وحدة: جرّب أول، وبعدين اضغط.
          الصور الأصلية تبقى بالتخزين وما تنمسح.
        </p>
      </div>
      <RecompressImages />
    </div>
  );
}
