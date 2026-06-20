export const dynamic = 'force-dynamic';

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

    const body = await req.json();
    const product_id = Number(body.product_id); // ✅ always number
    if (!product_id) {
      return NextResponse.json({ error: "product_id required" }, { status: 400 });
    }

    // Check existing
    const { data: existing, error: selectErr } = await supabaseAdmin
      .from("favorites")
      .select("id")
      .eq("user_id", userId)
      .eq("product_id", product_id)
      .maybeSingle();

    if (selectErr) {
      console.error("Select error:", selectErr);
      return NextResponse.json({ error: selectErr.message }, { status: 500 });
    }

    if (existing) {
      // Remove
      const { error: deleteErr } = await supabaseAdmin
        .from("favorites")
        .delete()
        .eq("user_id", userId)
        .eq("product_id", product_id);

      if (deleteErr) {
        console.error("Delete error:", deleteErr);
        return NextResponse.json({ error: deleteErr.message }, { status: 500 });
      }
      return NextResponse.json({ success: true, action: "removed" });
    } else {
      // Add
      const { error: insertErr } = await supabaseAdmin
        .from("favorites")
        .insert({
          user_id: userId,
          product_id: product_id,
          created_at: new Date().toISOString(),
        });

      if (insertErr) {
        console.error("Insert error:", insertErr);
        return NextResponse.json({ error: insertErr.message }, { status: 500 });
      }
      return NextResponse.json({ success: true, action: "added" });
    }
  } catch (err: any) {
    console.error("Favorites POST error:", err);
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
      console.error("Favorites GET error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, favorites: data ?? [] });
  } catch (err: any) {
    console.error("Favorites GET catch:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}