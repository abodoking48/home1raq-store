import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatIqd } from "@/lib/currency";
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

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    orderBy: { updatedAt: "desc" },
    include: { category: true },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl">Products</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Full CRUD, images via Supabase Storage.
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className={cn(
            buttonVariants(),
            "btn-gradient-neon rounded-full px-6 font-semibold",
          )}
        >
          Add product
        </Link>
      </div>

      <div className="glass-panel overflow-hidden rounded-2xl">
        <Table>
          <TableHeader>
            <TableRow className="border-white/10 hover:bg-transparent">
              <TableHead className="w-20">Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-end">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((p) => (
              <TableRow key={p.id} className="border-white/10">
                <TableCell>
                  <div className="relative h-12 w-12 overflow-hidden rounded-lg bg-[#131313]">
                    {p.images[0] ? (
                      <Image
                        src={p.images[0]}
                        alt=""
                        fill
                        sizes="48px"
                        className="object-cover"
                      />
                    ) : (
                      <span className="flex h-full items-center justify-center text-xs text-muted-foreground">
                        —
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="font-medium">{p.name}</TableCell>
                <TableCell className="tabular-nums">
                  {formatIqd(Number(p.price))}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {p.category?.name ?? "Uncategorized"}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  <span className="flex flex-wrap items-center gap-2">
                    {p.active ? "Active" : "Hidden"}
                    {p.onPromo && (
                      <span className="rounded-full bg-primary/20 px-2 py-0.5 text-[10px] font-semibold text-primary">
                        Promo
                      </span>
                    )}
                  </span>
                </TableCell>
                <TableCell className="text-end">
                  <Link
                    href={`/admin/products/${p.id}/edit`}
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
