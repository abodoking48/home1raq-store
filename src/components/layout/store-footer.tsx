import Link from "next/link";
import { Home } from "lucide-react";
import { siteCopy } from "@/lib/stitch-copy";

export function StoreFooter() {
  const f = siteCopy.footer;
  const year = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-white/5 bg-[#0a0c0b] pt-16">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-4 pb-12 md:grid-cols-4 md:px-8">
        <div className="space-y-6 md:col-span-2">
          <div className="flex items-center gap-2">
            <div className="flex size-10 items-center justify-center rounded-xl border border-primary/20 bg-primary/10">
              <Home className="size-5 text-primary" aria-hidden />
            </div>
            <span className="font-heading text-2xl font-black text-foreground">
              {siteCopy.brand.name}
            </span>
          </div>
          <p className="max-w-sm text-lg leading-relaxed text-white/40">
            {f.blurb}
          </p>
        </div>
        <div>
          <h4 className="mb-6 text-lg font-bold text-foreground">{f.quickTitle}</h4>
          <ul className="space-y-4">
            {f.quickLinks.map((l) => (
              <li key={l.href + l.label}>
                <Link
                  href={l.href}
                  className="text-white/40 transition-colors hover:text-primary"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="mb-6 text-lg font-bold text-foreground">{f.socialTitle}</h4>
          <ul className="space-y-4">
            {f.socialLinks.map((l) => (
              <li key={l.label}>
                <a
                  href={l.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/40 transition-colors hover:text-primary"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="mx-auto flex max-w-7xl items-center justify-center border-t border-white/5 px-4 py-8 text-sm text-white/20 md:justify-start md:px-8">
        <p>
          © {year} {f.copyright}
        </p>
      </div>
    </footer>
  );
}
