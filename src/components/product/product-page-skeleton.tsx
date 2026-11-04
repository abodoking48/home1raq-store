/** Instant feedback on a tap: the product page's layout (gallery, title, price, buttons) as placeholders. */
export function ProductPageSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-16" aria-busy="true" aria-label="جاري التحميل">
      <div className="mb-6 h-3 w-40 animate-pulse rounded bg-white/10" />
      <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
        <div className="glass-panel overflow-hidden rounded-3xl p-3 sm:p-4">
          <div className="aspect-[4/5] w-full animate-pulse rounded-2xl bg-white/5" />
        </div>
        <div className="flex flex-col gap-6">
          <div className="space-y-3">
            <div className="h-3 w-24 animate-pulse rounded bg-white/10" />
            <div className="h-9 w-4/5 animate-pulse rounded-lg bg-white/10" />
            <div className="h-9 w-2/5 animate-pulse rounded-lg bg-primary/20" />
            <div className="h-7 w-56 animate-pulse rounded-full bg-primary/10" />
          </div>
          <div className="space-y-2">
            <div className="h-4 w-full animate-pulse rounded bg-white/5" />
            <div className="h-4 w-11/12 animate-pulse rounded bg-white/5" />
            <div className="h-4 w-3/4 animate-pulse rounded bg-white/5" />
          </div>
          <div className="h-14 w-full animate-pulse rounded-xl bg-primary/20" />
          <div className="h-14 w-full animate-pulse rounded-xl bg-white/5" />
        </div>
      </div>
    </div>
  );
}
