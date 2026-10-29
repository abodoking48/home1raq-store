import type { Metadata } from "next";
import { ContactCard } from "@/components/layout/contact-card";
import { DELIVERY } from "@/lib/store-info";
import { siteCopy } from "@/lib/stitch-copy";

export const metadata: Metadata = {
  title: `من نحن | ${siteCopy.brand.name}`,
  description: siteCopy.footer.blurb,
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-10 md:px-8 md:py-16">
      <h1 className="font-heading text-4xl font-bold tracking-tight text-foreground md:text-5xl">من نحن</h1>
      <div className="glass-panel space-y-4 rounded-2xl p-6 text-lg leading-relaxed text-muted-foreground">
        <p>
          <span className="font-bold text-foreground">
            {siteCopy.brand.name} — {siteCopy.brand.tagline}
          </span>
        </p>
        <p>{siteCopy.footer.blurb}</p>
        <p>{siteCopy.hero.subtitle}</p>
        <p className="font-semibold text-primary">🚚 {DELIVERY.sentence}</p>
      </div>
      <ContactCard />
    </div>
  );
}
