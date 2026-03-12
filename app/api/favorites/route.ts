import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { auth } from "@clerk/nextjs/server";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { product_id } = await req.json();
    if (!product_id) {
      return NextResponse.json({ error: "product_id required" }, { status: 400 });
    }
    const { data: existing } = await supabaseAdmin
      .from("favorites")
      .select("id")
      .eq("user_id", userId)
      .eq("product_id", product_id)
      .maybeSingle();
    if (existing) {
      await supabaseAdmin.from("favorites").delete().eq("user_id", userId).eq("product_id", product_id);
      return NextResponse.json({ success: true, action: "removed" });
    } else {
      await supabaseAdmin.from("favorites").insert({ user_id: userId, product_id: product_id, created_at: new Date().toISOString() });
      return NextResponse.json({ success: true, action: "added" });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ success: true, favorites: [] });
    }
    const { data, error } = await supabaseAdmin
      .from("favorites")
      .select("id, product_id, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ success: true, favorites: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}