import { notFound } from "next/navigation";
import { CategoryForm } from "@/components/admin/category-form";
import { prisma } from "@/lib/prisma";

type Props = { params: Promise<{ id: string }> };

export default async function EditCategoryPage({ params }: Props) {
  const { id } = await params;
  const category = await prisma.category.findUnique({
    where: { id },
  });
  if (!category) notFound();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-3xl">Edit category</h1>
        <p className="mt-1 text-sm text-muted-foreground">{category.name}</p>
      </div>
      <CategoryForm
        mode="edit"
        categoryId={category.id}
        initial={{
          name: category.name,
          iconUrl: category.iconUrl ?? "",
          description: category.description ?? "",
          sortOrder: String(category.sortOrder),
          active: category.active,
        }}
      />
    </div>
  );
}

