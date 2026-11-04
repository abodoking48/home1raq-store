import { Home } from "lucide-react";

/** Placeholder block with the neon sweep (`.h1q-shimmer` in globals.css). */
function Bone({ className }: { className: string }) {
  return <div className={`h1q-shimmer ${className}`} />;
}

/**
 * Instant feedback on a tap: the product page's layout (gallery, title, price, buttons) as
 * shimmering glass blocks, with the brand tile pulsing in the photo area.
 */
export function ProductPageSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-16" aria-busy="true" aria-label="جاري التحميل">
      <Bone className="mb-6 h-3 w-40 rounded" />
      <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
        <div className="glass-panel overflow-hidden rounded-3xl p-3 sm:p-4">
          <div className="h1q-shimmer relative aspect-[4/5] w-full rounded-2xl">
            <div className="absolute inset-0 grid place-items-center">
              <div className="flex size-16 animate-pulse items-center justify-center rounded-2xl border border-primary/30 bg-primary/10 shadow-[0_0_30px_rgba(0,255,136,0.15)]">
                <Home className="size-7 text-primary" aria-hidden />
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-6">
          <div className="space-y-3">
            <Bone className="h-3 w-24 rounded" />
            <Bone className="h-9 w-4/5 rounded-lg" />
            <Bone className="h-9 w-2/5 rounded-lg !bg-primary/15" />
            <Bone className="h-7 w-56 rounded-full !bg-primary/10" />
          </div>
          <div className="space-y-2">
            <Bone className="h-4 w-full rounded" />
            <Bone className="h-4 w-11/12 rounded" />
            <Bone className="h-4 w-3/4 rounded" />
          </div>
          <Bone className="h-14 w-full rounded-xl !bg-primary/15" />
          <Bone className="h-14 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}
