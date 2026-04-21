import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth/admin";
import { createServiceRoleClient } from "@/lib/supabase/admin";

const STORAGE_BUCKET = "products";

function uploadErrorMessage(err: {
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

export async function POST(req: Request) {
  if (!(await getAdminUser())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json(
      {
        error:
          "Missing SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_URL. Add the service_role secret from Supabase → Project Settings → API to .env.local (server-only, never NEXT_PUBLIC_*).",
      },
      { status: 503 },
    );
  }

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Missing file" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const safeExt = ["jpg", "jpeg", "png", "webp", "gif"].includes(ext)
    ? ext
    : "jpg";
  const path = `products/${randomUUID()}.${safeExt}`;

  try {
    const supabase = createServiceRoleClient();
    const { error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(path, buffer, {
        contentType: file.type || `image/${safeExt}`,
        upsert: false,
      });
    if (error) {
      console.error(error);
      return NextResponse.json(
        { error: uploadErrorMessage(error) },
        { status: 500 },
      );
    }
    const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
    return NextResponse.json({ url: data.publicUrl });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Storage not configured or upload failed" },
      { status: 500 },
    );
  }
}
