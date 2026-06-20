export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { auth } from "@clerk/nextjs/server";

const getSupabaseAdmin = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

export async function PATCH(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json({ error: "Product ID required" }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdmin();

    const { data: existing } = await supabaseAdmin
      .from("products")
      .select("owner_id")
      .eq("id", id)
      .single();

    if (existing?.owner_id !== userId) {
      return NextResponse.json({ error: "Forbidden — not your product" }, { status: 403 });
    }

    const { error } = await supabaseAdmin
      .from("products")
      .update({
        title: data.title,
        description: data.description,
        price: Number(data.price),
        brand: data.brand,
        model: data.model,
        ram: data.ram,
        storage: data.storage,
        color: data.color,
        condition: data.condition,
        category: data.category,
        city: data.city,
        state: data.state,
        images: data.images,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      console.error("Update product error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("PATCH error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}