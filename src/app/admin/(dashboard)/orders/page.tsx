import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatIqd } from "@/lib/currency";
import { buttonVariants } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

function formatAddress(city: string, rawAddress: string) {
  const [district, ...rest] = rawAddress
    .split("—")
    .map((part) => part.trim())
    .filter(Boolean);
  const details = rest.join(" — ");

  return {
    city,
    district: district ?? "غير مذكور",
    details: details || rawAddress || "غير مذكور",
  };
}

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { items: { include: { product: true } } },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl">Orders</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Detailed guest checkout orders for confirmation and fulfillment.
          </p>
        </div>
        <Link
          href="/api/admin/orders/export"
          className={cn(
            buttonVariants({ variant: "outline" }),
            "rounded-full border-white/15",
          )}
        >
          Export Excel
        </Link>
      </div>

      <div className="glass-panel overflow-hidden rounded-2xl">
        <Table>
          <TableHeader>
            <TableRow className="border-white/10 hover:bg-transparent">
              <TableHead>When</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>Notes</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Items</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((o) => {
              const address = formatAddress(o.city, o.address);
              return (
                <TableRow key={o.id} className="border-white/10 align-top">
                  <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                    <div>{o.createdAt.toLocaleString("ar-IQ")}</div>
                    <div className="mt-1 text-[11px] opacity-70">
                      {o.id.slice(0, 8)}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{o.fullName}</TableCell>
                  <TableCell className="tabular-nums">
                    <a href={`tel:${o.phone}`} className="hover:text-primary">
                      {o.phone}
                    </a>
                  </TableCell>
                  <TableCell className="max-w-72 text-sm">
                    <div className="space-y-1 text-muted-foreground">
                      <p>
                        <span className="text-foreground">المدينة:</span> {address.city}
                      </p>
                      <p>
                        <span className="text-foreground">المنطقة:</span> {address.district}
                      </p>
                      <p className="line-clamp-3">
                        <span className="text-foreground">التفاصيل:</span>{" "}
                        {address.details}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-56 text-sm text-muted-foreground">
                    {o.notes?.trim() ? (
                      <p className="line-clamp-4">{o.notes}</p>
                    ) : (
                      <span className="text-xs opacity-70">لا توجد ملاحظات</span>
                    )}
                  </TableCell>
                  <TableCell className="tabular-nums text-primary">
                    {formatIqd(Number(o.total))}
                  </TableCell>
                  <TableCell className="min-w-72 max-w-96 text-sm text-muted-foreground">
                    <ul className="space-y-2">
                      {o.items.map((i) => (
                        <li
                          key={i.id}
                          className="rounded-lg border border-white/10 bg-black/20 px-2 py-1.5"
                        >
                          <p className="font-medium text-foreground">{i.product.name}</p>
                          <p className="text-xs">
                            الكمية: {i.quantity} ×{" "}
                            {formatIqd(Number(i.priceAtOrder))} ={" "}
                            {formatIqd(Number(i.priceAtOrder) * i.quantity)}
                          </p>
                        </li>
                      ))}
                    </ul>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
