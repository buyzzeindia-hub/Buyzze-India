export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { auth } from "@clerk/nextjs/server";

const getSupabaseAdmin = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

export async function DELETE(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ error: "Product ID required" }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdmin();

    const { data: product, error: fetchError } = await supabaseAdmin
      .from("products")
      .select("owner_id, images")
      .eq("id", id)
      .single();

    if (fetchError || !product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    if (product.owner_id !== userId) {
      return NextResponse.json({ error: "Forbidden — not your product" }, { status: 403 });
    }

    if (product.images && product.images.length > 0) {
      const filePaths = product.images.map((url: string) => {
        const parts = url.split("/products-images/");
        return parts[1] || "";
      }).filter(Boolean);

      if (filePaths.length > 0) {
        await supabaseAdmin.storage
          .from("products-images")
          .remove(filePaths);
      }
    }

    const { error: deleteError } = await supabaseAdmin
      .from("products")
      .delete()
      .eq("id", id);

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}