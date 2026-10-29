import type { Metadata } from "next";
import { ContactCard } from "@/components/layout/contact-card";
import { RETURNS } from "@/lib/store-info";
import { siteCopy } from "@/lib/stitch-copy";

export const metadata: Metadata = {
  title: `الاستبدال والإرجاع | ${siteCopy.brand.name}`,
  description: "سياسة الاستبدال والإرجاع في Home1raq وطريقة التواصل معنا.",
  alternates: { canonical: "/returns" },
};

export default function ReturnsPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-10 md:px-8 md:py-16">
      <h1 className="font-heading text-4xl font-bold tracking-tight text-foreground md:text-5xl">
        الاستبدال والإرجاع
      </h1>
      <div className="glass-panel space-y-4 rounded-2xl p-6 text-lg leading-relaxed text-muted-foreground">
        {RETURNS.policy ? (
          <ul className="list-disc space-y-2 ps-5">
            {RETURNS.policy.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        ) : (
          // TODO(owner): replace with the real policy via RETURNS.policy in src/lib/store-info.ts.
          <p>للاستفسار عن استبدال أو إرجاع أي منتج، تواصل معنا على واتساب وفريقنا يجاوبك.</p>
        )}
      </div>
      <ContactCard />
    </div>
  );
}
