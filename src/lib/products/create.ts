import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slug";

/** Shared by the admin API (`/api/admin/products`) and the Telegram bot. */
export const productCreateSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  price: z.number().positive(),
  compareAtPrice: z.number().positive().optional().nullable(),
  onPromo: z.boolean().optional(),
  images: z.array(z.string().url()).default([]),
  active: z.boolean().optional(),
  categoryId: z.string().cuid().optional().nullable(),
});

export type ProductCreateInput = z.infer<typeof productCreateSchema>;

/** `slugify(name)`, suffixed `-1`, `-2`… until no product uses it. */
export async function uniqueProductSlug(name: string) {
  const baseSlug = slugify(name);
  let slug = baseSlug;
  let n = 1;
  while (await prisma.product.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${n++}`;
  }
  return slug;
}

export async function createProduct(data: ProductCreateInput) {
  const slug = await uniqueProductSlug(data.name);
  const product = await prisma.product.create({
    data: {
      name: data.name,
      slug,
      description: data.description,
      price: data.price,
      compareAtPrice: data.compareAtPrice ?? null,
      onPromo: data.onPromo ?? false,
      images: data.images,
      active: data.active ?? true,
      categoryId: data.categoryId || null,
    },
    include: { category: true },
  });

  // Listing pages use ISR (revalidate = 3600); refresh so the new product shows now.
  try {
    revalidatePath("/");
    revalidatePath("/products");
  } catch (e) {
    console.error("[products] revalidate failed:", e);
  }

  return product;
}
