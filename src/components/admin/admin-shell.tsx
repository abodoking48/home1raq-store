import Link from "next/link";
import { signOutAdmin } from "@/app/admin/actions";
import { createClient } from "@/lib/supabase/server";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/landing", label: "Landing Page Manager" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/orders", label: "Orders" },
];

export async function AdminShell({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <div className="flex gap-2 border-b border-white/[0.08] bg-[#131313]/90 p-3 md:hidden">
        {nav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-lg px-2 py-1 text-xs text-muted-foreground hover:bg-white/[0.06] hover:text-foreground"
          >
            {item.label}
          </Link>
        ))}
      </div>
      <aside className="hidden w-56 shrink-0 border-r border-white/[0.08] bg-[#131313]/90 p-4 md:block">
        <p className="px-2 font-heading text-lg text-gradient-neon">Home1raq</p>
        <p className="mt-1 truncate px-2 text-xs text-muted-foreground">
          {user?.email}
        </p>
        <nav className="mt-8 flex flex-col gap-1">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-white/[0.06] hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <form className="mt-8 px-2" action={signOutAdmin}>
          <button
            type="submit"
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "w-full rounded-full border-white/15",
            )}
          >
            Sign out
          </button>
        </form>
      </aside>
      <div className="min-w-0 flex-1 p-4 md:p-8">{children}</div>
    </div>
  );
}
