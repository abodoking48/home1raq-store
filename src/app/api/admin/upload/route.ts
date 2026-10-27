import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth/admin";
import {
  ProductImageUploadError,
  uploadProductImage,
} from "@/lib/products/upload";

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
  const ext = file.name.split(".").pop();

  try {
    const url = await uploadProductImage(buffer, ext, file.type);
    return NextResponse.json({ url });
  } catch (e) {
    if (e instanceof ProductImageUploadError) {
      return NextResponse.json({ error: e.message }, { status: 500 });
    }
    console.error(e);
    return NextResponse.json(
      { error: "Storage not configured or upload failed" },
      { status: 500 },
    );
  }
}
