import Image from "next/image";
import { customerReviews } from "@/data/customer-reviews";

/** Real customer photos/testimonials from `src/data/customer-reviews.ts`; renders nothing when empty. */
export function CustomerReviews() {
  const reviews = customerReviews.filter((r) => r.photo || r.text?.trim());
  if (reviews.length === 0) return null;

  return (
    <section className="mx-auto mt-16 max-w-7xl px-4 md:px-8">
      <h2 className="font-heading text-2xl font-bold text-foreground">من زبائننا</h2>
      <div className="-mx-4 mt-6 flex snap-x gap-4 overflow-x-auto px-4 pb-2 md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0">
        {reviews.map((r, i) => (
          <figure
            key={`${r.name}-${i}`}
            className="glass-panel w-[78%] shrink-0 snap-start overflow-hidden rounded-2xl md:w-auto"
          >
            {r.photo && (
              <div className="relative aspect-square w-full bg-[#0a0c0b]">
                <Image
                  src={r.photo}
                  alt={r.product ? `${r.product} — ${r.name}` : r.name}
                  fill
                  sizes="(max-width: 767px) 78vw, 33vw"
                  className="object-cover"
                />
              </div>
            )}
            <figcaption className="space-y-2 p-4">
              {r.text && <p className="text-sm leading-relaxed text-foreground">«{r.text}»</p>}
              <p className="text-xs text-muted-foreground">
                {r.name}
                {r.product ? ` · ${r.product}` : ""}
              </p>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
