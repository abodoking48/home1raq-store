import { CategoryForm } from "@/components/admin/category-form";

export default function NewCategoryPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-3xl">New category</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Add a storefront section for products.
        </p>
      </div>
      <CategoryForm
        mode="create"
        initial={{
          name: "",
          iconUrl: "",
          description: "",
          sortOrder: "0",
          active: true,
        }}
      />
    </div>
  );
}

