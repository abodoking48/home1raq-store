export function LandingPageSkeleton() {
  return (
    <section className="mx-auto max-w-2xl px-4 pb-6 pt-2 md:px-8 md:pb-8">
      <div className="animate-pulse space-y-4 rounded-md">
        <div className="h-[60vw] max-h-[420px] w-full rounded-md bg-gray-200" />
        <div className="space-y-2">
          <div className="h-7 w-3/4 rounded-md bg-gray-200" />
          <div className="h-7 w-1/2 rounded-md bg-gray-200" />
        </div>
        <div className="h-10 w-40 rounded-md bg-gray-200" />
        <div className="h-12 w-full rounded-md bg-gray-200" />
      </div>
    </section>
  );
}
