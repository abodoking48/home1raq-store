import { ProductForm } from "@/components/admin/product-form";
import { prisma } from "@/lib/prisma";

export default async function NewProductPage() {
  const categories = await prisma.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: { id: true, name: true, active: true },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-3xl">New product</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Add details and upload images to Supabase Storage.
        </p>
      </div>
      <ProductForm
        mode="create"
        initial={{
          name: "",
          description: "",
          price: "",
          compareAtPrice: "",
          onPromo: false,
          images: [],
          active: true,
          categoryId: "",
        }}
        categories={categories}
      />
    </div>
  );
}
