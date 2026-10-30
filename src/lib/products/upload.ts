import { randomUUID } from "crypto";
import { compressImage } from "@/lib/images/compress";
import { createServiceRoleClient } from "@/lib/supabase/admin";

export const STORAGE_BUCKET = "products";

const ALLOWED_EXTS = ["jpg", "jpeg", "png", "webp", "gif"];

export function safeImageExt(ext: string | undefined) {
  const e = ext?.toLowerCase();
  return e && ALLOWED_EXTS.includes(e) ? e : "jpg";
}

export class ProductImageUploadError extends Error {}

export function uploadErrorMessage(err: {
  message?: string;
  statusCode?: string;
}): string {
  const msg = err.message ?? "";
  const code = err.statusCode ?? "";
  if (/bucket not found/i.test(msg) || code === "404") {
    return `Storage bucket "${STORAGE_BUCKET}" does not exist. In Supabase: Storage → New bucket → name exactly "${STORAGE_BUCKET}" → Create → enable Public (for storefront image URLs).`;
  }
  return msg || "Upload failed";
}

/**
 * Compresses (see `compressImage`), uploads to `products/products/<uuid>.webp` and returns the public URL.
 * Shared by `/api/admin/upload` (product images and category icons) and the Telegram bot.
 */
export async function uploadProductImage(
  buffer: Buffer,
  ext: string | undefined,
  contentType?: string,
) {
  const compressed = await compressImage(buffer);
  if (compressed) return storeImage(compressed.buffer, compressed.ext, compressed.contentType);
  // Not decodable by sharp: keep the file as it came.
  return storeImage(buffer, ext, contentType);
}

/** Stores bytes as-is under a new name (never overwrites) and returns the public URL. */
export async function storeImage(buffer: Buffer, ext: string | undefined, contentType?: string) {
  const safeExt = safeImageExt(ext);
  const path = `products/${randomUUID()}.${safeExt}`;
  const type = contentType && contentType !== "image/jpg" ? contentType : `image/${safeExt === "jpg" ? "jpeg" : safeExt}`;
  const supabase = createServiceRoleClient();
  const { error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(path, buffer, {
      contentType: type,
      cacheControl: "31536000",
      upsert: false,
    });
  if (error) {
    console.error(error);
    throw new ProductImageUploadError(uploadErrorMessage(error));
  }
  const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
