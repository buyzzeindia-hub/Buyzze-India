export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { auth } from "@clerk/nextjs/server";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const product_id = searchParams.get("product_id");
    if (!product_id) return NextResponse.json({ error: "product_id required" }, { status: 400 });

    const { data, error } = await supabaseAdmin
      .from("reviews")
      .select("id, rating, comment, created_at, reviewer_id, profiles(full_name, avatar_url)")
      .eq("product_id", product_id)
      .order("created_at", { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const avg = data && data.length > 0
      ? data.reduce((sum: number, r: any) => sum + r.rating, 0) / data.length : 0;

    return NextResponse.json({
      success: true, reviews: data,
      average: Math.round(avg * 10) / 10,
      total: data?.length || 0,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { product_id, rating, comment } = await req.json();
    if (!product_id || !rating) return NextResponse.json({ error: "product_id and rating required" }, { status: 400 });
    if (rating < 1 || rating > 5) return NextResponse.json({ error: "Rating must be 1-5" }, { status: 400 });

    const { data: product } = await supabaseAdmin
      .from("products").select("owner_id").eq("id", product_id).single();
    if (product?.owner_id === userId)
      return NextResponse.json({ error: "Cannot review your own product" }, { status: 400 });

    const { data, error } = await supabaseAdmin
      .from("reviews")
      .upsert({
        product_id, reviewer_id: userId, rating,
        comment: comment?.trim() || null,
        created_at: new Date().toISOString(),
      }, { onConflict: "product_id,reviewer_id" })
      .select().single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, review: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}