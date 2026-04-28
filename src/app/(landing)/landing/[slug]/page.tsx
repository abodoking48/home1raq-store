import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { LandingPageSkeleton } from "@/components/landing/landing-page-skeleton";
import { LandingPageView } from "@/components/landing/landing-page-view";
import { getLandingPagePayload } from "@/lib/landing-pages";

export const revalidate = 60;

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const initial = await getLandingPagePayload(slug);
  const title = initial?.settings.offerTitle?.trim()
    ? `${initial.settings.offerTitle} — Home1raq`
    : "عرض — Home1raq";
  return {
    title,
    description: "صفحة هبوط للتحويل — طلب سريع داخل العراق.",
  };
}

async function LandingBySlugContent({ params }: PageProps) {
  const { slug } = await params;
  const initial = await getLandingPagePayload(slug);
  if (!initial) notFound();
  return <LandingPageView initial={initial} />;
}

export default function LandingBySlug(props: PageProps) {
  return (
    <Suspense fallback={<LandingPageSkeleton />}>
      <LandingBySlugContent {...props} />
    </Suspense>
  );
}
