import { notFound } from "next/navigation";
import { ProductForm } from "@/components/admin/product-form";
import { prisma } from "@/lib/prisma";

type Props = { params: Promise<{ id: string }> };

export default async function EditProductPage({ params }: Props) {
  const { id } = await params;
  const [product, categories] = await Promise.all([
    prisma.product.findUnique({ where: { id } }),
    prisma.category.findMany({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: { id: true, name: true, active: true },
    }),
  ]);
  if (!product) notFound();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-3xl">Edit product</h1>
        <p className="mt-1 text-sm text-muted-foreground">{product.name}</p>
      </div>
      <ProductForm
        mode="edit"
        productId={product.id}
        initial={{
          name: product.name,
          description: product.description,
          price: String(product.price),
          compareAtPrice: product.compareAtPrice != null ? String(product.compareAtPrice) : "",
          onPromo: product.onPromo,
          images: product.images,
          active: product.active,
          categoryId: product.categoryId ?? "",
        }}
        categories={categories}
      />
    </div>
  );
}
