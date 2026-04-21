import Link from "next/link";
import { LandingPixelScripts } from "@/components/landing/pixel-scripts";
import { cn } from "@/lib/utils";

export default function LandingGroupLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <LandingPixelScripts />
      <div className="relative min-h-screen bg-background">
        <header className="fixed start-0 end-0 top-0 z-30 flex items-center justify-between border-b border-white/10 bg-background/70 px-4 py-3 backdrop-blur-xl md:px-6">
          <Link
            href="/"
            className={cn(
              "font-heading text-sm font-bold tracking-tight text-foreground md:text-base",
            )}
          >
            Home1raq
          </Link>
          <Link
            href="/products"
            className="text-xs font-medium text-muted-foreground underline-offset-4 hover:text-primary hover:underline md:text-sm"
          >
            كل المنتجات
          </Link>
        </header>
        <div className="pt-14">{children}</div>
      </div>
    </>
  );
}
