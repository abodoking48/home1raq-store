import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { updatedAt: "desc" }],
    include: { _count: { select: { products: true } } },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl">Categories</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage storefront sections and sorting.
          </p>
        </div>
        <Link
          href="/admin/categories/new"
          className={cn(
            buttonVariants(),
            "btn-gradient-neon rounded-full px-6 font-semibold",
          )}
        >
          Add category
        </Link>
      </div>

      <div className="glass-panel overflow-hidden rounded-2xl">
        <Table>
          <TableHeader>
            <TableRow className="border-white/10 hover:bg-transparent">
              <TableHead>Name</TableHead>
              <TableHead>Icon</TableHead>
              <TableHead>External Icon</TableHead>
              <TableHead>Products</TableHead>
              <TableHead>Order</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-end">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((category) => (
              <TableRow key={category.id} className="border-white/10">
                <TableCell className="font-medium">{category.name}</TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {category.icon}
                </TableCell>
                <TableCell className="max-w-60 text-xs text-muted-foreground">
                  {category.iconUrl ? (
                    <a
                      href={category.iconUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="truncate text-primary hover:underline"
                    >
                      {category.iconUrl}
                    </a>
                  ) : (
                    "—"
                  )}
                </TableCell>
                <TableCell className="tabular-nums text-muted-foreground">
                  {category._count.products}
                </TableCell>
                <TableCell className="tabular-nums text-muted-foreground">
                  {category.sortOrder}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {category.active ? "Active" : "Hidden"}
                </TableCell>
                <TableCell className="text-end">
                  <Link
                    href={`/admin/categories/${category.id}/edit`}
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    Edit
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

