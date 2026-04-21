import * as XLSX from "xlsx";
import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth/admin";
import { prisma } from "@/lib/prisma";

function splitAddress(city: string, rawAddress: string) {
  const [district, ...rest] = rawAddress
    .split("—")
    .map((part) => part.trim())
    .filter(Boolean);

  return {
    city,
    district: district ?? "",
    details: rest.join(" — ") || rawAddress || "",
  };
}

export async function GET() {
  if (!(await getAdminUser())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    take: 500,
    include: { items: { include: { product: true } } },
  });

  const rows = orders.flatMap((order) => {
    const address = splitAddress(order.city, order.address);
    return order.items.map((item, index) => ({
      order_id: order.id,
      order_date: order.createdAt.toISOString(),
      customer_name: order.fullName,
      phone: order.phone,
      city: address.city,
      district: address.district,
      address_details: address.details,
      notes: order.notes ?? "",
      order_total_iqd: Number(order.total),
      item_name: item.product.name,
      item_quantity: item.quantity,
      item_price_iqd: Number(item.priceAtOrder),
      item_total_iqd: Number(item.priceAtOrder) * item.quantity,
      item_row: index + 1,
    }));
  });

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(rows);
  XLSX.utils.book_append_sheet(wb, ws, "orders");
  const buffer = XLSX.write(wb, { bookType: "xlsx", type: "buffer" });

  const fileName = `orders-${new Date().toISOString().slice(0, 10)}.xlsx`;
  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${fileName}"`,
      "Cache-Control": "no-store",
    },
  });
}

