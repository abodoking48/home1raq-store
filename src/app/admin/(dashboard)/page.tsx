import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminHomePage() {
  const [productCount, categoryCount, orderCount] = await Promise.all([
    prisma.product.count(),
    prisma.category.count(),
    prisma.order.count(),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-3xl text-foreground">Overview</h1>
        <p className="mt-2 text-muted-foreground">
          Stitch-aligned glass admin — project{" "}
          <span className="font-mono text-xs">15992768601551371687</span>
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="glass-panel rounded-2xl p-6">
          <p className="text-sm text-muted-foreground">Products</p>
          <p className="mt-2 font-heading text-4xl text-primary">{productCount}</p>
        </div>
        <div className="glass-panel rounded-2xl p-6">
          <p className="text-sm text-muted-foreground">Categories</p>
          <p className="mt-2 font-heading text-4xl text-primary">{categoryCount}</p>
        </div>
        <div className="glass-panel rounded-2xl p-6">
          <p className="text-sm text-muted-foreground">Orders</p>
          <p className="mt-2 font-heading text-4xl text-primary">{orderCount}</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-3">
        <Link
          href="/admin/products/new"
          className={cn(
            buttonVariants(),
            "btn-gradient-neon rounded-full px-6 font-semibold",
          )}
        >
          Add product
        </Link>
        <Link
          href="/admin/products"
          className={cn(buttonVariants({ variant: "outline" }), "rounded-full")}
        >
          Manage products
        </Link>
        <Link
          href="/admin/categories"
          className={cn(buttonVariants({ variant: "outline" }), "rounded-full")}
        >
          Manage categories
        </Link>
        <Link
          href="/admin/orders"
          className={cn(buttonVariants({ variant: "outline" }), "rounded-full")}
        >
          View orders
        </Link>
      </div>
    </div>
  );
}
