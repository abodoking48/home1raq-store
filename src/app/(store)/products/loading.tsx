/** Shown instantly while /products (incl. search results) renders on the server. */
export default function ProductsLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:px-8" aria-busy="true" aria-label="جاري التحميل">
      <div className="h-8 w-48 animate-pulse rounded-lg bg-white/10" />
      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} className="glass-panel overflow-hidden rounded-2xl">
            <div className="aspect-[4/5] animate-pulse bg-white/5" />
            <div className="space-y-2 p-3">
              <div className="h-4 w-3/4 animate-pulse rounded bg-white/10" />
              <div className="h-4 w-1/3 animate-pulse rounded bg-primary/20" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
